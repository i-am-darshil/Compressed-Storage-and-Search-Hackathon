import {S3Client} from "@aws-sdk/client-s3";
import {SQSClient} from "@aws-sdk/client-sqs";
import CREDS from "../creds.js";

const CONFIG = {
    region: 'us-west-2',
    credentials: {
        accessKeyId: CREDS.ACCESS_KEY,
        secretAccessKey: CREDS.SECRET_KEY
    }
}

export const s3client = new S3Client(CONFIG)
export const sqsClient = new SQSClient(CONFIG)
export const BUCKET_TO_UPLOAD = "logging-solution-hackathon"

