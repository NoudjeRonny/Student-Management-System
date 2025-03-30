const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Admin = require('../models/Admin'); // Adjust path as necessary
const bcrypt = require('bcryptjs');

passport.use(new LocalStrategy(
  async (email, password, done) => {
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, admin);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((admin, done) => {
  done(null, admin.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const admin = await Admin.findById(id);
    done(null, admin);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;