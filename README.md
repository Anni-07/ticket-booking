# Ticket Booking 

The **Ticket Booking** is a web application that allows users to book seats in a coach. It provides a user-friendly interface for selecting seats and managing bookings.

---

## 🔧 Features

- Display available and booked seats in the coach.
- Book a seat by selecting the desired seat number.
- Reset all bookings to make all seats available again.
- Maximum **7 seats** can be booked at a time.

---

## 🛠 Technologies Used

- **Frontend:** React.js  
- **Backend:** Node.js with Express.js  
- **Database:** MongoDB  
- **Deployment:**  
  - Frontend – [Netlify](https://www.vercel.com)  
  - Backend – [Render](https://render.com)  
- **Version Control:** Git & GitHub

---

## 📖 Overview

The Ticket Booking is designed to facilitate the booking of seats in a coach. It allows users to view available seats and make bookings based on the seat availability logic. The system keeps track of booked seats and updates their status in real-time.

---

## 🔄 User Flow

1. On accessing the app, users are shown:
   - A **coach layout** on the left.
   - **Booking status** and controls on the right (booked/available, input for seat number, book/reset buttons).
2. To book seats:
   - Enter the number of seats (max 7).
   - Click the **"Book Ticket"** button.
3. The system shows the current booked seats on the UI.
4. To reset all bookings:
   - Click the **"Reset Bookings"** button to clear all bookings and update seat availability.

---

## 📐 Booking Logic

### ✅ When consecutive seats are available in a single row:
- The system books those seats in the same row.

### 🚫 When no single row has enough consecutive seats:
- The system finds **closest adjacent seats across rows**.
- Distance between available seats is calculated to determine the **most optimal cluster**.
- These closest seats are then booked and marked as **"Booked"**.

---



## 🚀 Getting Started

### Frontend

#### 🔄 Installation

```bash
git clone https://github.com/Anni-07/ticket-booking.git
cd frontend
npm install
