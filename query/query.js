import execShellCommand from "../utils/util.js"
import configs from "../configs/config.js"
import { v4 as uuidv4 } from 'uuid';


function query(req,res) {
  const serviceName = req.query.serviceName;
  const searchQuery = req.query.searchQuery;
  const startWindow = req.query.startWindow;
  const endWindow = req.query.endWindow;
  
  const resultsFilePath = `/${configs.QUERY_RESULTS_FOLDER}/${serviceName}/${uuidv4()}`;
  // Below line is for mocking and testing
  // const resultsFilePath = "testResult.log";

  const command = `cd ${configs.CLP_ROOT} && sudo ./sbin/search ${searchQuery} > ${resultsFilePath}`;
  // Below line is for mocking and testing
  // const command = `ls > ${resultsFilePath}`;

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
