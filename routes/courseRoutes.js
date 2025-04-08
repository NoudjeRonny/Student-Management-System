const express = require('express');
const router = express.Router();
const Course = require('../models/course');
// Manage Courses
router.get('/manage', async (req, res) => {
    const courses = await Course.find();
    res.render('admin/manageCourses', { courses });
});

// Add Course
router.post('/add', async (req, res) => {
    const { title, description } = req.body;
    const course = new Course({ title, description });
    await course.save();
    res.redirect('/course/manage');
});

// Delete Course
router.post('/delete/:id', async (req, res) => {
    await Course.findByIdAndDelete(req.params.id);
    res.redirect('/course/manage');
});

module.exports = router;