const { Storage } = require('@google-cloud/storage');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from a .env file, if present
dotenv.config();

// Configuration for Google Cloud Storage
const storage = new Storage({
    keyFilename: path.join(__dirname, '..', '..', process.env.GCS_KEYFILE), // Use the path from .env
    projectId: process.env.GCS_PROJECT_ID, // Use the project ID from .env
});

const bucketName = process.env.GCS_BUCKET; // Use the bucket name from .env

/**
 * Uploads a file to Google Cloud Storage
 * @param {string} filePath - The local path to the file
 * @param {string} destination - The destination path in the bucket
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
async function uploadFile(filePathOrBuffer, destination, regionName) {
    const destinationPath = `${regionName}/${destination}`;
    
    if (Buffer.isBuffer(filePathOrBuffer)) {
        // Handle buffer upload (for memory storage)
        const file = storage.bucket(bucketName).file(destinationPath);
        await file.save(filePathOrBuffer, {
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });
    } else {
        // Handle file path upload (for disk storage)
        await storage.bucket(bucketName).upload(filePathOrBuffer, {
            destination: destinationPath,
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });
    }

    // The public URL can be used to directly access the file via HTTP
    return `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
}


/**
 * Deletes a file from Google Cloud Storage
 * @param {string} filename - The name of the file to delete
 */
async function deleteFile(filename) {
    try {
        await storage.bucket(bucketName).file(filename).delete();
        console.log(`Deleted file: ${filename}`);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Unable to delete file');
    }
}

module.exports = {
    uploadFile,
    deleteFile,
};
