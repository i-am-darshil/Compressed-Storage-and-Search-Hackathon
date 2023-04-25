import execShellCommand from "../utils/util.js"
import configs from "../configs/config.js"
import { v4 as uuidv4 } from "uuid";


function query(req,res) {
  const serviceName = req.query.serviceName;
  const searchQuery = req.query.searchQuery;
  const startWindow = req.query.startWindow; //Format will be : yy/mm/dd/hh/mm
  const endWindow = req.query.endWindow; //Format will be : yy/mm/dd/hh/mm

  let command = `cd ${configs.CLP_ROOT} && sudo ./sbin/search ${searchQuery}`;
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
  .then(function (resultsFilePath){
    // Upload resultsFilePath to s3
    // return s3 url
    const s3url = "https://logging-solution-hackathon.s3.us-west-2.amazonaws.com/test.log";
    console.log(`${resultsFilePath} uploaded to s3, s3url : ${s3url}`);
    return s3url;
  }).then(function (s3url) {
    // delete the resultsFilePath

    console.log(`${resultsFilePath} deleted`);

    let response = {
      "s3URL": s3url
    };

    res.json(response);
  })
  .catch(function (err) {
    let response = {
      "s3URL": "An error occured :(",
      "error": err
    };
    res.status(500)
    res.json(response)
  })

}

export default query;
