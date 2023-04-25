import express from "express"
import query from "./query/query.js"


const app = express()

app.get("/",(req,res)=>{
    res.send("Server running to query CLP!!!")
})

app.get("/query", query)

export default app