import React, { useState, useEffect } from 'react';
import "./coach.css";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Proxy = "http://localhost:8080/seats";   // the base URL 
// const Proxy = "https://seat-booking-api.onrender.com/seats";

export const Coach = () => {
    const [requiredSeats, setRequiredSeats] = useState("");
    const [allSeatsdata, setAllSeatsData] = useState([]);
    const [currentBookedSeats, setCurrentBookedSeats] = useState([]);

    const allSeats = async () => {
        try {
            const res = await axios.get(`${Proxy}`);
            setAllSeatsData(res.data);
        } catch (error) {
            toast.error("Error while fetching seats data");
            console.log("error while fetching the data", error.message);
        }
    };

    const handleInput = (e) => {
        let value = e.target.value.trim();
        setRequiredSeats(value);
    };

    const validateInput = () => {
        return Number(requiredSeats) >= 1 && Number(requiredSeats) <= 7;
    };

    const handleBooking = async () => {
        if (!validateInput()) {
            toast.error("Invalid input. Please enter a value between 1 and 7.");
            setRequiredSeats("");
            return;
        }

        try {
            const resp = await axios.put(`${Proxy}/${requiredSeats}`);
            if (resp.data.updatedSeats) {
                setCurrentBookedSeats(resp.data.updatedSeats);
                toast.success(`Successfully booked ${requiredSeats} seat(s)!`);
            } else {
                toast.warning(resp.data.message || "No seats available");
            }
        } catch (error) {
            toast.error("Error while booking seats");
            console.log("error while booking the seats", error.message);
        }
        setRequiredSeats("");
    };

    const handleReseting = async () => {
        try {
            await axios.put(`${Proxy}/resetAll`);
            allSeats();
            setCurrentBookedSeats([]);
            toast.success("All bookings have been reset!");
        } catch (error) {
            toast.error("Error while resetting seats");
            console.log("error while reseting the seats", error.message);
        }
    };

    useEffect(() => {
        allSeats();
    }, [currentBookedSeats]);

    return (
        <div className="container">
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            
            <h1>Ticket Booking </h1>
            <div className="mainComponent">
                <div className="coach">
                    {allSeatsdata.length !== 0 ? (
                        allSeatsdata.map((item, index) => (
                            <div
                                key={index}
                                className="seats"
                                style={{
                                    background: item.status === true ? "#70ee9c" : "#bcb5b5",
                                    color: item.status === true ? "white" : "white",
                                }}
                            >
                                <p>{item.seatNo}</p>
                            </div>
                        ))
                    ) : (
                        <div className="loading">Loading...</div>
                    )}
                </div>

                <div className="booking">
                    <div className="seatStatus">
                        <div className="seatSattusDiv">
                            <div className="statusColorbooked"></div>
                            <div>Booked Seats</div>
                        </div>
                        <div className="seatSattusDiv">
                            <div className="statusColoravail"></div>
                            <div>Available Seats</div>
                        </div>
                    </div>

                    <div className="currentBookedSeats">
                        <h4>Current Booked Seats: </h4>
                        <div className='bookedSeats'>
                            {currentBookedSeats.map((item) => (
                                <button key={item._id}>{item.seatNo}</button>
                            ))}
                        </div>
                    </div>

                    <div className="inputButton">
                        <input
                            type="number"
                            placeholder="Enter Number 1-7 to book Seats"
                            value={requiredSeats}
                            onChange={handleInput}
                            min="1"
                            max="7"
                        />
                        <button className="bookingButton" onClick={handleBooking}>
                            Book Ticket
                        </button>
                        <button className="resetAll" onClick={handleReseting}>
                            Reset Bookings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};