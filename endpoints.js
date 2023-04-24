import express from "express"

const app = express()

app.get("/",(req,res)=>{
    res.send("Server running to query CLP!!!")
})

app.get("/query",(req,res)=>{
    const serviceName = req.query.serviceName
    const searchQuery = req.query.searchQuery

    console.log("Recieved a query request. serviceName : " + serviceName + ",searchQuery : " + searchQuery)

    const detailLogS3URL = "https://logging-solution-hackathon.s3.us-west-2.amazonaws.com/test.log"

    let response = {
        "s3URL": detailLogS3URL
    }

    res.json(response)
})

export default app