// set up =======================
var express = require('express');
var fs = require('fs'); 

var app = express(); 

// configuration =================
app.use(express.static(__dirname + '/public'));

// listen ========================
app.listen(8080);
console.log("App listening on port 8080");

// application ===================
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/index.html'); 
});