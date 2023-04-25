import {S3Client,GetObjectCommand} from "@aws-sdk/client-s3";

import CREDS from "../creds.js"; // ES Modules import
import fs from 'fs';

const config = {
    region: 'us-west-2',
    credentials: {
        accessKeyId: CREDS.ACCESS_KEY,
        secretAccessKey: CREDS.SECRET_KEY
    }
}

const s3client = new S3Client(config)


const getFilePath = (bucketName, object, s3ARN) => {


    const fileName = `${bucketName}_${object}`

    return "./Logs/"+((fileName.split('.'))[0])+".txt";
}


const writeToFile = (readableContent,writeStream) =>
    new Promise((resolve,reject)=>{

        readableContent.on('data',(chunk)=>{
            writeStream.write(chunk)
        })

        readableContent.on("error", (er)=>{
            console.log("[readableContent on Error] Error while reading content in chunks from s3 : ",er)
            reject()
        });

        writeStream.on("error",(er)=>{
            console.log("[writestream on Error] Error while writing content to file :",er)
        })

        readableContent.on("end", ()=>{
            writeStream.end()
            writeStream.on('finish', () => {
                console.log("All the data has been written");
            })
            resolve()
        });

    })

const storeS3Content = async (bucketName,object,s3Arn)=>
{
    let params = {
        "Bucket": bucketName,
        "Key": object
    }
    const command = new GetObjectCommand(params)

    const filePath = getFilePath(bucketName,object,s3Arn)

    let response;
    try
    {
        response = await s3client.send(command)
    }
    catch (er)
    {
        console.log("Error while retrieving content from s3 :",er);
    }


    let writeStream = fs.createWriteStream(filePath)

    await writeToFile(response.Body,writeStream)

}

const downloadS3Content  = (sqsMessage)=>
{
    sqsMessage.Records.forEach((message)=> {

            const bucketName = message.s3.bucket.name
            const object =decodeURIComponent(message.s3.object.key)

            const s3ARN = message.s3.bucket.arn

            console.log(`Handling : S3 bucket name : ${bucketName} , Object : ${object}`)

            storeS3Content(bucketName, object, s3ARN).then(
                ()=>
                    console.log("Done writing the s3 content of object "+object+" onto a file under Logs folder")
            )
        }
    )

}

export default downloadS3Content