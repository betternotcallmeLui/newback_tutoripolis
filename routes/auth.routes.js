import express from 'express'
import { check } from 'express-validator'

import Auth from '../Authentication/is-auth'
import User from '../model/user'
import authController from '../controllers/auth.controller'
import googleController from '../controllers/googleAuth.controller'

const router = express.Router();

const BASE_URL = '/signup';

router.post(`${BASE_URL}`, [
    check('email')
        .isEmail()
        .withMessage('Por favor introduce un email válido')
        .custom(async (value, { req }) => {
            const user = await User.findOne({ email: value });
            if (user) {
                return Promise.reject('El correo introducido ya existe');
            }
        }),
    check('password')
        .isLength({ min: 5 })
        .withMessage('La contraseña tiene que tener por lo menos 5 carácteres'),
    check('name').trim().not().isEmpty(),
], authController.signup);

router.post(`${BASE_URL}/otp`, authController.otpVerification);
router.post(`${BASE_URL}/resetOtp`, authController.resetPassword);
router.post(`${BASE_URL}/otp-resend`, authController.resendOtp);
router.post(`${BASE_URL}/checkOtp`, authController.resetOtpVerification);
router.post(`${BASE_URL}/reset-password`, authController.newPassword);

// Rutas de autenticación de Google
router.post('/google_login', googleController.googleLogin);
router.post('/google_signup', googleController.googleSignUp);

// Obtener nuevo token de acceso usando token de actualización
router.post('/auth/token/', Auth.GetnewAccessToken);

module.exports = router;
