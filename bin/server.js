var Carbon = require("../lib/carbon");
var DBWriter = require("../lib/db");
var Express = require("express");
var HTTP = require("http");
var Net = require("net");
// var GC = require('node-gc');

var app = Express();
var server = HTTP.createServer(app);
var graphite = Net.createServer();

// HTTP API
require("../lib/control/metric").attach(app, DBWriter.db);

// Ingress Streams
var dbWriter = new DBWriter();
var carbonProtocol = new Carbon();

// Pipes
carbonProtocol.pipe(dbWriter);
graphite.on("connection", function(socket) {
  socket.pipe(carbonProtocol);
});

server.listen(8080);
graphite.listen(2003);

// GC Monitoring
// GC.on('scavenge', function(info) {
//   console.log("Completed GC Scavenge. Culled " + (info.heapBefore - info.heapAfter) +
//     "b in " + info.duration + "ms");
// });
// GC.on('marksweep', function(info) {
//   console.log("Completed GC Mark/Sweep. Culled " + (info.heapBefore - info.heapAfter) +
//     "b in " + info.duration + "ms");
// });
