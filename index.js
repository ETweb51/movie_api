const express = require('express'),
morgan = require('morgan');

const app = express();

// Logging middleware
app.use(morgan('common'));
// For the sending of static files
app.use(express.static('public'));

// An array of objects with my top ten movies
let topTenMovies = [
  {
    title: 'The Lord of the Rings: The Return of the King',
    year: '2003'
  },
  {
    title: 'Savin Private Ryan',
    year: '1998'
  },
  {
    title: 'Nocturnal Animals',
    year: '2016'
  },
  {
    title: 'The Hobbit: The Battle of the Five Armies',
    year: '2014'
  },
  {
    title: 'Shutter Island',
    year: '2010'
  },
  {
    title: 'Limitless',
    year: '2011'
  },
  {
    title: 'The Godfather',
    year: '1972'
  },
  {
    title: 'Blood In Blood Out',
    year: '1993'
  },
  {
    title: 'City of God',
    year: '2002'
  },
  {
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

// Error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something gone wrong mate!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
