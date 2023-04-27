import express from 'express';

import courseController from '../controllers/coursepage.controller';
import Auth from '../Authentication/is-auth';

const router = express.Router()

router.get('/course/:courseName/:courseId', Auth.authentication, courseController.CoursePage);
router.get('/users/:userName/:userId', Auth.authentication, courseController.ShowBookmark);
router.get('/pdf/download/:courseId', courseController.pdf);

router.post('/home/:courseId/:courseName', Auth.authentication, courseController.Bookmark);
router.post('/unbookmark', Auth.authentication, courseController.unbookmark);

router.put('/rating', Auth.authentication, courseController.rating);

module.exports = router;