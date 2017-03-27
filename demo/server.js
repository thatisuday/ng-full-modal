const express = require('express');
const app = express();

// set appropriate headers
app.use(function(req, res, next){
	res.set({
		'Access-Control-Allow-Origin' : '*',
		'Access-Control-Allow-Headers' : req.get("Access-Control-Request-Headers"),
		'Access-Control-Allow-Methods' : 'GET, POST, PUT, DELETE, OPTIONS'
	});
	
	next();
});

// set static routes
app.use('/dist', express.static(__dirname + '/../dist'));
app.use('/demo', express.static(__dirname + '/../demo'));

// send demo template file
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.listen(3000, () => {
	console.log('Demo server listening on port 3000, http://localhost:3000');
});