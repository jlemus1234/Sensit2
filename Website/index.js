var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var mongodb = require('mongodb');
var uri = 'mongodb://heroku_0j34fpvs:r38chnctdk7dh92g8ca8vd3me@ds259175.mlab.com:59175/heroku_0j34fpvs';

var db = mongodb.MongoClient.connect(uri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/graph', function(request, response) {
    response.sendFile(__dirname + '/public/jaloGraph.html');
});

app.get('/jalo', function(request, response) {
  //response.render('public/index.html');
  //db.collection('players').drop();
  	response.header("Access-Control-Allow-Origin","*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
 	response.set('Content-Type', 'text/html');
	var indexPage = '';
    db.collection('jalo', function(er,collection) {
    	collection.find().toArray(function(err,cursor) {
    		if(!err) {
    			indexPage += "<!DOCTYPE HTML><html><head><title>JALO</title><link href = 'main.css' rel = 'stylesheet'/></head><body><h1>JALO</h1>";
    			for (var count = 0; count < cursor.length; count++) {
    				indexPage += "<p>" + cursor[count].created_at + "</p>";
    			}
    			indexPage += "</body></html>"
    			response.send(indexPage);
    		} else {
    			response.send('<!DOCTYPE HTML><html><head><title>ERROR?</title></head></html>');
    		};
    	});
    });
});


app.get('/jalo/data', function(request, response) {
  //response.render('public/index.html');
  //db.collection('players').drop();
  	response.header("Access-Control-Allow-Origin","*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
 	response.set('Content-Type', 'text/html');
	var indexPage = '';
    db.collection('jalo', function(er,collection) {
    	collection.find().toArray(function(err,cursor) {
    		if(!err) {
    			var data = {"jalo": cursor};
    			response.send(data);
    		} else {
    			response.send({"error": "server error"});
    		};
    	});
    });
});

app.get('/jalo/back', function(request, response) {
  //response.render('public/index.html');
  //db.collection('players').drop();
    response.header("Access-Control-Allow-Origin","*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    response.set('Content-Type', 'text/html');
    var indexPage = '';
    db.collection('back', function(er,collection) {
        collection.find().toArray(function(err,cursor) {
            if(!err) {
                var data = {"back": cursor};
                response.send(data);
            } else {
                response.send({"error": "server error"});
            };
        });
    });
});


/*
app.get('/players', function(request, response) {
  //response.render('public/index.html');
  //db.collection('players').drop();
  	response.header("Access-Control-Allow-Origin","*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
 	response.set('Content-Type', 'text/html');
	var indexPage = '';
    db.collection('players', function(er,collection) {
    	collection.find().sort({created_at:-1}).toArray(function(err,cursor) {
    		if(!err) {
    			indexPage += "<!DOCTYPE HTML><html><head><title>Players</title><link href = 'main.css' rel = 'stylesheet'/></head><body><h1>Players</h1>";
    			for (var count = 0; count < cursor.length; count++) {
    				indexPage += "<p>" + cursor[count].username + " " + cursor[count].userid + " " + cursor[count].score + " " +
                    + cursor[count].lat + " " + cursor[count].lng + " "+ cursor[count].created_at + "</p>";
    			}
    			indexPage += "</body></html>"
    			response.send(indexPage);
    		} else {
    			response.send('<!DOCTYPE HTML><html><head><title>ERROR?</title></head></html>');
    		};
    	});
    });
});
*/

app.post('/submit', function(request, response) {
	console.log("Received a request");
	response.header("Access-Control-Allow-Origin","*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
//	var userid1 = parseInt(request.body.userid);
//    var username1 = request.body.username;
    //
 //   console.log(userid1);
  //  console.log(username1);
    var date = new Date();

 //   if(userid1 == null || isNaN(userid1) || username1 == null){
//    	response.json({error:"incorrectly formatted data"});
//    }else{
    		db.collection('jalo', function(error, coll){
    			coll.insertOne({created_at: date}, function(error, saved) {
    				if(error) {
    					console.log("Error: " + error);
    					response.send(500);
    				}
    				else {
    					db.collection('jalo', function(er,collection) {
    						collection.find({}).toArray(function(err,cursor) {
    							if(!err) {
    								var data = {"jalo": cursor};
    								response.send(data);
    								} else {
    									response.send({"error": "server error"});
    								};
    							}
    						);
    					});
    				};
    			});
    		});
//    	}
});


app.post('/enviar', function(request, response) {
    console.log("Received a request");
    response.header("Access-Control-Allow-Origin","*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
//  var userid1 = parseInt(request.body.userid);
//    var username1 = request.body.username;
    //
 //   console.log(userid1);
  //  console.log(username1);
    var date = new Date();

 //   if(userid1 == null || isNaN(userid1) || username1 == null){
//      response.json({error:"incorrectly formatted data"});
//    }else{
            db.collection('back', function(error, coll){
                coll.insertOne({created_at: date}, function(error, saved) {
                    if(error) {
                        console.log("Error: " + error);
                        response.send(500);
                    }
                    else {
                        db.collection('back', function(er,collection) {
                            collection.find({}).toArray(function(err,cursor) {
                                if(!err) {
                                    var data = {"back": cursor};
                                    response.send(data);
                                    } else {
                                        response.send({"error": "server error"});
                                    };
                                }
                            );
                        });
                    };
                });
            });
//      }
});



/*
    if(userid1 == null || isNaN(userid1) || username1 == null){
    	response.json({error:"incorrectly formatted data"});
    }else{
    		db.collection('jalo', function(error, coll){
    			coll.insertOne({created_at: date}, function(error, saved) {
    				if(error) {
    					console.log("Error: " + error);
    					response.send(500);
    				}
    				else {
    					db.collection('players', function(er,collection) {
    						collection.find({}).toArray(function(err,cursor) {
    							if(!err) {
    								var data = {"players": cursor};
    								response.send(data);
    								} else {
    									response.send({"error": "server error"});
    								};
    							}
    						);
    					});
    				};
    			});
    		});
    	}
});
*/
