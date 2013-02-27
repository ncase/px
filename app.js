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


app.get('/test',function(request,response){
    
    // Upload art
    request = sunny.connection.getContainer("ncase-px");
    request.on('end', function (results, meta) {

        var containerObj = results.container;
        console.log("GET container: %s", containerObj.name);
       
        var request = containerObj.putBlob("foobar.txt",{ encoding: "utf8" });
        request.on('end', function (results, meta) {
            var blobObj = results.blob;
            console.log("PUT blob: %s", blobObj.name);
            response.end();
        });
        request.end();

    });
    request.end();

});


////////////////////////////////////////////////
// REST API
////////////////////////////////////////////////

// Return all art metadata
app.get('/art', function(request, response){
    
});

// Upload a piece of art & metadata
app.post('/art', function(request, response){
    
    // Upload art
    request = sunny.connection.getContainer("ncase-px");
    request.on('end', function (results, meta) {

        console.log("GET container: %s", containerObj.name);
        var containerObj = results.container;
       
        var request = containerObj.putBlob("foobar.txt",{ encoding: "utf8" });
        request.on('end', function (results, meta) {
            var blobObj = results.blob;
            console.log("PUT blob: %s", blobObj.name);
            response.end();
        });
        request.end();

    });
    request.end();

});



////////////////////////////////////////////////
// Hey, listen.
////////////////////////////////////////////////

var port = process.env.PORT || 80;
app.listen(port);
console.log('Express server started on port '+port);