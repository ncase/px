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
    
});

// Upload a piece of art & metadata
app.post('/art', function(request, response){

    // METAINFO
    var author = request.body.author || "";
    var dataURL = request.body.dataURL;
    if(!dataURL) throw new Error("You need a png dataURL");

    // Change this bucket name to whatever yours is
    var bucket = "ncase-px";

    // Random filename. If there's a collision, well crap.
    var filename = "dot.png";
    
    // Request storage container
    var req = sunny.connection.getContainer(bucket);
    req.on('end', function (results, meta) {

        // Container info
        var container = results.container;
        console.log("GET container: %s", container.name);
       
        // Write blob
        var stream = container.putBlob(filename,{ encoding:"base64" });
        stream.write("iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==","base64");

        stream.on('end', function (results, meta) {
            
            // Blob info
            console.log("PUT blob: %s", results.blob.name);
            var data = {
                url: "http://"+process.env.SUNNY_AUTH_URL+"/"+bucket+"/"+filename
            };

            // Record in database
            mongo.connect(mongoURI, function(err, db) {
                db.collection('art').insert( data, function(err,inserted){

                    // Finally Respond
                    console.log("Inserted art metadata");
                    response.end( JSON.stringify(inserted[0]) );

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