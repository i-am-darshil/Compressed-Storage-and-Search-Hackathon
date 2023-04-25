import execShellCommand from "../utils/util.js";
import configs from "../configs/config.js";
import {uploadToS3} from "./s3Upload.js";
import { v4 as uuidv4 } from 'uuid';
import {unlink} from "fs/promises";

function query(req,res) {
  const serviceName = req.query.serviceName;
  const searchQuery = req.query.searchQuery;
  const startWindow = req.query.startWindow;
  const endWindow = req.query.endWindow;
  
  const resultsFilePath = `/${configs.QUERY_RESULTS_FOLDER}/${serviceName}_${uuidv4()}`;
  // Below line is for mocking and testing
  // const resultsFilePath = "testResult.log";

  const command = `cd ${configs.CLP_ROOT} && sudo ./sbin/search ${searchQuery} > ${resultsFilePath}`;
  // Below line is for mocking and testing
  // const command = `ls > ${resultsFilePath}`;

  console.log("Recieved a query request. serviceName : " + serviceName + ",searchQuery : " + searchQuery);
  
  execShellCommand(command)
      .then(function (stdout) {
    console.log(`Executing ${command} \n`,stdout);
    return resultsFilePath
      })
      .then((resultsFilePath)=>{
        return uploadToS3(resultsFilePath)
      })
      .then((s3Url)=>{
        let response = {
          "s3URL": s3Url
        };
        res.json(response)
      })
      .then(()=>{
        //delete the file
        return unlink(resultsFilePath)
      })
      .then(()=>{
        console.log("Successfully deleted the file");
      })
      .catch((err)=>{
        let response = {
          "s3URL": "An error occured :(",
          "error": err
        };
        res.status(500)
        res.json(response)
      })

}

export default query;
