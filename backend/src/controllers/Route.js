const express = require("express");
const Seats = require("../models/seatSchema");
const router = express.Router();
const seatArray = require("../data");

// Initialize seats
router.post("/initialize-seats", async (req, res) => {
    try {
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
        res.status(500).json({ 
            success: false,
            message: "Failed to initialize seats",
            error: error.message 
        });
    }
});

// Get all seats
router.get("/", async (req, res) => {
    try {
        const allSeats = await Seats.find().sort({ seatNo: 1 }).lean().exec();
        res.send(allSeats);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Get available seats
router.get("/availableSeats", async (req, res) => {
    try {
        const availableSeats = await Seats.find({ status: true }).sort({ seatNo: 1 }).lean().exec();
        res.send(availableSeats);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Reset all seats
router.put("/resetAll", async (req, res) => {
    try {
        await Seats.updateMany({}, { $set: { status: true } });
        res.status(201).json({ message: "Seats reset successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Book seats (in a row if possible, otherwise closest)
router.put("/:requiredSeats", async (req, res) => {
    const requiredSeats = parseInt(req.params.requiredSeats);
    if (requiredSeats < 1 || requiredSeats > 7) {
        return res.status(400).json({ message: "Invalid input. Please enter a value between 1 and 7." });
    }

    try {
        const availableSeats = await Seats.find({ status: true }).sort({ seatNo: 1 });
        let seatsBooked = false;
        let bookedSeats = [];

        for (let i = 0; i < availableSeats.length; i++) {
            const currentSeat = availableSeats[i];
            const currentRow = currentSeat.row;

            const rowSeats = availableSeats.filter(
                (seat) => seat.row === currentRow && seat.status === true
            );

            if (rowSeats.length >= requiredSeats) {
                // Try finding contiguous seats in the row
                const sortedRowSeats = rowSeats.sort((a, b) => a.seatNo - b.seatNo);
                for (let j = 0; j <= sortedRowSeats.length - requiredSeats; j++) {
                    let contiguous = true;
                    for (let k = 0; k < requiredSeats - 1; k++) {
                        if (sortedRowSeats[j + k + 1].seatNo !== sortedRowSeats[j + k].seatNo + 1) {
                            contiguous = false;
                            break;
                        }
                    }
                    if (contiguous) {
                        bookedSeats = sortedRowSeats.slice(j, j + requiredSeats);
                        const seatIds = bookedSeats.map(seat => seat._id);
                        await Seats.updateMany({ _id: { $in: seatIds } }, { $set: { status: false } });
                        seatsBooked = true;
                        break;
                    }
                }
            }

            if (seatsBooked) break;
        }

        // If no contiguous row found, find closest block
        if (!seatsBooked) {
            if (requiredSeats > availableSeats.length) {
                return res.status(400).json({ message: "Not enough seats available." });
            }

            bookedSeats = closestSeats(availableSeats, requiredSeats);
            const seatIds = bookedSeats.map(seat => seat._id);
            await Seats.updateMany({ _id: { $in: seatIds } }, { $set: { status: false } });
        }

        res.status(201).json({
            message: seatsBooked
                ? "Booked contiguous seats successfully"
                : "Booked closest available seats",
            updatedSeats: bookedSeats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete all seats
router.delete("/delete-all-seats", async (req, res) => {
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

// Helper function: Find closest block of seats
const closestSeats = (seatsArray, seatWindow) => {
    seatsArray.sort((a, b) => a.seatNo - b.seatNo);

    let minDistance = Infinity;
    let closestWindow = seatsArray.slice(0, seatWindow);

    for (let i = 0; i <= seatsArray.length - seatWindow; i++) {
        const window = seatsArray.slice(i, i + seatWindow);
        const distance = window[seatWindow - 1].seatNo - window[0].seatNo;

        if (distance < minDistance) {
            minDistance = distance;
            closestWindow = window;
        }
    }

    return closestWindow;
};

module.exports = router;
