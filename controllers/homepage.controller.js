import Course from '../model/courses'
import User from '../model/user'

exports.allCourses = async (req, res, next) => {
    try {
        const courses = await Course.find()
        res.status(200).json({ courses: courses })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

exports.fetchCourses = async (req, res, next) => {
    try {
        const category = req.params.course;
        const courses = await Course.find(category === 'all' || category === '' ? {} : { category });
        res.status(200).json({ course: courses });
    } catch (error) {
        console.log(error)
        next(error)
    }
}

exports.preferenceCourse = async (req, res, next) => {
    try {
        const category = req.params.course
        if (category === 'preferences') {
            const userId = req.body.userId
            const user = await User.findOne({ _id: userId })

            let courseArray = []
            let no_of_course = 0

            for (const preference of user.preferences) {
                const courses = await Course.find({ category: preference })
                no_of_course++
                courseArray.push(...courses)

                if (no_of_course === user.preferences.length) {
                    res.status(200).json({ course: courseArray })
                }
            }
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

exports.getPreferences = async (req, res, next) => {
    try {
        const preferencesArray = req.body.interest
        const userId = req.body.userId
        const user = await User.findOne({ _id: userId })

        user.preferences = preferencesArray
        await user.save()

        res.status(200).json({ message: "Preferencias añadidas" })
    } catch (error) {
        console.log(error)
        next(error)
    }
}