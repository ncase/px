 
/////////////////
// SETUP

// Express
var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use(express.bodyParser());
app.use('/public', express.static(__dirname + '/public'));

// Mongo
var mongo = require('mongodb').MongoClient;
var mongoURI = process.env.MONGOLAB_URI || "mongodb://heroku_app11777194:bhpqjfsflekfqqgg9u1vormgt8@ds043487.mongolab.com:43487/heroku_app11777194";
//|| "mongodb://heroku:c7a5b464864b576c8abd207dd6707495@linus.mongohq.com:10019/app11777194";

// Sendgrid
var SendGrid = require('sendgrid').SendGrid;
var sendgrid = new SendGrid(
	process.env.SENDGRID_USERNAME || "app11777194@heroku.com",
	process.env.SENDGRID_PASSWORD || "nssohe6p"
);

/////////////////
// HTTP Requests

app.get('/', function(request, response){

    mongo.connect(mongoURI, function(err, db) {
        if(err) { return console.dir(err); }
        db.collection('transactions').find().toArray( function(err,items){
            if(err) { return console.dir(err); }
            response.render('index.ejs',{ docs:items });
        });
    });

    //response.render('index.ejs');
    
});

app.get('/thanks', function(request, response){
    
    var txn_id = request.query.tx;
    if(txn_id){

        mongo.connect(mongoURI, function(err, db) {
            if(err) { return console.dir(err); }
            db.collection('transactions').find({txn_id:txn_id}).toArray( function(err,items){
                if(err) { return console.dir(err); }
                if(items.length==0){
                    response.redirect('/'); // You cheat
                }else{
                    response.render('thanks.ejs',{ doc:items[0] });
                }
            });
        });

    }else{
        response.redirect('/');
    }

    //response.render('thanks.ejs'); 

});

////////////////
// Paypal

app.post('/ipn', function(request, response){

	mongo.connect(mongoURI, function(err, db) {

  		if(err) { return console.dir(err); }

  		// Database
  		var data = request.body;
  		try{
  			data.custom = JSON.parse(data.custom);
  		}catch(err){
  			console.dir(err);
  			data.custom = {};
  		}
  		db.collection('transactions').insert( data, function(err,inserted){
  			if(err) { return console.dir(err); }
  			response.end();
  		});

  		// Email
  		var toEmail = data.custom.email;
  		var tx = data.txn_id;
  		if(toEmail){
	  		sendgrid.send({
	  
				to: toEmail,
				from: 'nutcasenightmare@gmail.com',
				subject: 'Thank you!',
				text: 'Get your Juice Box at: http://juice.craftyy.com/thanks?tx='+tx+'\n\nFeel free to email me comments & questions!\n~ Nick'

			}, function(success, message) {
				if(!success) console.log(message);
			});
	  	}

 	});

});

/////////////////
// Hey, listen.

var port = process.env.PORT || 80;
app.listen(port);
console.log('Express server started on port '+port);
