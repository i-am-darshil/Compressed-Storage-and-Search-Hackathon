import configs from "../configs/config.js"
import execShellCommand from "../utils/util.js"

function ingest(logFile) {
  return new Promise((resolve, reject) => {
    console.log(`Ingesting ${logFile} into CLP`)
    let command = `cd ${configs.CLP_ROOT} && sudo ./sbin/compress ${configs.CLP_ROOT}/${logFile}`;
    // Below line is for mocking and testing
    // let command = `ls`
    execShellCommand(command)
      .then(function (status) {
        console.log(`Executed ${command} with status : ${status}`);
        resolve(`Executed ${command} with status : ${status}`);
      })
      .catch(function (error) {
        console.warn(`Failure in ingesting ${logFile} into CLP. Error : ${error}`)
        reject(error)
      })
  })
}

export default ingest;