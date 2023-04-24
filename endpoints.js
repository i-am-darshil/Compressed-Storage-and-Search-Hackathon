
import getS3LogSearchResult from './QueryCLP.js'

const express = require('express')
const {text} = require("express");
const app = express()
const port = 3000


// TODO : endpoint to query CLP.
/*
* request :
*   service name
*   text to search for.
* Queries CLP server for logs containing the text , response from CLP will be uncompressed logs containing the text ,
* puts this content onto s3 , sends back the s3 link as response to caller. Caller is responsible for downloading the content from s3
* and display the results on the UI.
* */

app.get("/QueryCLP",(req,res)=>{
    let service_name = req.servicename
    let text_to_search = req.text_to_search

    res.send({"s3URL":getS3LogSearchResult(service_name,text_to_search)})
})

app.listen(port, () => {
    console.log(`Node.js server app listening on port ${port}`)
})