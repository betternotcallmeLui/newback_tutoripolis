import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { validationResult } from 'express-validator'

import api_key from '../config/config';
import User from '../model/user'
import Otp from '../model/otp'

const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
        api_key: api_key.Sendgrid
    }
})

exports.signup = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const name = req.body.name

        const errors = validationResult(req)
        if (!errors) {
            const error = new Error('Error de validación')
            error.statusCode = 422
            error.data = errors.array()
            res.status(422).json({
                message: errors.array()
            })
            throw error
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = new User({
            email: email,
            password: hashedPassword,
            name: name,
            isVerified: true,
            resetVerified: false
        })
        await newUser.save()

        const otp = Math.floor(100000 + Math.random() * 900000);
        const OTP = new Otp({
            otp: otp,
            email: email
        });
        await OTP.save()

        await transporter.sendMail({
            to: email,
            from: 'example@example.com',
            subject: 'Verificación de cuenta para Tutoripolis',
            html: `
                <h1>Bienvenido a Tutoripolis</h1>
                <p>Hola ${name},</p>
                <p>Por favor verifique su correo electrónico para activar tu cuenta.</p>
                <p>El código es el siguiente: ${otp}</p>
            `
        })

        res.status(201).json({
            message: "El código de verificación ha sido enviado a tu correo electrónico."
        })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}

