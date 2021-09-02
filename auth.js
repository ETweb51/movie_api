// Has to be the same key as in the JWTStrategy
const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
passport = require('passport');

// The local passport file
require('./passport');

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    // Username which will be encoded in the JWT
    subject: user.Name,
    // Token will expire in 7 days
    expiresIn: '7d',
    // Algorithm, which is used to sign or encode the values of the JWT
    algorithm: 'HS256'
  });
}

// Posting login
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right mate',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
