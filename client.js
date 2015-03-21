var helper = require('./helper');
var net = require('net');
var sendBuffer = new Buffer(12);

function randomStep() {
    return 2 * (Math.random() - 0.5);
}

function main() {
    var socket = net.connect({host: '127.0.0.1', port: 3000});
    var me;
    var deserializer = helper.createDeserializer(function (buf, cur) {
        // welcome message
        var id = buf.readUInt32LE(cur + 0);
        var x = buf.readFloatLE(cur + 4);
        var y = buf.readFloatLE(cur + 8);
        me = {id: id, x: x, y: y};

        // normal messages
        deserializer.fn = function (buf, cur) {
            var id = buf.readUInt32LE(cur + 0);
            if (id === me.id) {
                var x = buf.readFloatLE(cur + 4);
                var y = buf.readFloatLE(cur + 8);
            
                me.x = x;
                me.y = y;
            }
        };

        // send my status repeatedly
        setInterval(function () {
            socket.write(helper.makeMessage(me.id, me.x + randomStep(), me.y + randomStep(), sendBuffer));
        }, 100);
    }, 12);

    socket.on('data', function (d) {
        deserializer.append(d);
    });

    socket.on('close', function () {
        // socket disconnected 
        console.log('disconnected');
    });

    setTimeout(main, 10);
}

process.nextTick(main);
