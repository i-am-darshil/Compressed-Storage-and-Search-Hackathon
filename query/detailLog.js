import configs from "../configs/config.js"
import execShellCommand from "../utils/util.js"
import {uploadToS3} from "./s3Upload.js";
import {unlink} from "fs/promises";

function detailLog(req,res) {
  try {
    const serviceName = req.query.serviceName;
    // const timeWindow = req.query.timeWindow; //Format will be : yyyy/mm/dd/hh/mm
    const requestId = req.query.requestId;

    if (serviceName == null || requestId == null) {
      let response = {
        "s3URL": "An error occured :(",
        "error": "serviceName, requestId are required parameters "
      };
      res.status(400)
      res.json(response)
      return
    }

    let requestIdLogToDecompress = `${configs.RAW_LOGS_FOLDER}/${serviceName}/${requestId}`

    // RAW_LOGS_FOLDER already has a / at start
    let resultsFilePath = `${configs.DECOMPRESSED_LOGS_FOLDER}${requestIdLogToDecompress}`

    let command = `cd ${configs.CLP_ROOT} && sudo ./sbin/decompress -d ${configs.DECOMPRESSED_LOGS_FOLDER} ${requestIdLogToDecompress}`;
    // Below line is for mocking and testing
    // let command = `echo ${requestIdLogToDecompress} ${resultsFilePath}`;

    console.log("Recieved a decompress request. serviceName : " + serviceName + ",requestId : " + requestId);
    let s3Path = "";

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
      s3Path = s3url;
      console.log(`Successfully uploaded to s3. Will ${s3Path} as response after deleting`);
      return();
    })
    .then(()=>{
      //delete the file
      console.log(`Deleting the file : ${resultsFilePath}`)
      return unlink(resultsFilePath)
    })
    .then(()=>{
      console.log(`Successfully deleted the file ${resultsFilePath}`);
      let response = {
        "s3URL": s3Path
      };
      res.status(200);
      res.json(response);
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
