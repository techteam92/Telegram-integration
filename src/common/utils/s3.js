const AWS = require('aws-sdk');
const config = require('../config/config');
const multer = require('multer');
const multerS3 = require('multer-s3');
const ApiError = require('../response/error');
const httpStatus = require('http-status');
const logger = require('./logger');

AWS.config.update({
    accessKeyId: config.s3.AWS_S3_KEY,
    secretAccessKey: config.s3.AWS_S3_SECRET,
    region: config.s3.AWS_S3_REGION,
});

const s3 = new AWS.S3();
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new ApiError(httpStatus.BAD_REQUEST, 'Only image files are allowed'), false);
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 },
});

const uploadFileToS3 = async (file) => {
    if (!file || !file.buffer) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'File buffer is empty or undefined');
      }    
    try {
        const uploadParams = {
            Bucket: 'solo-connect-media',
            Key: Date.now().toString() + '-' + file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        console.log('Uploading file to S3 with params:', uploadParams);  
        const data = await s3.upload(uploadParams).promise();
        console.log('File uploaded successfully:', data);  
        return data.Location;
    } catch (error) {
        console.log('Error uploading file to S3:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error uploading file to S3');
    }
};

module.exports = {
    upload,
    uploadFileToS3,
};