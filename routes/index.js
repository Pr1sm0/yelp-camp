const express        = require("express"),
      router         = express.Router(),
      passport       = require("passport"),
      User           = require("../models/user"),
      { isLoggedIn } = require('../middleware');

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Root Route
router.get("/", (req, res) => {
    res.render("landing");
});

//============
// AUTH ROUTES
//============

//show register form
router.get("/register", (req, res) => {
    res.render("register", {page: 'register'});
});

// handle sign up logic
router.post("/register", (req, res) => {
    const newUser = new User({username: req.body.username});
    if(req.body.adminCode === 'itwasmedio'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        } 
        passport.authenticate("local")(req, res, () => {
            req.flash("success", `Successfully Signed Up! Welcome to YelpCamp, ${user.username}.`);
            res.redirect("/checkout");
        });
    });
});

// show login form
router.get("/login", (req, res) => {
    res.render("login", {page: 'login'});
});

// hangling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), (req, res) => {
});

// logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("info", "You are logged out");
    res.redirect("/campgrounds");
});

// GET checkout
router.get('/checkout', isLoggedIn, (req, res) => {
    if(req.user.isPaid) {
        req.flash('success', 'Your account is already paid');
        return res.redirect('/campgrounds');
    }
    res.render('checkout', { amount: 20 });
});

// POST pay
router.post('/pay', isLoggedIn, async (req, res) => {
    const { paymentMethodId, items, currency } = req.body;

    const amount = 2000;
  
    try {
      // Create new PaymentIntent with a PaymentMethod ID from the client.
      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethodId,
        error_on_requires_action: true,
        confirm: true
      });
  
      console.log("💰 Payment received!");

      req.user.isPaid = true;
      await req.user.save();
      // The payment is complete and the money has been moved
      // You can add any post-payment code here (e.g. shipping, fulfillment, etc)
  
      // Send the client secret to the client to use in the demo
      res.send({ clientSecret: intent.client_secret });
    } catch (e) {
      // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
      // See https://stripe.com/docs/declines/codes for more
      if (e.code === "authentication_required") {
        res.send({
          error:
            "This card requires authentication in order to proceeded. Please use a different card."
        });
      } else {
        res.send({ error: e.message });
      }
    }
});
module.exports = router;