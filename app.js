if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express         = require("express"),
      app             = express(),
      Campground      = require("./models/campground"),
      Comment         = require("./models/comment"),
      mongoose        = require("mongoose"),
      passport        = require("passport"),
      LocalStrategy   = require("passport-local"),
      methodOverride  = require("method-override"),
      User            = require("./models/user"),
      flash           = require("connect-flash"),
      seedDB          = require("./seeds");

// requiring routes
const indexRoutes       = require("./routes/index"),
      campgroundRoutes  = require("./routes/campgrounds"),
      commentRoutes     = require("./routes/comments");

app.locals.moment = require('moment');

const dbUrl = process.env.DBURL || process.env.LOCAL_DB_URL,
      port  = process.env.PORT || 3000;

mongoose.connect(dbUrl, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(flash());
// seedDB(); //seed the database

// PASSPORT CONGIFIGURATION
app.use(require("express-session")({
    secret: "Once again I made a typo",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.warning = req.flash("warning");
    res.locals.info = req.flash("info");
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(port, () => {  
    console.log("Server Has Started!");
});