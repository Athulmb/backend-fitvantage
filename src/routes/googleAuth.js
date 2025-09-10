const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET);
    // Send token to frontend (via redirect or JSON)
    res.redirect(`${process.env.CLIENT_URL}/google-success?token=${token}`);
  });

module.exports = router;
