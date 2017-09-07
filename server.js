var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoDB = require('mongodb').MongoClient;
var io = require('socket.io');
var server = app.listen(8080);
var socketServer = io(server);

app.use(express.static('./'));

// MONGO CONNECT
mongoDB.connect('mongodb://127.0.0.1/mongochat', function (err, db){
    if(err){
        throw err;
    }
    console.log("MongoDB Connected");

    app.get('/', function(req, res){
        res.sendFile('./index.html', {root: './'});
    });

// SOCKET CONNECT
    socketServer.on('connection', function(socket){
        var chat = db.collection('chats');

        //FUNCTION TO SEND STATUS
        sendStatus = function(status){
            socket.emit('status', status);
        };

// GET CHATS FROM MONGO DATABASE
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }
            // EMMIT MESSAGE
            socket.emit('output', res);
        });

// INPUT EVENTS
        socket.on('input', function(data){
            var name = data.name;
            var message = data.message;
            // CHECK FOR NAME AND MESSAGE
            if(name == '' || message == '') {
                sendStatus('please enter a name and message');
                // INSERT MESSAGE
            } else {
                chat.insert({name: name, message: message}, function(){
                    socket.emit('output', [data]);
                    // SEND STATUS OBJECT
                    sendStatus({
                        message: 'Message Sent',
                        clear: true
                    });
                });
            }
        });
        // HANDLE CLEAR
        socket.on('clear', function(data){
            //REMOVE CHATS FROM COLELCTIONG
            chat.remove({}, function(){
                // EMIT CLEARED MESSAGE
                socket.emit('cleared');
            });
        });
    });

}); // END OF MONGODB
