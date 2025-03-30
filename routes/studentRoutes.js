const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const Course = require('../models/course');
const User = require('../models/User'); // Ensure the correct path

// Student Dashboard
router.get('/dashboard', async (req, res) => {
    const student = await Student.findOne({ user: req.session.userId }).populate('courses');
    res.render('student/dashboard', { student });
});


// // Enroll in Course
// router.post('/enroll', async (req, res) => {
//     const { courseId } = req.body;
//     await Student.findOneAndUpdate(
//         { user: req.session.userId },
//         { $addToSet: { courses: courseId } }
//     );
//     res.redirect('/student/dashboard');
// });

router.get('/student/enroll', (req, res) => {
    res.render('student/enroll');
});

// view profile
router.get('/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            req.flash('error', 'You need to log in first');
            return res.redirect('/login');
        }

        // Fetch student details and populate courses
        const user = await User.findById(req.session.userId).populate('courses').exec();

        if (!user) {
            req.flash('error', 'Student not found');
            return res.redirect('/login');
        }

        res.render('student/profile', { user }); // Fix: Pass 'user' instead of 'student'
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).send('Server Error');
    }
});

// for update profile
router.get('/student/profile/edit', async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.render('student/editProfile', { user });
});

router.post('/student/profile/edit', async (req, res) => {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.session.userId, { name, email });
    res.redirect('/student/profile');
});

// generate report
router.get('/student/report', async (req, res) => {
    const student = await Student.findOne({ user: req.session.userId }).populate('courses');
    res.render('student/report', { student });
});


module.exports = router;