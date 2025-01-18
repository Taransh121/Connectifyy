const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images and documents are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
