import fs from 'fs';
import {S3Client,PutObjectCommand} from "@aws-sdk/client-s3";
import CREDS from "../creds.js";
import { Upload } from "@aws-sdk/lib-storage";

const config = {
    region: 'us-west-2',
    credentials: {
        accessKeyId: CREDS.ACCESS_KEY,
        secretAccessKey: CREDS.SECRET_KEY
    }
}

const s3client = new S3Client(config)

const BUCKET_TO_UPLOAD = "logging-solution-hackathon"

const uploadToS3 = async (filePath)=>{
    //get the content from filepath and write to the s3 stream .
    const readStream = fs.createReadStream(filePath)
    const fileName = filePath.split('/').slice(-1)[0]
    console.log("Filename : ", fileName)
    const response = await uploadToS3Content(readStream,fileName)
    return response;
}

const uploadToS3Content = async (fileContent,fileName)=>{

    try {
        const parallelUploads = new Upload({
            client: s3client,
            leavePartsOnError: false, // optional manually handle dropped parts
            params: {
                "Bucket": BUCKET_TO_UPLOAD,
                "Key": fileName,
                "Body": fileContent // Body is stream which enables streaming
            },
        });

        parallelUploads.on("httpUploadProgress",(progress)=>{
            console.log("Progress : ",progress);
        });

        const response = await parallelUploads.done()
        return response.Location

    } catch (e) {
        console.log(e);
    }
}

export default uploadToS3;
export default uploadToS3Content;