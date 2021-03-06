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

/**
 * Configuration of the CORS policy
 */
const cors = require('cors');
let allowedOrigins = ['https://mymoviecf.netlify.app/', 'http://localhost:1234', 'http://localhost:8080', 'http://localhost:4200', 
'https://etweb51.github.io/myMovie-Angular-Client/',
'https://etweb51.github.io/myMovie-Angular-Client',
'https://etweb51.github.io',
'https://etweb51.github.io/'
]
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

// Importing auth.js and passport
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// Welcoming message
app.get('/', (req, res) => {
  res.send('Welcome to my movie database!');
});

/**
 * Getting all movies for the user
 * @method GET
 * @returns the information about the movies
 * @requires JWT authentication
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ', err);
  });
});

/**
 * Getting a movie by title
 * @method GET
 * @param title of the movie
 * @returns the information about that one movie
 * @requires JWT authentication
 */
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

/**
 * Getting all users
 * @method GET
 * @returns all the users of the application
 */
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

/**
 * Getting one user
 * @method GET
 * @param name of the movie
 * @returns the one user
 */
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

/**
 * Allows a new user to sign up
 * @method POST
 * @param object with user details
 * @returns an object with the user details
 */
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

/**
 * Adding a movie to the favorites list
 * @method POST
 * @param name of the user
 * @param id of the movie
 * @returns the updated user
 * @requires JWT authentication
 */
app.post('/users/:Name/movies/:MovieID', passport.authenticate('jwt', {session: false}) ,(req, res) => {
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

/**
 * User edits profile 
 * @method PUT
 * @param object with the new details
 * @returns the updated user
 * @requires JWT authentication
 */
app.put('/users/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({Name: req.params.Name}, {
    $set:
    {
      Name: req.body.Name,
      Password: hashedPassword,
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

/**
 * Deregestering the user
 * @method DELETE
 * @param string
 * @returns a message that the user was successfully deleted
 * @requires JWT authentication
 */
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

/**
 * Removing a movie from the favorites list
 * @method DELETE
 * @param string name of the user
 * @param id of the movie
 * @returns a message that the movie was successfully removed from the favorites list
 * @requires JWT authentication
 */
app.delete('/users/:Name/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
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

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something gone wrong mate!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
