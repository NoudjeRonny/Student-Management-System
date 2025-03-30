const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('./config/passport-config'); // Your Passport config

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const adminRoute = require('./routes/adminRoute');

require('./config/db');

const port = process.env.PORT || 3001;

// Middleware
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Define your routes
app.use('/images', express.static('public/images'));
app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/', adminRoute);

// Error handling middleware (this should come after all route definitions)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Entrances
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});