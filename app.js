var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

var W = 100; // world width
var H = 100; // world height

var curId = 0;
var entities = {};
var lastUpdateCount = 0;
var updateCount = 0;
io.on('connection', function(socket){
    var e = {x: Math.random() * W, y: Math.random() * H, id: curId++};
    entities[e.id] = e;
    socket.on('move', function(x, y){
        // clamp
        e.x = Math.min(Math.max(x, 0), W);
        e.y = Math.min(Math.max(y, 0), H);
    });

    socket.on('disconnect', function(){
        delete entities[e.id];
    });

    // say we are ready
    socket.emit('ready', e);
});

setInterval(function () {
    if (Object.keys(entities).length > 0) {
        ++updateCount;
        io.sockets.emit('update', entities);
    }
}, 100);

setInterval(function () {
    var diff = updateCount - lastUpdateCount;
    var clients = Object.keys(entities).length;
    console.log('con:', clients, diff, diff / clients);
}, 1000);
