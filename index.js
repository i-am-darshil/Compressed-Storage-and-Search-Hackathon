import sqsConsumer from "./ingestion/sqsConsumer.js"
import app from "./endpoints.js"

const PORT = 3000

sqsConsumer.start();

app.listen(PORT, () => {
    console.log(`Node.js server app listening on port ${PORT}`)
})