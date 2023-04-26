import {s3client} from "../utils/awsUtil.js";
import fs from 'fs';

const writeToFile = (readableContent,writeStream) =>
    new Promise((resolve,reject)=>{

        readableContent.on('data',(chunk)=>{
            writeStream.write(chunk)
        })

        readableContent.on("error", (er)=>{
            console.log(`[readableContent on Error] Error while reading content in chunks from s3 : ,${er}`)
            reject()
        });

        writeStream.on("error",(er)=>{
            console.log(`[writestream on Error] Error while writing content to file :,${er}`)
            reject()
        })

        readableContent.on("end", ()=>{
            writeStream.end()
            writeStream.on('finish', () => {
                console.log("All the data has been written");
                resolve()
            })
        });

    })

const storeS3Content = async (filePath,command)=>
{
    let response;

    try
    {
        response = await s3client.send(command)
    }
    catch (er)
    {
        console.log(`Error while retrieving content from s3 for [${filePath}]:,${er}`);
    }

    let writeStream = fs.createWriteStream(filePath)

    try
    {
        await writeToFile(response.Body,writeStream)
    }
    catch(er)
    {
        console.log(`Error while writing to a filepath [${filePath}]:,${er}`);
    }


}

export default storeS3Content

