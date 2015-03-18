var io = require('socket.io-client');
function main() {
    var socket = io('http://127.0.0.1:3000/', {'force new connection': true});

    socket.on('connect', function () {
        // socket connected 
        console.log('connected');
    });

    function randomStep() {
        return 2 * (Math.random() - 0.5);
    }

    var me;
    socket.on('ready', function (e) {
        me = e;
        setInterval(function () {
            socket.emit('move', e.x + randomStep(), e.y + randomStep());
        }, 100);
    });

    socket.on('update', function (entities) {
        // update me
        if (me && me.id in entities) {
            var m = entities[me.id];
            me.x = m.x;
            me.y = m.y;
        }
    });

    socket.on('disconnect', function () {
        // socket disconnected 
        console.log('disconnected');
    });

    setTimeout(main, 10);
}

process.nextTick(main);
