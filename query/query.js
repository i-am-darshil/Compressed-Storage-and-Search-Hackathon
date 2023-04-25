import execShellCommand from "../utils/util.js"
import configs from "../configs/config.js"


function query(req,res) {
  const serviceName = req.query.serviceName;
  const searchQuery = req.query.searchQuery;
  const command = `cd ${configs.CLP_ROOT} && sudo ./sbin/search ${searchQuery}`;

  console.log("Recieved a query request. serviceName : " + serviceName + ",searchQuery : " + searchQuery);
  
  execShellCommand(command)
  .then(function (stdout) {
    console.log(`Executing ${command} \n`,stdout);

    const searchS3URL = "https://logging-solution-hackathon.s3.us-west-2.amazonaws.com/test.log";

    let response = {
      "s3URL": searchS3URL
    };

    res.json(response);
  })

}

export default query;
