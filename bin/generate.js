var Net = require("net");
var client = Net.connect(2003, "localhost");

client.on("error", function(err) {
  console.log(err);
  process.exit();
});

function metric_name() {
  return Math.floor(Math.random() * 10000);
}

function metric_value() {
  return Math.random() * 1000;
}

(function send() {
  client.write(metric_name() + " " + metric_value() + " " + Date.now() + "\n", function() {
    counter++;
    setImmediate(send);
  });
})();

var counter = 0;
setInterval(function() {
  console.log(counter + " mesages/sesond");
  counter = 0;
}, 1000);
