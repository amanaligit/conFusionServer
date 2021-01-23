var express = require('express');
var router = express.Router();
var path = require('path');


/* GET home page. */



router.get('/app', function (req, res) {
  res.sendFile("../build/index.html");
});

module.exports = router;
