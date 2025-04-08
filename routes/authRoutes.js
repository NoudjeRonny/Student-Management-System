const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const multer = require("multer");
const path = require('path');


// Set up student file upload storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/students');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// for Student

// Middleware to check if the user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        req.flash('error', 'Please log in to access this page');
        return res.redirect('/login');
    }
    next();
};

// Home Route
router.get("/", (req, res) => {
    res.render('index');
});

// Show Login Page
router.get("/login", (req, res) => {
    // Pass flash messages
    res.render('student/login', {  messages: req.flash() });
});

// Show Registration Page
router.get('/register', (req, res) => {
    const messages = req.flash('error'); // Pass flash messages
    res.render('student/register', { messages });
});

// Handle Registration
router.post('/register',upload.single('image'), async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/register');
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            req.flash('error', 'Email is already registered');
            return res.redirect('/register');
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
             name,
              email,
               password: hashedPassword,
               image: req.file ? req.file.filename : null,
                role: 'student' 
            });
        await user.save();

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'Server error. Please try again.');
        res.redirect('/register');
    }
});


// Handle Login

router.post('/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.userName = user.name;

        // Set session expiration for "Remember Me"
        if (rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else {
            req.session.cookie.expires = false; // Session ends when browser closes
        }

        req.flash('success', 'Successfully logged in!'); // ✅ Success Message
        return res.redirect('/student/dashboard');
    } else {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
    }
});
// logOut

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login'); // Redirects to login after logout
    });
});


// Student Dashboard (Protected)
router.get('/student/dashboard', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('courses');

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/login');
        }

        res.render('student/dashboard', { 
            user, 
            messages: req.flash() // ✅ Pass flash messages
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        req.flash('error', 'Something went wrong');
        return res.redirect('/login');
    }
});

module.exports = router;
