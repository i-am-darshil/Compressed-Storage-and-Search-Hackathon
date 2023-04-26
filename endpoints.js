import express from "express"
import query from "./query/query.js"
import detailLog from "./query/detailLog.js"

const app = express()

app.get("/",(req,res)=>{
    res.send("Server running to query CLP!!!")
})

app.get("/query", query)

app.get("/detailLog", detailLog)

export default app