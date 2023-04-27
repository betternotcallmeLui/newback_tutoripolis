import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const courseSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        authorName: {
            type: String,
            required: true
        },
        willLearn: {
            type: String,
            required: true
        },
        shortDescription: {
            type: String,
            required: true
        },
        longDescription: {
            type: String,
            required: true
        },
        requirements: {
            type: String,
            required: false
        },
        price: {
            type: String,
            required: true
        },
        creator: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        bookmark: [
            {
                type: Schema.Types.ObjectId,
                required: false,
                ref: 'User'
            }
        ],
        videoContent: [
            {
                videoUrl: {
                    type: String,
                    required: true
                },
                userWatched: {
                    type: Schema.Types.ObjectId,
                    required: false,
                    ref: 'User'
                }
            }
        ],
        rating: {
            ratingSum: {
                type: Number,
                required: false,
                default: 0
            },
            timesUpdated: {
                type: Number,
                required: false,
                default: 0
            },
            ratingFinal: {
                type: Number,
                required: false,
                default: 0
            }
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Course', courseSchema);