import configs from "../configs/config.js"
import execShellCommand from "../utils/util.js"
import {uploadToS3} from "./s3Upload.js";
import {unlink} from "fs/promises";

function detailLog(req,res) {
  try {
    const serviceName = req.query.serviceName;
    const timeWindow = req.query.timeWindow; //Format will be : yyyy/mm/dd/hh/mm

    if (serviceName == null || timeWindow == null) {
      let response = {
        "s3URL": "An error occured :(",
        "error": "serviceName, timeWindow are required parameters "
      };
      res.status(400)
      res.json(response)
      return
    }

    let minuteLogToDecompress = `${configs.RAW_LOGS_FOLDER}/${serviceName}/${timeWindow}`

    // RAW_LOGS_FOLDER already has a / at start
    let resultsFilePath = `${configs.DECOMPRESSED_LOGS_FOLDER}${minuteLogToDecompress}`

    let command = `cd ${configs.CLP_ROOT} && sudo ./sbin/decompress -d ${configs.DECOMPRESSED_LOGS_FOLDER} ${minuteLogToDecompress}`;
    // Below line is for mocking and testing
    // let command = `echo ${minuteLogToDecompress} ${resultsFilePath}`;

    console.log("Recieved a decompress request. serviceName : " + serviceName + ",timeWindow : " + timeWindow);

    execShellCommand(command)
    .then(function (status) {
      console.log(`Executed ${command} with status : ${status}`);
      return resultsFilePath
    })
    .then(function (resultsFilePath){
      // Upload resultsFilePath to s3
      // return s3 url
      console.log(`Uploading to ${resultsFilePath} to s3`);
      return uploadToS3(resultsFilePath)
    }).then(function (s3url) {
      console.log(`Successfully uploaded to s3. Returning ${s3url} as response`);
      let response = {
        "s3URL": s3Url
      };
      res.status(200);
      res.json(response);
      return;
    })
    .then(()=>{
      //delete the file
      console.log(`Deleting the file : ${resultsFilePath}`)
      return unlink(resultsFilePath)
    })
    .then(()=>{
      console.log(`Successfully deleted the file ${resultsFilePath}`);
    })
    .catch(function (err) {
      console.error(`Error occured : ${err}`)
      let response = {
        "s3URL": "An error occured :(",
        "error": err
      };
      res.status(500)
      res.json(response)
    })
    
  } catch (error) {
    console.error(`Error occured : ${error}`)
    let response = {
      "s3URL": "An error occured :(",
      "error": error
    };
    res.status(500)
    res.json(response)
  }
}

export default detailLog;
