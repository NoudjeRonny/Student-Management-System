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

// nodemailer credential
// Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "061f7115930e35",
      pass: "f6457e4ec8b4f6"
    }
  });



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
    res.render('admin/login', {
        errorMessages: req.flash('error'),    // Store error messages
        successMessages: req.flash('success')  // Store success messages
     });
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

// Handle Forgot Password Routes
router.get('/admin/forgot-password', (req, res) => {
    res.render('admin/forgot-password', {
        errorMessages: req.flash('error'),    // Store error messages
        successMessages: req.flash('success')  // Store success messages
    });
});

// hanle forget password post route
// Handle forgot password post route
router.post('/admin/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            req.flash('error', 'No account found with that email address.');
            return res.redirect('/admin/forgot-password');
        }

        const resetToken = Math.random().toString(36).slice(2);
        admin.resetToken = resetToken;
        await admin.save();

        const info = await transport.sendMail({
            from: '"MailBoxes 👻" <noudjemambe@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Password Reset", // Subject line
            html: `<p>Click this link to reset your password:
                   <a href="http://localhost:3000/admin/reset-password/${resetToken}">
                   Reset Password</a><br>Thank you!</p>`, // html body
        });

        if (info && info.messageId) {
            req.flash('success', 'Password reset link has been sent to your email.');
        } else {
            req.flash('error', 'Error sending email.');
        }
        res.redirect('/admin/forgot-password');

    } catch (error) {
        console.error('Error during password reset request:', error);
        req.flash('error', 'An error occurred. Please try again later.');
        res.redirect('/admin/forgot-password');
    }
});
// Reset Password Routes
router.get('/admin/reset-password/:resetToken', async (req, res) => {
    const { resetToken } = req.params;

    try {
        const admin = await Admin.findOne({ resetToken });

        if (!admin) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/admin/forgot-password');
        }

        // Pass messages to the template
        res.render('admin/reset-password', { resetToken, messages: req.flash('error') });
    } catch (error) {
        console.error('Error during password reset:', error);
        req.flash('error', 'An error occurred. Please try again later.');
        res.redirect('/admin/forgot-password');
    }
});

// handling admin reset password
router.post('/admin/reset-password', async (req, res) => {
    
    const {resetToken, new_password, confirmPassword } = req.body;
    console.log(new_password,confirmPassword,resetToken);
    try {
    //     
    const admin = await Admin.findOne({resetToken});
            if(new_password != confirmPassword){
                req.flash('error','password do not match');
                return redirect(`/admin/reset-password/${resetToken}`);
            }

             if(!admin){
                req.flash('error','Invalid token!');
                return redirect(`/admin/forget-password`);
            }

            admin.password = await bcrypt.hash(new_password,10);
            admin.resetToken = null;
             await admin.save();
             req.flash('success','password reset successful');
             res.redirect('/admin/login');

    
    } catch (error) {
        console.error('Error during password reset:', error);
        req.flash('error', 'An error occurred. Please try again later.');
        res.redirect(`/admin/reset-password/${resetToken}`);
    }
});

////////////////// handling student section
router.get('/admin/addStudent',isAdminAuthenticated,async(req,res)=>{
    const admin = await Admin.findById(req.session.userId);
    res.render('admin/addStudent',{title:'Add Student', admin,
    errorMessages: req.flash('error'), 
    });
})
// admin register student

router.post('/admin/SRegister',upload.single('image'), async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/admin/addStudent');
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            req.flash('error', 'Email is already registered');
            return res.redirect('/admin/addStudent');
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

        // req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'Server error. Please try again.');
        res.redirect('/admin/addStudent');
    }
});




module.exports = router;
