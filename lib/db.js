var LevelDown = require("leveldown");
var LevelUP = require("levelup");
var Path = require("path");
var Stream = require("stream");
var Util = require("util");

var Writer = module.exports = function(options) {
  var stream = this;
  Stream.Writable.call(this, {
    objectMode: true
  });

  this._resource = db.createWriteStream(options);
  this._resource.on("error", function(err) {
    stream.emit("error", err);
  });
};
Util.inherits(Writer, Stream.Writable);

var db = Writer.db = new LevelUP(Path.resolve(__dirname, "../db"), {
  db: LevelDown,
  keyEncoding: "utf8",
  valueEncoding: "utf8"
});

// Close the DB cleanly on exit
process.on("exit", function() {
  if (db.isOpen()) db.close();
});

Writer.prototype._write = function(chunk, encoding, callback) {
  if(!chunk) return callback();

  counter++;
  var writeable = this._resource.write(chunk);

  callback();
  return writeable;
};

var counter = 0;
setInterval(function() {
  console.log(counter + " mesages/sesond");
  counter = 0;
}, 1000);
