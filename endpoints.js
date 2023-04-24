import getS3LogSearchResult from './QueryCLP.js'
import express from "express"

const app = express()

app.get("/",(req,res)=>{
    res.send("Server running to query CLP!!!")
})

app.get("/query",(req,res)=>{
    const service_name = req.servicename
    const text_to_search = req.text_to_search

    const detailLogS3URL = getS3LogSearchResult(service_name,text_to_search)

    let response = {
        "s3URL": detailLogS3URL
    }

    res.json(response)
})

export default app