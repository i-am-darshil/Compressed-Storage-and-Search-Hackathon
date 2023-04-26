import execShellCommand from "../utils/util.js";
import configs from "../configs/config.js";
import {uploadToS3} from "./s3Upload.js";
import { v4 as uuidv4 } from 'uuid';
import {unlink} from "fs/promises";

function query(req,res) {
  const serviceName = req.query.serviceName;
  const searchQuery = req.query.searchQuery;
  const startWindow = req.query.startWindow; //Format will be : yy/mm/dd/hh/mm
  const endWindow = req.query.endWindow; //Format will be : yy/mm/dd/hh/mm

  let command = `cd ${configs.CLP_ROOT} && sudo ./sbin/search '${searchQuery}'`;
  // Below line is for mocking and testing
  // let command = `echo`;

  let startWindowArr = startWindow.split("/")
  let endWindowArr = endWindow.split("/")
  

  let startDate = new Date(startWindowArr[0], startWindowArr[1], startWindowArr[2], startWindowArr[3], startWindowArr[4], 0, 0)
  let endDate = new Date(endWindowArr[0], endWindowArr[1], endWindowArr[2], endWindowArr[3], endWindowArr[4], 0, 0)

  let loop = startDate;
  while(loop <= endDate){
    let minute = loop.getMinutes()
    if (minute < 10) minute = `0${minute}`

    let hour = loop.getHours()
    if (hour < 10) hour = `0${hour}`

    let day = loop.getDate();
    if (day < 10) day = `0${day}`
  
    let month = loop.getMonth();
    if (month < 10) month = `0${month}`

    let year = loop.getFullYear();
    if (year < 10) year = `0${year}`

    let logPath = `${configs.RAW_LOGS_FOLDER}/${serviceName}/${year}/${month}/${day}/${hour}/${minute}`
    command += ` --file-path ${logPath}`
    loop.setTime(loop.getTime() + 1000 * 60);
  }
  
  const resultsFilePath = `${configs.QUERY_RESULTS_FOLDER}/${serviceName}_${uuidv4()}`;
  // Below line is for mocking and testing
  // const resultsFilePath = "testResult.log";

  command += ` > ${resultsFilePath}`

  console.log("Recieved a query request. serviceName : " + serviceName + ",searchQuery : " + searchQuery);
  
  execShellCommand(command)
      .then(function (status) {
        console.log(`Executed ${command} with status : ${status}`);
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
        console.log(`Successfully deleted the file ${resultsFilePath}`);
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