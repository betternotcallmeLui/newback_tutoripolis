import express from 'express';

import homeController from '../controllers/homepage.controller';
import Auth from '../Authentication/is-auth';

const router = express.Router();

const BASE_URL = '/home';

router.get(`${BASE_URL}/allCourses`, homeController.allCourses);
router.get(`${BASE_URL}/:course`, homeController.fetchCourses);

router.post(`${BASE_URL}/interests/`, Auth.authentication, homeController.getPreferences);
router.post(`${BASE_URL}/:course`, Auth.authentication, homeController.preferenceCourses);

module.exports = router;