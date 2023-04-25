import { Consumer } from 'sqs-consumer';
import downloadS3Content from "./pullS3Content.js";
import {sqsClient} from "../utils/awsUtil.js";

const queueUrl = 'https://sqs.us-west-2.amazonaws.com/648508847588/logging-solution-hackathon';
console.log("Creating a sqs consumer on queueUrl : ", queueUrl);

const sqsConsumer = Consumer.create({
  queueUrl: queueUrl,
  handleMessage: async (message) => {
    console.log("Recieved a message : ", JSON.parse(message.Body))
    downloadS3Content(JSON.parse(message.Body))
  },
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
