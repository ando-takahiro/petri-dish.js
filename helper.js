exports.createDeserializer = function (fn, frameLen) {
    var buf;
    var that = {
        fn: fn,
        frameLen: frameLen || 12
    };

    that.append = function (d) {
        var cur = 0;
        if (buf) {
            buf = Buffer.concat([buf, d]);
        } else {
            buf = d;
            rest = d.readUInt32LE();
        }

        while (buf.length - cur >= that.frameLen) {
            that.fn(buf, cur);
            cur += that.frameLen;
            --rest;
        }

        if (buf.length - cur >= that.frameLen) {
            buf = buf.slice(cur);
        } else {
            buf = null;
        }
    };

    return that;
};

exports.READY = 0xFFFFFFFF;
exports.MESSAGE_LEN = 12;
exports.makeMessage = function (id, x, y, buf, offset) {
    buf = buf || new Buffer(exports.MESSAGE_LEN);
    offset = offset || 0;

    buf.writeUInt32LE(id, offset);
    buf.writeFloatLE(x, offset + 4);
    buf.writeFloatLE(y, offset + 8);

    return buf;
};
