var helper = require('./helper');
var net = require('net');
var port = process.env.PORT || 3000;
var W = 100; // world width
var H = 100; // world height

var curId = 0;
var entities = {};
var lastUpdateCount = 0;
var updateCount = 0;
var socketCount = 0;
var sendBuffer = new Buffer(1 * 1024 * 1024);
var bootTick = +new Date();
var server = net.createServer(function (socket) {
    ++socketCount;
    var e = {x: Math.random() * W, y: Math.random() * H, id: curId++, socket: socket};
    var deserializer = helper.createDeserializer(function (buf, cur) {
        var x = buf.readFloatLE(cur + 0);
        var y = buf.readFloatLE(cur + 4);

        // clamp
        e.x = Math.min(Math.max(x, 0), W);
        e.y = Math.min(Math.max(y, 0), H);
    }, 8);

    if (sendBuffer.length < socketCount) {
        sendBuffer = new Buffer(sendBuffer.length * 2);
    }

    entities[e.id] = e;

    socket.on('data', function(d){
        deserializer.append(d);
    });

    socket.on('close', function(){
        --socketCount;
        delete entities[e.id];
    });

    socket.on('error', function (e) {
        console.error(e.stack);
        socket.end();
    });

    // say we are ready
    var buf = new Buffer(16);
    socket.write(helper.makeMessage(e.id, e.x, e.y));
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

setInterval(function () {
    if (socketCount > 0) {
        var keys = Object.keys(entities);
        var i;
        var e;
        for (i = 0; i < keys.length; ++i) {
            e = entities[keys[i]];
            helper.makeMessage(e.id, e.x, e.y, sendBuffer, i * helper.MESSAGE_LEN + 4);
        }
        for (i = 0; i < keys.length; ++i) {
            e = entities[keys[i]];
            e.socket.write(sendBuffer.slice(0, socketCount * helper.MESSAGE_LEN));
        }
        ++updateCount;
    }
}, 100);

setInterval(function () {
    if (socketCount > 0) {
        var diff = updateCount - lastUpdateCount;
        console.log('con:', +new Date() - bootTick, socketCount, diff);
        lastUpdateCount = updateCount;
    }
}, 1000);
