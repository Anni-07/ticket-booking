require('dotenv').config()
const express = require("express")
const app = express();
const cors = require('cors')
const PORT = process.env.PORT
const connect = require("./configs/db")
const seatController = require("./src/controllers/Route")




app.use(cors())
app.use(express.json());
app.use("/seats", seatController)



app.listen(PORT, async () => {
    await connect()
    console.log(`listening to the port ${PORT}`)
})