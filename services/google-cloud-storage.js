const { Storage } = require('@google-cloud/storage');
const path = require('path');

const GOOGLE_CLOUD_PROJECT_ID = 'skillthrive';
const GOOGLE_CLOUD_KEYFILE = path.join(
  __dirname,
  '../skillthrive-6763dcaafb86.json'
);

exports.storage = new Storage({
  projectId: GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: GOOGLE_CLOUD_KEYFILE,
});

exports.getPublicUrl = (bucketName, fileName) =>
  `https://storage.googleapis.com/${bucketName}/${fileName}`;
