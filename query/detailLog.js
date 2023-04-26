import configs from "../configs/config.js"
import execShellCommand from "../utils/util.js"

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

    let minuteLogToDecompress = `${configs.RAW_LOGS_FOLDER}/${timeWindow}`

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
      const s3url = "https://logging-solution-hackathon.s3.us-west-2.amazonaws.com/test.log";
      console.log(`${resultsFilePath} uploaded to s3, s3url : ${s3url}`);
      return s3url;
    }).then(function (s3url) {
      // delete the resultsFilePath

      console.log(`${resultsFilePath} deleted`);

      let response = {
        "s3URL": s3url
      };

      res.status(200)
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
