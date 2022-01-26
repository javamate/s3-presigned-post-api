# s3-presigned-post-api
API for creating pre-signed POST params to upload content directly to AWS S3.

This creates a simple CloudFormation stack with an API Gateway backed by a lambda function that generates S3 presigned post params to enable uploading files directly to S3. This works even on a bucket without public access as long as the lambda has permissions to put objects to the bucket.

## How it works
The API is very simple. It expects a POST request to be made which contains a JSON object with a single property called `name` that contains the value of the file name to be uploaded to S3. It returns S3 presigned post params for the specified file in the bucket defined in the stack. Those params can then be used to upload the specified file directly to S3.

## Testing locally
First, run `npm install`  

To test things locally, you'll need the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).  Once you have it installed, you can run:  
`sam build`  
`sam local invoke -e events/test.json`  

The output should be JSON that includes a valid S3 presigned post request (assuming you have active default AWS credentials, otherwise you'll likely get an error). You can specify your profile with the `--profile` option, e.g., `sam local invoke -e events/test.json --profile myProfile`.

## Deploying the stack
You can deploy the stack with `sam deploy --guided`.