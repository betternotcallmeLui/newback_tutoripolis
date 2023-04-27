import express from 'express';

import StripeController from '../controllers/stripe';
import Auth from '../Authentication/is-auth';

const router = express.Router();

router.post('/stripe/payment', Auth.authentication, StripeController.stripePayment);

router.get('/stripe/:courseId', Auth.authentication, StripeController.stripeCourse);

module.exports = router;