require('dotenv').config()
const mongoose = require("mongoose");

const connect = () => {
    try {
        console.log("database Connected")
        return mongoose.connect(`${process.env.MONGODB_URI}`)

    } catch (error) {
        console.log(`databasee connection failed due to ${error.message}`)
    }

}

module.exports = connect





