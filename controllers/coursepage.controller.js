import Course from '../model/courses'
import User from '../model/user'

import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

exports.CoursePage = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findOne({ _id: courseId });
        res.status(200).json({ course: course });
    } catch (err) {
        console.log(err);
        next();
    }
};

exports.Bookmark = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.body._userID;

        const user = await User.findById({ _id: userId });
        if (!user.Bookmark.includes(courseId)) {
            user.Bookmark.push(courseId);
            console.log('added to bookmark for user');
        } else {
            user.Bookmark.splice(user.Bookmark.indexOf(courseId), 1);
            console.log('removed from user bookmark');
        }
        await user.save();

        const course = await Course.findById({ _id: courseId });
        if (!course.bookmark.includes(userId)) {
            course.bookmark.push(userId);
            console.log('bookmarked --- course');
        } else {
            course.bookmark.splice(course.bookmark.indexOf(userId), 1);
            console.log('course already bookmarked for this user');
        }
        await course.save();

        console.log('bookmark process completed');
        res.status(202).json({ message: 'successfully bookmarked/unbookmarked' });
    } catch (err) {
        console.log(err);
        throw err;
    }
};

exports.ShowBookmark = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const course = await User.findById({ _id: userId }).populate('Bookmark').exec();
        console.log(course);
        res.json({ course: course });
    } catch (err) {
        console.log(err);
        next();
    }
};

exports.unbookmark = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const courseId = req.body.id;

        const user = await User.findById({ _id: userId });
        user.Bookmark.splice(user.Bookmark.indexOf(courseId), 1);
        await user.save();

        const course = await Course.findById({ _id: courseId });
        course.bookmark.splice(course.bookmark.indexOf(userId), 1);
        await course.save();

        res.status(200).json({ message: 'successfully unbookmarked' });
    } catch (err) {
        console.log(err);
        next();
    }
};

exports.rating = async (req, res, next) => {
    try {
        const courseId = req.body.courseId;
        const new_Rating = req.body.rating;

        const course = await Course.findById({ _id: courseId });
        const total_rating = course.rating.ratingSum + new_Rating;
        const times_updated = course.rating.timesUpdated + 1;
        course.rating.timesUpdated += 1;
        course.rating.ratingSum += new_Rating;
        course.rating.ratingFinal = total_rating / times_updated;

        await course.save();
        console.log(course);
        res.status(200).json({ course: course });
    } catch (err) {
        console.log(err);
        next();
    }
};

exports.pdf = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;

        const course = await Course.findById({ _id: courseId });
        if (!course) {
            res.status(400).json({ message: 'Course not found' });
        } else {
            const doc = new PDFDocument();
            const filePath = path.join(__dirname, '..', 'pdf', 'course.pdf');
            doc.pipe(fs.createWriteStream(filePath));
            doc.fontSize(20).text('Course Details:', { underline: true });
            doc.fontSize(16).text(`Course Name: ${course.name}`);
            doc.fontSize(16).text(`Instructor: ${course.instructor}`);
            doc.fontSize(16).text(`Description: ${course.description}`);
            doc.fontSize(16).text(`Rating: ${course.rating.ratingFinal}`);
            doc.fontSize(16).text(`Bookmark Count: ${course.bookmark.length}`);

            doc.end();

            res.download(filePath, 'course.pdf', (err) => {
                if (err) {
                    console.log(err);
                    next();
                }
                fs.unlinkSync(filePath);
            });
        }
    } catch (err) {
        console.log(err);
        next();
    }
};
