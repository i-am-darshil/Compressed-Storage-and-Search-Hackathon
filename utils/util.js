import child_process from "child_process"

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd) {
  const exec = child_process.exec;
  return new Promise((resolve, reject) => {
   exec(cmd, (error, stdout, stderr) => {
    if (error) {
     console.warn(error);
     reject(`${cmd} failed with error : ${error}`)
    }
    console.log(stdout? stdout : stderr)
    resolve("success");
   });
  });
 }

 export default execShellCommand;