const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid = require('uuid');

const app = express();

// Logging middleware
app.use(morgan('common'));
// For the sending of static files
app.use(express.static('public'));
// Using body-parser
app.use(bodyParser.json());

// An array of objects with my top ten movies
let topTenMovies = [
  {
    id: 1,
    title: 'The Lord of the Rings: The Return of the King',
    year: '2003'
  },
  {
    id: 2,
    title: 'Savin Private Ryan',
    year: '1998'
  },
  {
    id: 3,
    title: 'Nocturnal Animals',
    year: '2016'
  },
  {
    id: 4,
    title: 'The Hobbit: The Battle of the Five Armies',
    year: '2014'
  },
  {
    id: 5,
    title: 'Shutter Island',
    year: '2010'
  },
  {
    id: 6,
    title: 'Limitless',
    year: '2011'
  },
  {
    id: 7,
    title: 'The Godfather',
    year: '1972'
  },
  {
    id: 8,
    title: 'Blood In Blood Out',
    year: '1993'
  },
  {
    id: 9,
    title: 'City of God',
    year: '2002'
  },
  {
    id: 10,
    title: 'Inception',
    year: '2010'
  }
]

// Returning my top ten movies
app.get('/movies', (req, res) => {
  res.json(topTenMovies);
});

// Returning a welcoming message
app.get('/', (req, res) => {
  res.send('Welcome to my movie database!');
});

// Get data about a certain movie
app.get('/movies/:title', (req, res) => {
  res.json(topTenMovies.find((movie) => {
    return movie.title === req.params.title
  }));
});

// Add a movie
app.post('/movies', (req, res) => {
  let newMovie = req.body;

  if (!newMovie.title) {
    const message = 'Missing movie title in request body';
    res.status(400).send(message);
  } else {
    newMovie.id = uuid.v4();
    topTenMovies.push(newMovie);
    res.status(201).send(newMovie);
  }
});

// Delet a movie from the list by id
app.delete('/movies/:id', (req, res) => {
  topTenMovies = topTenMovies.filter((obj) => { return obj.id !== req.params.id });
  res.status(201).send('Movie with the ID of ' + req.params.id + ' was deleted.');
});

// Update the year of a movie by title
app.put('/movies/:title/:year', (req, res) => {
  let movie = topTenMovies.find((movie) => {
    return movie.title = req.params.title
  });

  if (movie) {
    movie.year = parseInt(req.params.year);
    res.status(201).send(`Movie ${req.params.title} was assigned the year of ${req.params.year}.`);
  } else {
    res.status(404).send(`Movie wit the title ${req.params.title} was not found.`);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something gone wrong mate!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
