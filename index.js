const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  app = express();

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// routes all requests for static files to the 'public' folder
app.use(express.static('public'));

app.use(bodyParser.json());

// ========== USERS IN MEMORY ================================================================================
let users = [
  {
    id: 1,
    name: 'Bruna',
    favoriteMovies: ['Mamma Mia! The movie'],
  },
  {
    id: 2,
    name: 'Ahron',
    favoriteMovies: [],
  },
];

// ========== MOVIES IN MEMORY ================================================================================
let movies = [
  {
    title: 'Crazy Stupid Love',
    year: 2011,
    duration: 118,
    description:
      "Cal Weaver (Steve Carell) is living the American dream. He has a good job, a beautiful house, great children and a beautiful wife, named Emily (Julianne Moore). Cal's seemingly perfect life unravels, however, when he learns that Emily has been unfaithful and wants a divorce. Over 40 and suddenly single, Cal is adrift in the fickle world of dating. Enter, Jacob Palmer (Ryan Gosling), a self-styled player who takes Cal under his wing and teaches him how to be a hit with the ladies.",
    genre: {
      name: 'comedy',
      description:
        'The comedy genre is defined by events that are intended to make someone laugh, no matter if the story is macabre, droll, or zany.',
    },
    director: {
      name: 'Glenn Ficarra',
      birthday: '27.05.1971',
      biography: '',
    }
  },
  {
    title: 'Coco',
    year: 2017,
    duration: 109,
    description:
      "Despite his family's generations-old ban on music, young Miguel dreams of becoming an accomplished musician like his idol Ernesto de la Cruz. Desperate to prove his talent, Miguel finds himself in the stunning and colorful Land of the Dead. After meeting a charming trickster named Héctor, the two new friends embark on an extraordinary journey to unlock the real story behind Miguel's family history.",
    genre: {
      name: 'kids & family',
      description:
        'Kids & Family films aims to appeal not only to children, but to a wide range of ages. While the storyline may appeal to a younger audience, there are components of the film that are geared towards adults- such as witty jokes and humor.',
    },
    director: {
      name: 'Lee Unkrich',
      birthday: '08.08.1967',
      biography: ''
    }
  }
];

let topMovies = [
  {
    title: 'Mamma Mia! The movie',
    year: 2008,
    genre: ['musical', 'comedy'],
    duration: 109
  },
  {
    title: '13 going on 30',
    year: 2004,
    genre: ['romance', 'comedy'],
    duration: 97
  },
  {
    title: 'Up',
    year: 2009,
    genre: ['kids & family', 'comedy'],
    duration: 96
  },
  {
    title: 'Ford vs Ferrari',
    year: 2019,
    genre: ['history', 'drama'],
    duration: 152
  },
  {
    title: 'Top Gun: Maverick',
    year: 2022,
    genre: ['action', 'adventure'],
    duration: 131
  },
  {
    title: 'Rocketman',
    year: 2019,
    genre: ['musical', 'biography'],
    duration: 121
  },
  {
    title: 'Bohemian Rhapsody',
    year: 2018,
    genre: ['history', 'biography'],
    duration: 135
  },
  {
    title: 'Sing',
    year: 2016,
    genre: ['kids & family', 'musical'],
    duration: 108
  },
  {
    title: 'The Knight Before Christmas',
    year: 2019,
    genre: ['holiday', 'romance'],
    duration: 93
  },
  {
    title: 'Hocus Pocus',
    year: 1993,
    genre: ['holiday', 'kids & family'],
    duration: 95
  }
];

// ========== POST REQUESTS (create) ==========================================================================

// add new user
app.post('/user', (req, res) => {
  const newUser = req.body;

  if (!newUser.name) {
    const message = 'Missing name in request body';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});

// add favorite movies
app.post('/user/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res
      .status(201)
      .send(
        `The movie ${movieTitle} has been added to ${user.name}'s favorite movies!`
      );
  }
});

// ========== DELETE REQUESTS (remove) ==========================================================================

// delete fav movie by id and movie title
app.delete('/user/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);
  let movieToRemove = user.favoriteMovies.find(favMov => favMov === movieTitle);

  if (user && movieToRemove) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res
      .status(200)
      .send(
        `The movie ${movieTitle} has been removed from ${user.name}'s favorite movies!`
      );
  } else {
    res.status(404).send('Favorite movie not found');
  }
});

// delete user by id
app.delete('/user/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    res
      .status(200)
      .send(`User ${user.name} with ID ${user.id} has been deleted`);
  } else {
    res.status(404).send('User not found');
  }
});

// ========== PUT REQUESTS (update) =============================================================================

// update user's name by id
app.put('/user/:id', (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).send("User's name updated to " + user.name);
  } else {
    res.status(404).send('User not found');
  }
});

// ========== GET REQUESTS (read) =============================================================================

// return root
app.get('/', (req, res) => {
  res.send('Welcome to your Flix!');
});

// return documentation.html
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// get all movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// get movie by title
app.get('/movies/:title', (req, res) => {
  const title = req.params.title;
  const movie = movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

// get genre information by genre
app.get('/movies/genre/:genreName', (req, res) => {
  const genreName = req.params.genreName;
  const genre = movies.find((movie) => movie.genre.name === genreName);

  if (genre) {
    res.status(200).json(genre.genre);
  } else {
    res.status(404).send('Genre not found');
  }
});

// get director by name
app.get('/movies/director/:directorName', (req, res) => {
  const directorName = req.params.directorName;
  const director = movies.find((movie) => movie.director.name === directorName);

  if (director) {
    res.status(200).json(director.director);
  } else {
    res.status(404).send('Director not found');
  }
});

// error-handling middleware function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
