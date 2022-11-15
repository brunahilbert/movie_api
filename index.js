const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
const app = express();

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

let topMovies = [
  {
    title: 'Mamma Mia! The movie',
    year: 2008,
    genre: ['musical', 'comedy'],
    duration: 109,
  },
  {
    title: '13 going on 30',
    year: 2004,
    genre: ['romance', 'comedy'],
    duration: 97,
  },
  {
    title: 'Up',
    year: 2009,
    genre: ['kids & family', 'comedy'],
    duration: 96,
  },
  {
    title: 'Ford vs Ferrari',
    year: 2019,
    genre: ['history', 'drama'],
    duration: 152,
  },
  {
    title: 'Top Gun: Maverick',
    year: 2022,
    genre: ['action', 'adventure'],
    duration: 131,
  },
  {
    title: 'Rocketman',
    year: 2019,
    genre: ['musical', 'biography'],
    duration: 121,
  },
  {
    title: 'Bohemian Rhapsody',
    year: 2018,
    genre: ['history', 'biography'],
    duration: 135,
  },
  {
    title: 'Sing',
    year: 2016,
    genre: ['kids & family', 'musical'],
    duration: 108,
  },
  {
    title: 'The Knight Before Christmas',
    year: 2019,
    genre: ['holiday', 'romance'],
    duration: 93,
  },
  {
    title: 'Hocus Pocus',
    year: 1993,
    genre: ['holiday', 'kids & family'],
    duration: 95,
  },
];

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

