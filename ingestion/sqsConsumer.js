import { Consumer } from 'sqs-consumer';
import storeS3Content from "./pullS3Content.js";
import {sqsClient} from "../utils/awsUtil.js";
import ingest from "./ingest.js"
import {GetObjectCommand} from "@aws-sdk/client-s3";
import configs from "../configs/config.js";
import fs from "fs";

const queueUrl = 'https://sqs.us-west-2.amazonaws.com/648508847588/logging-solution-hackathon';
console.log("Creating a sqs consumer on queueUrl : ", queueUrl);

const getFilePath = (object) => {

    // Object : AtochaExampleService/4d5b68eb-0fb4-4c3d-bedf-a833f53a58bf
    console.log("Object :",object)

    let folders = object.split('/')

    if(folders.length !=2) return null;

    const  [serviceName,fileName] = folders

    // FileName : 4d5b68eb-0fb4-4c3d-bedf-a833f53a58bf
    console.log("FileName :",fileName)

    const absolutePathToFolder = `${configs.RAW_LOGS_FOLDER}/${serviceName}`
    //test path
    // const absolutePathToFolder = `../Logs/${serviceName}`

    const filePath = `${absolutePathToFolder}/${fileName}`

    if (!fs.existsSync(absolutePathToFolder)) {
        console.log(absolutePathToFolder)
        fs.mkdir(absolutePathToFolder,
            { recursive: true },
            (err)=>
                err ? console.log("error creating folder") : console.log(`created folder ${absolutePathToFolder}`)
        );
        console.log("Created the folder ...")
    }

    console.log("FilePath : ",filePath)

    return filePath
}

const downloadS3Content  = async (sqsMessage)=> {
        const message = sqsMessage.Records[0]

        const bucketName = message.s3.bucket.name
        const object = message.s3.object.key

        const filePath = getFilePath(object)
        if (filePath == null) {
          throw new Error("Incorect file path in s3");
        }
        let params = {
            "Bucket": bucketName,
            "Key": object
        }

        const command = new GetObjectCommand(params)

        console.log(`Handling : S3 bucket name : ${bucketName} , Object : ${object}`)

        await storeS3Content(filePath, command)

        return filePath
}

function messageHandler(message) {
  return new Promise((resolve, reject) => {
    try {
      const messageBody = JSON.parse(message.Body)
      console.log("Recieved a message : ", messageBody)
      // download the file from S3 to logFile ({serviceName}/${year}/${month}/${day}/${hour}/${minute})

      //assumption : for hackathon scope , we are assuming that we get a single log file per minute.
      downloadS3Content(messageBody)
          .then(function(filePath) {
                  return ingest(filePath)
          })
          .then(function(stdout) {
            resolve()
          })
          .catch(function (error){
            console.warn(`Failure in handling sqs message with error : ${error}`)
            reject()
          })
    } catch (error) {
      console.warn(`Failure in handling sqs message with error : ${error}`)
      reject()
    }
    
  })
}

const sqsConsumer = Consumer.create({
  queueUrl: queueUrl,
  handleMessage: messageHandler,
  sqs: sqsClient
});

sqsConsumer.on('error', (err) => {
  console.error(err);
});

sqsConsumer.on('processing_error', (err) => {
  console.error(err);
});

sqsConsumer.on('timeout_error', (err) => {
  console.error(err);
});

export default sqsConsumer;
