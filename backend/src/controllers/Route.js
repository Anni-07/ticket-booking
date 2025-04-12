const express = require("express")
const Seats = require("../models/seatSchema");
const router = express.Router();
const seatArray = require("../data");


router.post("/initialize-seats", async (req, res) => {
    try {
        // Check if seats already exist
        const existingSeats = await Seats.find();
        
        if (existingSeats.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Seats already initialized. Use reset endpoint first."
            });
        }

        const seats = await Seats.insertMany(seatArray);
        
        res.status(201).json({
            success: true,
            message: `${seats.length} seats initialized successfully`,
            data: seats
        });
    } catch (error) {
        console.error("Seat initialization error:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to initialize seats",
            error: error.message 
        });
    }
});

// get route for fetching all the seats 
router.get("/", async (req, res) => {
    try {
        const allseats = await Seats.find().sort({ seatNo: 1 }).lean().exec();
        res.send(allseats);
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
});

// route for getting available seats 
router.get("/availableSeats", async (req, res) => {
    try {
        const allseats = await Seats.find({ status: true }).sort({ seatNo: 1 }).lean().exec();
        res.send(allseats);
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
});

// route for resetting all the seats 
router.put("/resetAll", async (req, res) => {

    try {
        const allSeats = await Seats.updateMany({}, { $set: { status: true } });
        res.status(201).json({ message: "Seats reset successfully." })
        console.log("in reset one")
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// route for booking seats which takes the params required seats from the frontend
router.put("/:requiredSeats", async (req, res) => {
    console.log("in required one")
    const requiredSeats = parseInt(req.params.requiredSeats);
    // Validate the requiredSeats value
    if (requiredSeats < 1 || requiredSeats > 7) {
        return res.status(400).json({ message: "Invalid input. Please enter a value between 1 and 7." });
    }
    const availableSeats = await Seats.find({ status: true }).sort({ seatNo: 1 });

    let seatsBooked = false;
    let bookedSeats = [];
    let min = Infinity

    for (let i = 0; i < availableSeats.length; i++) {
        const currentSeat = availableSeats[i];
        const currentRow = currentSeat.row;


        const rowSeats = availableSeats.filter(
            (seat) => seat.row === currentRow && seat.status === true
        );


        if (rowSeats.length === requiredSeats) {
            try {
                bookedSeats = rowSeats.slice(0, requiredSeats)
                const seatIdsToUpdate = bookedSeats.map((seat) => seat._id);
                await Seats.updateMany(
                    { _id: { $in: seatIdsToUpdate } },
                    { $set: { status: false } }
                );

                seatsBooked = true;
                break;
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        }
        else {
            try {
                bookedSeats = rowSeats.slice(0, requiredSeats)
                const seatIdsToUpdate = bookedSeats.map((seat) => seat._id);
                await Seats.updateMany(
                    { _id: { $in: seatIdsToUpdate } },
                    { $set: { status: false } }
                );

                seatsBooked = true;
                break;
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        }

    }



    // Check if seats were successfully booked
    if (seatsBooked) {
        res.status(201).json({ message: "booked seats successfully in a row", updatedSeats: bookedSeats });
    } else {
        // if seats required seats are not available in any row 
        if (requiredSeats > availableSeats.length) {
            return res.status(201).json({ message: "these many seats are not available", })

        }

        const closestSeatsAvailableToUpdate = closestSeats(availableSeats, requiredSeats);  // closestSeats is a function which gives the closest seats available for the seats available array. it takes two parameter array , requiredseats
        const closestSeatsIDsToUpdate = closestSeatsAvailableToUpdate.map((seat) => seat._id);
        console.log(closestSeatsAvailableToUpdate);
        console.log(closestSeatsIDsToUpdate);
        try {
            const closestUpdated = await Seats.updateMany(
                { _id: { $in: closestSeatsIDsToUpdate } },
                { $set: { status: false } }
            );
            res.status(201).json({ message: "booked seats successfully closest available", updatedSeats: closestSeatsAvailableToUpdate })

        } catch (error) {

            return res.status(404).json({ message: "Required number of seats not available.", reason: error.message })
        }



    }
});


const closestSeats = (seatsArray, seatWindow) => {
    // Sort the seats array based on seat number
    seatsArray.sort((a, b) => a.seatNo - b.seatNo);

    let minDistance = Infinity;
    let closestWindow = seatsArray.slice(0, seatWindow);

    for (let i = 0; i <= seatsArray.length - seatWindow; i++) {
        let currentWindow = seatsArray.slice(i, i + seatWindow);
        const currentDistance = currentWindow[seatWindow - 1].seatNo - currentWindow[0].seatNo;

        if (currentDistance < minDistance) {
            minDistance = currentDistance;
            closestWindow = currentWindow;
        }
    }

    return closestWindow;
}


// In your routes file (e.g., seatsRoutes.js)
router.delete('/delete-all-seats', async (req, res) => {
    try {
        const result = await Seats.deleteMany({});
        
        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} seats`,
            data: result
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Failed to delete seats",
            error: error.message 
        });
    }
});



module.exports = router