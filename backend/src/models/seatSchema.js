const mongoose = require("mongoose");

// schema for seats in a coach 
const seatSchema = mongoose.Schema({
    seatNo: { type: Number, required: true },
    status: { type: Boolean, required: true },
    row: { type: Number, required: true }

},
    {
        versionKey: false,
        timestamps: true,
    });

const Seats = mongoose.model("seat", seatSchema);
module.exports = Seats