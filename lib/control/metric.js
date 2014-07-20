
exports.attach = function(app, db) {
  app.get("/metric/:name", function(req, res, next) {
    var timer_start = Date.now();
    var counter = 0;

    var end = +(req.query.end) || timer_start; // Default now
    var start = +(req.query.start) || end - 3600000; // Default 1h

    var reader = db.createValueStream({
      start: req.params.name + ":" + start,
      end: req.params.name + ":" + end
    });

    if(req.accepts("html")) res.type("text/plain");
    else res.type("application/x-json-stream");

    res.set("Transfer-Encoding", "chunked");
    res.write(JSON.stringify({
      metric: req.params.name,
      range: {
        start: start,
        end: end
      },
      time: {
        start: timer_start
      }
    }) + "\n");

    reader.on("error", next);
    reader.on("data", function(data) {
      res.write(JSON.stringify(data.split(":")) + "\n");
      counter++;
    });

    reader.on("end", function() {
      res.write(JSON.stringify({
        metric: req.params.name,
        range: {
          start: start,
          end: end
        },
        time: {
          start: timer_start,
          duration: Date.now() - timer_start
        },
        length: counter
      }) + "\n");
      res.end();
    });
  });

  app.post("/metric/:name", function(req, res, next) {

  });
};
