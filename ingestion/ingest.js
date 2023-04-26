import configs from "../configs/config.js"
import execShellCommand from "../utils/util.js"
import fs from "fs"

function ingest(logFile) {
  return new Promise((resolve, reject) => {
    console.log(`Ingesting ${logFile} into CLP`)

    let command = `cd ${configs.CLP_ROOT} && sudo ./sbin/compress ${logFile}`;
    // Below line is for mocking and testing
    // let command = `ls`

    execShellCommand(command)
      .then(function (status) {
        console.log(`Executed ${command} with status : ${status}`);
        return logFile
      })
      .catch(function (error) {
        console.warn(`Failure in ingesting ${logFile} into CLP. Error : ${error}`)
        return logFile
      })
      .then(function(path) {
        fs.unlink(path, (error) => {
          // if any error
          if (error) {
            console.error(error);
            reject(error);
          } else {
            console.log(`Successfully deleted ${logFile}!`);
            resolve(`Ingested ${logFile} into CLP and deleted the same`);
          }
        });
      })
  })
}

export default ingest;
