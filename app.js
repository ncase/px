////////////////////////////////////////////////
// SETUP
////////////////////////////////////////////////

// Express
var express = require('express');
var app = express();
app.use(express.bodyParser());
app.use('/', express.static(__dirname + '/static'));

// Mongo
var mongo = require('mongodb').MongoClient;
var mongoURI = process.env.MONGOLAB_URI || process.env.MONGO_URI;

// Sunny
var sunny = require("sunny").Configuration.fromEnv();


////////////////////////////////////////////////
// REST API
////////////////////////////////////////////////

// Return all art metadata
app.get('/art', function(request, response){
    
    mongo.connect(mongoURI, function(err, db) {
        db.collection('art').find().toArray(function(err,items){
            var json = JSON.stringify(items);
            response.end(json);
            db.close();
        });
    });

});

// Upload a piece of art & metadata
app.post('/art', function(request, response){

    // METAINFO
    var author = request.body.author || "";
    var image = request.body.image || "";
    image = image.replace(/^data:image\/\w+;base64,/,"");

    // Change this bucket name to whatever yours is
    var bucket = "ncase-px";

    // Random filename. If there's a collision, well, crap.
    var filename = (Math.random().toString(36).substr(2)) + (Math.random().toString(36).substr(2));
    filename += ".png";
    
    // Request storage container
    var req = sunny.connection.getContainer(bucket);
    req.on('end', function (results, meta) {

        // Container info
        var container = results.container;
        console.log("GET container: "+container.name);
       
        // Write image blob
        var stream = container.putBlob(filename,{ encoding:"base64" });
        stream.write(image,"base64");

        stream.on('end', function (results, meta) {
            
            // Blob info
            console.log("PUT blob: "+results.blob.name);
            var data = {
                author: author,
                url: "http://"+process.env.SUNNY_AUTH_URL+"/"+bucket+"/"+filename
            };

            // Record in database
            mongo.connect(mongoURI, function(err, db) {
                db.collection('art').insert( data, function(err,inserted){

                    // Finally Respond
                    var json = JSON.stringify(inserted[0]);
                    console.log("Inserted art metadata: "+json);
                    response.end(json);
                    db.close();

                });
            });

        });
        stream.end();

    });
    req.end();

});



////////////////////////////////////////////////
// Hey, listen.
////////////////////////////////////////////////

var port = process.env.PORT || 80;
app.listen(port);
console.log('Express server started on port '+port);