exports.otpVerification = async (req, res, next) => {
    try {
        const receivedOtp = req.body.otp
        const email = req.body.email

        const user = await Otp.findeOne({
            email: email
        })

        if (!user) {
            const error = new Error('Error de validación. El correo introducido no existe.')
            error.statusCode = 403
            error.data = {
                value: receivedOtp,
                message: 'Correo no encontrado',
                param: 'otp',
                localtion: 'otpVerification'
            }
            res.status(422).json({
                message: error.data
            })
            throw error
        }

        if (user.otp !== receivedOtp) {
            const error = new Error('El código de verificación no existe o ya se usó.')
            error.statusCode = 401
            error.data = {
                value: receivedOtp,
                message: 'El código introducido no es correcto',
                param: 'otp',
                localtion: 'otp'
            }
            throw error
        } else {
            const userData = await User.findOne({
                email: email
            })
            userData.isVerified = true

            const access_token = jwt.sign({
                email: email,
                userId: userData._id
            }, api_key.accessToken, {
                algorithm: "HS256",
                expiresIn: api_key.accessTokenLife
            })

            const refresh_token = jwt.sign({
                email: email
            }, api_key.refreshToken, {
                algorithm: "HS256",
                expiresIn: api_key.refereshTokenLife
            })

            userData.refreshToken = refresh_token;
            await userData.save();

            await Otp.findOneAndDelete({ email: email });

            res.status(200).json({
                message: "Verificación correcta.",
                access_token: access_token,
                refresh_token: refresh_token,
                userId: userData._id.toString(),
                email: email
            });
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.resendOtp = async (req, res, next) => {
    try {
        const email = req.body.email;
        const received_otp = req.body.otp;
        let otp = null;

        const user = await Otp.findOne({ email: email });
        if (!user) {
            const error = new Error("El correo introducido no existe.");
            error.statusCode = 401;
            error.data = {
                value: received_otp,
                message: "Correo incorrecto",
                param: "otp",
                location: "otpVerification",
            };
            res.status(401).json({
                message: "El correo introducido no existe"
            });
            throw error;
        }

        otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        await user.save();
        console.log(otp);

        await transporter.sendMail({
            to: email,
            from: "example@example.com",
            subject: "Verificación de cuenta para Tutoripolis. Reenvio",
            html: `
                    <h1>Por favor, vuelve a verificar tu cuenta utilizando el siguiente código de verificación:</h1>
                    <p>OTP:${otp}</p>
            `,
        });

        console.log("Correo envíado");
        res.status(201).json({
            message: "Se ha enviado el código de verificación a tu correo electrónico."
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.login = async (res, req, next) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            const error = new Error('Error de validación')
            error.statusCode = 422
            error.data = errors.array()
            res.status(422).json({
                message: "El usuario con este correo no existe."
            })
            throw error
        }

        const user = await User.findOne({ email: email })

        if (user.isVerified == false) {
            console.log('El usuario no está verificacado') //Eliminar este clg

            otp = Math.floor(100000 + Math.random() * 900000);
            console.log("OTP: " + otp)

            const otpUser = await Otp.findOne({ email: email })

            if (!otpUser) {
                const newOtp = new Otp({
                    otp: otp,
                    email: email
                })

                await newOtp.save()

                await transporter.sendMail({
                    to: email,
                    from: 'example@example.com',
                    subject: 'Verificación de cuenta para Tutoripolis',
                    html: `
                        <h1>Bienvenido a Tutoripolis</h1>
                        <p>Hola ${user.name},</p>
                        <p>Por favor verifique su correo electrónico para activar tu cuenta.</p>
                        <p>El código es el siguiente: ${otp}</p>
                        `
                })

                console.log("OTP enviado " + otp)
                return res.status(422).json({
                    message: "Aún no has verificado tu cuenta. Un nuevo código ha sido enviado a tu correo electrónico.",
                    redirect: true
                })
            } else {
                otpUser = otp
                await otpUser.save()

                await transporter.sendMail({
                    to: email,
                    from: 'example@example.com',
                    subject: 'Verificación de cuenta para Tutoripolis',
                    html: `
                        <h1>Bienvenido a Tutoripolis</h1>
                        <p>Hola ${user.name},</p>
                        <p>Por favor verifique su correo electrónico para activar tu cuenta.</p>
                        <p>El código es el siguiente: ${otp}</p>
                        `
                })

                console.log("OTP enviado: " + otp)
                return res.status(422).json({
                    message: "Aún no has verificado tu cuenta. Un nuevo código ha sido enviado a tu correo electrónico.",
                    redirect: true
                })
            }
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            const error = new Error("Contraseña incorrecta.")
            error.statusCode(401)
            error.data = {
                param: "password",
                location: "login"
            }
            res.status(401).json({
                message: "Contraseña incorrecta"
            })
            throw error
        }

        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            api_key.JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.status(200).json({
            message: "Inicio de sesión correcto",
            token: token,
            userId: user._id.toString()
        })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        console.log(email);
        let otp = Math.floor(100000 + Math.random() * 900000);

        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("Validation Failed");
            error.statusCode = 401;
            error.data = { value: email, message: "User doesn't exist" };
            throw error;
        } else {
            const newOtp = new Otp({
                otp: otp,
                email: email
            });
            await newOtp.save();

            transporter.sendMail({
                to: email,
                from: "ayush1911052@akgec.ac.in",
                subject: "Reset Password for shelp",
                html: `<h1>This is your OTP to reset your password: ${otp}</h1>`
            });
            console.log("Mail sent ", otp);

            res.status(201).json({ message: "OTP sent to reset password" });
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.resetOtpVerification = async (req, res, next) => {
    try {
        const email = req.body.email
        const otp = req.body.otp
        console.log("Reset OTP " + otp)

        const user = await Otp.findOne({
            email: email
        })

        if (!user) {
            const error = new Error("Validación fallida")
            error.statusCode = 401;
            error.data = {
                value: email,
                message: "El OTP no existe o ya expiró"
            }
            throw error
        }

        if (user.otp == otp) {
            const matched = await Otp.findOne({
                email: email
            })
            matched.isVerified = true
            await matched.save()
            res.status(201).json({
                message: "Correo verificado correctamente",
                email: email
            })
        } else {
            res.status(401), json({
                message: "Código de verificación incorrecto",
                email: email
            })
        }

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
            console.log(error)
        }
        next(error)
    }
}

exports.newPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        let resetUser;

        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("El usuario con este correo no existe");
            error.statusCode = 401;
            error.data = { value: email, message: "El usuario con este correo no existe." };
            throw error;
        }

        if (user.resetVerified) {
            resetUser = user;
            resetUser.resetVerified = false;
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            resetUser.password = hashedPassword;
            await resetUser.save();
            res.status(201).json({ message: "Contraseña cambiada con éxito" });
        } else {
            res.status(401).json({ message: "Verifica tu cuenta primero, por favor." });
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}