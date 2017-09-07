var express = require('express');
var app = express();

app.use(express.static('./'));

app.get('/', function(req, res){
    res.sendFile('./index.html', {root: './'});
});




var server = app.listen(8080);
