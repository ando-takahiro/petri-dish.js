$(function() {
    var socket = io();
    var canvas = $('canvas')[0];
    var ctx = canvas.getContext('2d');

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
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        Object.keys(entities).forEach(function (id) {

            var e = entities[id];
            if (id == me.id) {
                ctx.fillStyle = '#FF0000';
            } else {
                ctx.fillStyle = '#000000';
            }
            ctx.fillRect(e.x - 1, e.y - 1, 2, 2);
        });
    });

    socket.on('disconnect', function () {
        // socket disconnected 
    });
});
