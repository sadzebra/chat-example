// Setup basic express server
var express   = require('express');
var app       = express();
var path      = require('path');
// var server    = require('http').createServer(app);

var http = require('http').Server(app);
var io = require('socket.io')(http);

// var io        = require('../..')(server);
var port      = process.env.PORT || 3000;

var easymongo   = require('easymongo');
var mongo       = new easymongo('mongodb://chat-user:ChatUserPwd@ds143030.mlab.com:43030/chat-example');
var posts       = mongo.collection('posts');
var users       = mongo.collection('users');
var chatRooms   = mongo.collection('chatrooms');

var chatId;

http.listen(port, function () {
  console.log('Server listening at port', port);
});

/*
  Routing
*/

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  console.log("Root");
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/create', function(req, res){
  console.log("Create new chatroom");
  // Make Random ID
  chatId = Math.round((Math.random() * 1000000));
  // Store chat on DB
  chatRooms.save({id:chatId, date: Date()}).then(function(data){
    res.redirect('/chat/'+data._id);
  });
});

app.get('/chat/:id', function(req, res){
  console.log("Chatroom page");

  // Display chat page
  res.sendFile(__dirname + '/public/chat.html');

});

// Keep count of number of users
var numUsers = 0;

/*
  Sockets
*/

io.on('connection', function (socket) {
  var addedUser = false;

  console.log("User connected");

  socket.on('load', function(something){
    console.log("On Load server", something);
    posts.find({chatId: chatId}).then(function(chatHistory){
      console.log("Emit Chat history back to client");
      console.log("Socket is: ", socket.id);
      socket.emit('chat history', chatHistory);
    })
  });


  // socket.on('chat history', function(){
  //   console.log("Got Chat History on Server");
  //   console.log("get chat history");
  //
  //   socket.emit("chat history", "something");
    // posts.find({chatId: chatId}).then(function(chatHistory){
    //   console.log("Emit Chat history back to client");
    //   console.log("Socket is: ", socket.id);
    //   socket.emit('chat history', chatHistory);
    // })
  // });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {

    let broadcastMessage = {
      username: socket.username,
      message: data,
      chatId: chatId
    }

    // Store the message chat
    posts.save(broadcastMessage, function(storedMessage){
      console.log("Message Saved");
    });

    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', broadcastMessage);
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });

    let userData = {
      username: socket.username,
      numUsers: numUsers,
      blocked: false
    };

    users.find({username: userData.username}).then(function(user){
      if( user === undefined || user.length === 0 ){
        users.save(userData).then(function(userRecord){
          console.log("User Saved", userRecord);
        })
      }
      else if(user.isBlocked)
        return; // NOTE: Need better error handling for this
    });

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
