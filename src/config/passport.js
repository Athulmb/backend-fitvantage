const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ emailId: profile.emails[0].value });

    if (!user) {
      user = await User.create({
        fullName: profile.displayName,
        emailId: profile.emails[0].value,
        authProvider: 'google',
        password: 'google_oauth_user' // dummy or hashed
      });
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));
