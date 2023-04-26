import sqsConsumer from "./ingestion/sqsConsumer.js"
import app from "./endpoints.js"
import fs from "fs"
import configs from "./configs/config.js"

const PORT = 3000

if (!fs.existsSync(configs.QUERY_RESULTS_FOLDER)) {

  fs.mkdir(configs.QUERY_RESULTS_FOLDER, 
    { recursive: true },
     error => error ? console.log(error) : console.log(`${configs.QUERY_RESULTS_FOLDER} folder created`) ) ;
}

if (!fs.existsSync(configs.RAW_LOGS_FOLDER)) {

  fs.mkdir(configs.RAW_LOGS_FOLDER, 
    { recursive: true },
     error => error ? console.log(error) : console.log(`${configs.RAW_LOGS_FOLDER} folder created`) ) ;
}

if (!fs.existsSync(configs.DECOMPRESSED_LOGS_FOLDER)) {

  fs.mkdir(configs.DECOMPRESSED_LOGS_FOLDER, 
    { recursive: true },
     error => error ? console.log(error) : console.log(`${configs.DECOMPRESSED_LOGS_FOLDER} folder created`) ) ;
}

sqsConsumer.start();

app.listen(PORT, () => {
    console.log(`Node.js server app listening on port ${PORT}`)
})