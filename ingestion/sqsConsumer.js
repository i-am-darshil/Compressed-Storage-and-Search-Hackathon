import { Consumer } from 'sqs-consumer';
import storeS3Content from "./pullS3Content.js";
import {sqsClient} from "../utils/awsUtil.js";
import ingest from "./ingest.js"
import {GetObjectCommand} from "@aws-sdk/client-s3";
import configs from "../configs/config.js";

const queueUrl = 'https://sqs.us-west-2.amazonaws.com/648508847588/logging-solution-hackathon';
console.log("Creating a sqs consumer on queueUrl : ", queueUrl);

const getFilePath = (object) => {

  const filePath = `${configs.RAW_LOGS_FOLDER}/${object}`

  console.log("FilePath : ",filePath)

  return filePath
}

const downloadS3Content  = async (sqsMessage)=> {
        const message = sqsMessage.Records[0]

        const bucketName = message.s3.bucket.name
        const object = message.s3.object.key

        const filePath = getFilePath(object)

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
  })
}

const sqsConsumer = Consumer.create({
  queueUrl: queueUrl,
  handleMessage: messageHandler,
  sqs: sqsClient
});

sqsConsumer.on('error', (err) => {
  console.error(err.message);
});

sqsConsumer.on('processing_error', (err) => {
  console.error(err.message);
});

sqsConsumer.on('timeout_error', (err) => {
  console.error(err.message);
});

export default sqsConsumer;
