import express from 'express';
import multer from 'multer';

const teacherController = require('../controllers/teacher');
const Auth = require('../Authentication/is-auth');

const router = express.Router();

// Configuración de almacenamiento y filtro de archivos para imágenes
const imageFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toDateString() + '-' + file.originalname);
    }
});

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Configuración de almacenamiento y filtro de archivos para videos
const videoFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'videos');
    },
    filename: (req, file, cb) => {
        const currentDate = new Date();
        cb(null, currentDate.toDateString() + '-' + file.originalname);
    }
});

const videoFileFilter = (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
        cb(null, true);
    } else {
        cb(null, false);
        console.log('Wrong file type');
    }
};

const imageMulter = multer({ storage: imageFileStorage, fileFilter: imageFileFilter }).single('image');
const videoMulter = multer({ storage: videoFileStorage, fileFilter: videoFileFilter }).any();

router.post('/creator/create-course', imageMulter, teacherController.uploadCourse);
router.post('/creator/videoUpload/:courseID', videoMulter, teacherController.uploadVideo);
router.post('/creater/homepage', Auth.authentication, teacherController.teacherHome);
router.post('/course/delete', Auth.authentication, teacherController.deleteCourse);
router.post('/course/edit', Auth.authentication, teacherController.editCourse);
router.put('/course/update', imageMulter, teacherController.updateCourse); // Corregido: cambio de "router.post" a "router.put"
router.post('/watchedByuser', teacherController.watchedByUsers);

module.exports = router;
