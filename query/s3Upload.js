import fs from 'fs';
import { Upload } from "@aws-sdk/lib-storage";
import {s3client,BUCKET_TO_UPLOAD} from "../utils/awsUtil.js";

export const uploadToS3 = async (filePath)=>{
    //get the content from filepath and write to the s3 stream .
    const readStream = fs.createReadStream(filePath)
    const fileName = filePath.split('/').slice(-1)[0]
    console.log(`Uploading the file : , ${fileName}`)
    const response = await uploadToS3Content(readStream,fileName)
    if (response == null) {
      throw new Error(`Upload to S3 failed for ${filePath}`);
    }
    return response;
}

export const uploadToS3Content = async (fileContent,fileName)=>{

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
