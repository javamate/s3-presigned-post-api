const S3 = require("aws-sdk/clients/s3");
const mime = require("mime");
const BUCKET = process.env.BUCKET
const FILES_KEY = process.env.FILES_KEY
const MIN_FILE_SIZE_BYTES = process.env.MIN_FILE_SIZE_BYTES || 100 // 100 Bytes
const MAX_FILE_SIZE_BYTES = process.env.MAX_FILE_SIZE_BYTES || 10000000 // 10MB

/**
 * Use AWS SDK to create pre-signed POST data.
 * We also put a file size limit (MIN_FILE_SIZE_BYTES - MAX_FILE_SIZE_BYTES).
 * @param key
 * @param contentType
 * @returns {Promise<object>}
 */
const createPresignedPost = ({ key, contentType }) => {
  const s3 = new S3();
  const params = {
    Expires: 60,
    Bucket: BUCKET,
    Conditions: [["content-length-range", MIN_FILE_SIZE_BYTES, MAX_FILE_SIZE_BYTES]], //Bytes
    Fields: {
      "Content-Type": contentType,
      key
    }
  };

  return new Promise(async (resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

/**
 * We need to respond with adequate CORS headers.
 * @type {{"Access-Control-Allow-Origin": string, "Access-Control-Allow-Credentials": boolean}}
 */
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

// Note this is using JS destructuring to grab just the body from the event
module.exports.getPresignedPostData = async ({ body }) => {
  try {
    console.log('getPresignedPostData function invoked');
    console.log(`Request body stringified: ${JSON.stringify(body)}`);
    const { name } = JSON.parse(body);
    const mimeType = mime.getType(name);
    var fileSubPath = '';
    if (mimeType === 'audio/mpeg') {
        fileSubPath = 'audio/';
    } else if (mimeType === 'application/pdf') {
        fileSubPath = 'docs/';
    }
    const presignedPostData = await createPresignedPost({
      key: `${FILES_KEY}${fileSubPath}${name}`,
      contentType: mimeType
    });

    return {
      statusCode: 200,
      headers,
      isBase64Encoded: false,
      body: JSON.stringify({
        error: false,
        data: presignedPostData,
        message: null
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      isBase64Encoded: false,
      body: JSON.stringify({
        error: true,
        data: null,
        message: e.message
      })
    };
  }
};