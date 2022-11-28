const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// routes all requests for static files to the 'public' folder
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
    },
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
      biography: '',
    },
  },
];

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

// ========== POST REQUESTS (create) ==========================================================================

// add new user
app.post('/user', (req, res) => {
  Users.findOne({ UserName: req.body.UserName })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.UserName + 'already exists');
      } else {
        Users.create({
          UserName: req.body.UserName,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((newUser) => {
            res.status(201).json(newUser);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// add favorite movies by username and movie id
app.post('/user/:UserName/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { UserName: req.params.UserName },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, user) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res
          .status(201)
          .send(
            'A new movie has been added to ' +
              user.UserName +
              "'s favorite movies!"
          );
      }
    }
  );
});

// ========== DELETE REQUESTS (remove) ==========================================================================

// delete fav movie by username and movie id
app.delete('/user/:UserName/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { UserName: req.params.UserName },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res
          .status(200)
          .send(
            'Movie removed from ' +
              updatedUser.UserName +
              "'s favorite movie list"
          );
      }
    }
  );
});

// Delete a user by username
app.delete('/users/:UserName', (req, res) => {
  Users.findOneAndRemove({ UserName: req.params.UserName })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.UserName + ' was not found');
      } else {
        res.status(200).send(req.params.UserName + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// ========== PUT REQUESTS (update) =============================================================================

// update user infos by name
app.put('/users/:UserName', (req, res) => {
  Users.findOneAndUpdate(
    { UserName: req.params.UserName },
    {
      $set: {
        UserName: req.body.UserName,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res
          .status(200)
          .send(
            updatedUser.UserName + "'s information was successfully updated!"
          );
      }
    }
  );
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
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get movie by title
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get genre information by genre
app.get('/movies/genre/:genreName', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName }, { Genre: true })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get director by name
app.get('/movies/director/:directorName', (req, res) => {
  Movies.findOne(
    { 'Director.Name': req.params.directorName },
    { Director: true }
  )
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get a user by username
app.get('/users/:UserName', (req, res) => {
  Users.findOne({ UserName: req.params.UserName })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
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
