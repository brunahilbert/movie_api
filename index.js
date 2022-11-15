const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
const app = express();

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

