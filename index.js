'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const Sharp = require('sharp');

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_URL = process.env.BUCKET_URL;

exports.handler = function (event, context, callback) {
    let key = event.queryStringParameters.key;
    let imageSize = key.slice(0, key.indexOf('/'));
    let imageDimensions = imageSize.split('x');
    let imageWidth = parseInt(imageDimensions[0]);
    let imageHeight = parseInt(imageDimensions[1]);
    let imagePath = key.slice(key.indexOf('/') + 1);

    S3.getObject({
        Bucket: BUCKET_NAME, 
        Key: imagePath,
    })
    .promise()
    .then(data => {
        let image = Sharp(data.Body).resize(imageWidth, imageHeight).toFormat("png");
        return image.toBuffer();
    })
    .then(buffer => {
        S3.putObject({
            Body: buffer,
            Bucket: BUCKET_NAME,
            ContentType: 'image/png',
            Key: key,
        }).promise();
    })
    .then(() => callback(null, {
        statusCode: '301',
        headers: {
            'location': `${BUCKET_URL}/${key}`
        },
        body: '',
    }))
    .catch(err => callback(err));
}
