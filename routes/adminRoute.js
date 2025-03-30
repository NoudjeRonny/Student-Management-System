const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const passport = require('passport');
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');
const router = express.Router();

// Middleware to protect admin routes
function isAdminAuthenticated(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/admin/login');
    }
    next();
}

// Set up file upload storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Admin Registration Route
router.get('/admin/register', (req, res) => {
    res.render('admin/register');
});

// Admin Registration POST Route
router.post('/admin/register', upload.single('profilePicture'), async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            req.flash('error', 'All fields are required.');
            return res.redirect('/admin/register');
        }

        let existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            req.flash('error', 'Admin already exists.');
            return res.redirect('/admin/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            profilePicture: req.file ? req.file.filename : null,
            role: 'admin'
        });

        await admin.save();
        req.flash('success', 'Registration successful! Please login.');
        res.redirect('/admin/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred during registration.');
        res.redirect('/admin/register');
    }
});

// Admin Login Route
router.get('/admin/login', (req, res) => {
    res.render('admin/login', { messages: req.flash('error') });
});

// Admin Login POST Route (Manual Authentication)
router.post('/admin/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (admin && await bcrypt.compare(password, admin.password)) {
            req.session.userId = admin.id;
            req.session.adminName = admin.name;

            // Set session expiration for "Remember Me"
            if (rememberMe) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            } else {
                req.session.cookie.expires = false;
            }

            req.flash('success', 'Successfully logged in!');
            return res.redirect('/admin/dashboard');
        } else {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/admin/login');
        }
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        return res.redirect('/admin/login');
    }
});


// Admin Dashboard Route (Protected)
router.get('/admin/dashboard', isAdminAuthenticated, async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.userId);
        const totalStudents = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalAdmins = await Admin.countDocuments();

        res.render('admin/dashboard', { 
            admin, 
            totalStudents, 
            totalCourses,
            totalAdmins 
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        req.flash('error', 'Failed to load dashboard.');
        res.redirect('/admin/login');
    }
});

// Manage Students Route (Protected)
router.get('/admin/manage-students', isAdminAuthenticated, async (req, res) => {
    try {
        const students = await User.find();
        const admin = await Admin.findById(req.session.userId);
        res.render('admin/manageStudents', { students, admin });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Manage Courses Route (Protected)
router.get('/admin/manage-courses', isAdminAuthenticated, async (req, res) => {
    const courses = await Course.find();
    res.render('admin/manage-courses', { courses });
});

// Logout Route
router.get('/admin/logout', isAdminAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Logout error:', err);
        res.redirect('/admin/login');
    });
});

// Forgot Password Routes
router.get('/admin/forgot-password', (req, res) => {
    res.render('admin/forgot-password');
});

router.post('/admin/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            req.flash('error', 'No account found with that email address.');
            return res.redirect('/admin/forgot-password');
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiration = Date.now() + 3600000;

        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = resetTokenExpiration;
        await admin.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'noudjemambe@gmail.com',
                pass: '12345678910237',
            },
        });

        const resetUrl = `http://localhost:3000/admin/reset-password/${resetToken}`;

        const mailOptions = {
            to: email,
            from: 'noudjemambe@gmail.com',
            subject: 'Password Reset Request',
            text: `You are receiving this email because we received a password reset request for your account.\n\n
                   Please click on the following link, or paste it into your browser, to complete the process:\n\n
                   ${resetUrl}\n\n
                   If you did not request this, please ignore this email.\n`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                req.flash('error', 'There was an error sending the password reset email.');
                return res.redirect('/admin/forgot-password');
            }
            req.flash('success', 'Password reset email sent!');
            res.redirect('/admin/login');
        });

    } catch (error) {
        console.error('Error during password reset request:', error);
        req.flash('error', 'An error occurred. Please try again later.');
        res.redirect('/admin/forgot-password');
    }
});

// Reset Password Routes
router.get('/admin/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/admin/forgot-password');
        }

        res.render('admin/reset-password', { token });
    } catch (error) {
        console.error('Error during password reset:', error);
        req.flash('error', 'An error occurred. Please try again later.');
        res.redirect('/admin/forgot-password');
    }
});

router.post('/admin/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/admin/forgot-password');
        }

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect(`/admin/reset-password/${token}`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        admin.password = hashedPassword;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        req.flash('success', 'Your password has been reset successfully. Please log in.');
        res.redirect('/admin/login');
    } catch (error) {
        console.error('Error during password reset:', error);
        req.flash('error', 'An error occurred. Please try again later.');
        res.redirect(`/admin/reset-password/${token}`);
    }
});

module.exports = router;
