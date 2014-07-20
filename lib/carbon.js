var Stream = require("stream");
var Util = require("util");

/**
 * The Carbon ASCII protocol
 */
var Carbon = module.exports = function() {
  Stream.Duplex.call(this, {
    allowHalfOpen: true,
    decodeStrings: true, // We have to match a regexp...
    objectMode: true
  });

  this.buffer = [];
};
Util.inherits(Carbon, Stream.Duplex);

Carbon.MESSAGE = /([\w\.]+) (\d+(?:\.\d+)?) (\d+)/;

Carbon.prototype.metric = function(data) {
  var match = data.match(Carbon.MESSAGE);
  if (!match) return;

  this.buffer.push({
    key: match[1] + ":" + match[3],
    value: match[3] + ":" + match[2]
  });
};

Carbon.prototype._write = function(chunk, encoding, callback) {
  if (chunk === null) return callback(); // A socket ended... LOL Don't care.
  if (chunk instanceof Buffer) chunk = chunk.toString("ascii");
  var metrics = chunk.split(/\r?\n/g);

  // Loop over received metrics with contest-wrapping of a function,
  // without defining (binding) a new function for each incoming message
  for (var i = 0; i < metrics.length; i++) this.metric(metrics[i]);
  callback();
};

Carbon.prototype._read = function(size) {
  var stream = this;
  for (var i = 0; i < size; i++) {
    if (!this.buffer.length) return setImmediate(this.push.bind(this, false));
    this.push(this.buffer.shift());
  }
};

// Stream don't care if a socket goes away...
Carbon.prototype.end = function() {};
