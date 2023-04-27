import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: false
    },
    resetVerified: {
        type: Boolean,
        required: false
    },
    courses: [
        {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Course'
        }
    ],
    preferences: [
        {
            type: String
        }
    ],
    favorites: [
        {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Course'
        }
    ]
})

module.exports = mongoose.model('User', userSchema);