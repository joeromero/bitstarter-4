var express = require("express");
var fs = require("fs");

var app = express.createServer(express.logger());

app.get("/", function(request, response) {
  response.send(fs.readFileSync("index.html").toString());
});

app.use("/imgs", express.static(__dirname + "/imgs"));

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
