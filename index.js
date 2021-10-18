const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid = require('uuid');

const {check, validationResult} = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

// Logging middleware
app.use(morgan('common'));
// For the sending of static files
app.use(express.static('public'));
// Using body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Cros Origin Resource Sharing
const cors = require('cors');
app.use(cors());

// Importing auth.js and passport
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// Welcoming message
app.get('/', (req, res) => {
  res.send('Welcome to my movie database!');
});

// Get all movies
app.get('/movies', (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ', err);
  });
});

// Get data about a certain movie
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({Title: req.params.Title})
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ', err);
  });
});

// Get all users
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

// Get user by name
app.get('/users/:Name', (req, res) => {
  Users.findOne({Name: req.params.Name})
  .then ((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Add a new user
app.post('/users', [
  check('Name', 'Username is required').isLength({min: 5}),
  check('Name', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Mail', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({errors: erros.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Name: req.body.Name})
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Name + 'already exists');
    } else {
      Users.create({
        Name: req.body.Name,
        Password: hashedPassword,
        Mail: req.body.Mail,
        Birthday: req.body.Birthday
      }).then((user) => {res.status(201).json(user)})
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.satus(500).send('Error: ' + error);
  });
});

// Add a movie to the favorite list of an user
app.post('/users/:Name/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Name: req.params.Name}, {
    $push: {FavoriteMovies: req.params.MovieID}
  },
  {new: true},
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Update user info by username
app.put('/users/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Name: req.params.Name}, {
    $set:
    {
      Name: req.body.Name,
      Password: req.body.Password,
      Mail: req.body.Mail,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Delete a user by username
app.delete('/users/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({Name: req.params.Name})
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.Name + ' was not found.');
    } else {
      res.status(200).send(req.params.Name + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Delete a movie from the favorite list of an user
app.delete('/users/:Name/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Name: req.params.Name}, {
    $pull: {FavoriteMovies: req.params.MovieID}
  },
  {new: true},
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something gone wrong mate!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
