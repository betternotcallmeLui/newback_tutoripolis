import stripe from "stripe"

import api_key from '../config/config'
import Course from '../model/courses'

const stripe = stripePackage(api_key.stripePayment)

exports.stripeCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById({ _id: courseId });
        res.status(200).json({ course: course });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
}

exports.stripePayment = async (req, res) => {
    try {
        let { amount, id } = req.body;
        console.log(amount, id);

        if (!amount || typeof amount !== "number" || !id || typeof id !== "string") {
            return res.status(400).json({
                message: "Bad Request",
                success: false,
            });
        }

        const response = await stripe.paymentIntents.create({
            amount: amount,
            currency: CURRENCY,
            description: "no",
            payment_method: id,
            confirm: true,
        });

        console.log(response);
        res.status(200).json({
            message: "Pago correcto",
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Pago fallido",
            success: false,
        });
    }
}
