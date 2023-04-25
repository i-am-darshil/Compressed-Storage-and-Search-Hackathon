import { Consumer } from 'sqs-consumer';
import { SQSClient } from '@aws-sdk/client-sqs';
import ingest from "./ingest.js"
import CREDS from "../configs/creds.js"
import configs from "../configs/config.js"


const queueUrl = 'https://sqs.us-west-2.amazonaws.com/648508847588/logging-solution-hackathon';
console.log("Creating a sqs consumer on queueUrl : ", queueUrl);

function messageHandler(message) {
  return new Promise((resolve, reject) => {
    console.log("Recieved a message : ", message)

    let logFile = `${configs.RAW_LOGS_FOLDER}/abc/2023/04/21/06/13`
    // download the file from S3 to logFile ({serviceName}/${year}/${month}/${day}/${hour}/${minute})

    ingest(logFile)
      .then(function(stdout) {
        resolve()
      })
      .catch(function (error){
        console.warn(`Failure in handling sqs message with error : ${error}`)
        resolve()
      })
  })
 

}

const sqsConsumer = Consumer.create({
  queueUrl: queueUrl,
  handleMessage: messageHandler,
  sqs: new SQSClient({
    region: 'us-west-2',
    credentials: {
      accessKeyId: CREDS.ACCESS_KEY,
      secretAccessKey: CREDS.SECRET_KEY
    }
  })
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
