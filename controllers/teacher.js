import Course from '../model/courses';


exports.uploadCourse = async (req, res, next) => {
    try {
        const imageurl = req.file.path;
        const userId = req.body._id;
        const { title, category, name, willLearn, discription, discriptionLong, requirement, price } = req.body;

        console.log(userId, title);

        const course = new Course({
            title: title,
            category: category,
            imageurl: imageurl,
            name: name,
            willLearn: willLearn,
            discription: discription,
            discriptionLong: discriptionLong,
            requirement: requirement,
            rating: 0,
            price: price,
            creator: userId,
        });

        const result = await course.save();
        console.log(result);
        res.status(201).json({ message: "Tutoría creada correctamente", newCourse: result });
    } catch (err) {
        console.log(err);
    }
};

exports.uploadVideo = async (req, res, next) => {
    try {
        const courseId = req.params.courseID;
        console.log(req.files);
        const videos = req.files;

        let videoContent = [];

        const course = await Course.findOne({ _id: courseId });

        videos.forEach(video => {
            let videoContentContainer = {
                videoUrl: null,
                usersWatched: [],
            };
            videoContentContainer.videoUrl = video.path;
            videoContent.push(videoContentContainer);
        });

        console.log(videoContent);
        course.videoContent = videoContent;
        const result = await course.save();
        res.status(200).json({ message: "Video subido correctamente" });
    } catch (err) {
        console.log(err);
    }
};

exports.watchedByUsers = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const videoId = req.body.videoId;
        const courseId = req.body.courseId;
        console.log(videoId);
        const course = await Course.findById({ _id: courseId });

        course.videoContent.every(video => {
            console.log(video);
            if (video._id == videoId) {
                if (!video.usersWatched.includes(userId)) {
                    video.usersWatched.push(userId);
                }
                return false;
            }
            return true;
            console.log("ran");
        });

        await course.save();
        console.log(course.videoContent);
        res.status(200).json({ message: "ko" });
    } catch (err) {
        console.log(err);
    }
};

exports.teacherHome = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const courses = await Course.find({ creator: userId });
        res.status(200).json({ data: courses });
    } catch (err) {
        console.log(err);
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const courseId = req.body.courseId;
        await Course.findByIdAndRemove({ _id: courseId });
        res.status(200).json({ message: "Tutoría eliminada correctamente" });
    } catch (err) {
        console.log(err);
    }
};

exports.editCourse = async (req, res, next) => {
    try {
        const courseId = req.body.courseId;
        const course = await Course.findOne({ _id: courseId });
        res.status(200).json({ course });
    } catch (err) {
        console.log(err);
    }
};

exports.updateCourse = async (req, res, next) => {
    try {
        const courseId = req.body.courseId;
        const { title, category, name, willLearn, discription, discriptionLong, requirement, price } = req.body;

        const course = await Course.findOneAndUpdate({ _id: courseId }, {
            $set: {
                title: title,
                category: category,
                name: name,
                willLearn: willLearn,
                discription: discription,
                discriptionLong: discriptionLong,
                requirement: requirement,
                price: price
            }
        }, { new: true });

        if (!course) {
            return res.status(404).json({ message: "Tutoría no encontrada" });
        }

        res.status(200).json({ message: "Tutoría subida correctamente", course: course });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Tutoría fallida al subir" });
    }
}
