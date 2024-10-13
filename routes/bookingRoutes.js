/** @format */

// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();

// In-memory data storage
let rooms = [];
let bookings = [];
let customers = [];

// Create a room
router.post("/rooms", (req, res) => {
  const { roomName, seats, amenities, pricePerHour } = req.body;
  const newRoom = {
    id: rooms.length + 1,
    roomName,
    seats,
    amenities,
    pricePerHour,
    bookings: [],
  };
  rooms.push(newRoom);
  res.status(201).json({ message: "Room created successfully", room: newRoom });
});

// Book a room
router.post("/book", (req, res) => {
  const { customerName, roomId, date, startTime, endTime } = req.body;

  // Find the room by ID
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return res.status(404).json({ message: "Room not found" });

  // Create booking
  const newBooking = {
    id: bookings.length + 1,
    customerName,
    roomId,
    roomName: room.roomName,
    date,
    startTime,
    endTime,
    bookingDate: new Date(),
    status: "booked",
  };

  // Store booking
  room.bookings.push(newBooking);
  bookings.push(newBooking);

  // Add customer record
  let customer = customers.find((c) => c.customerName === customerName);
  if (!customer) {
    customer = { customerName, bookings: [] };
    customers.push(customer);
  }
  customer.bookings.push(newBooking);

  res
    .status(201)
    .json({ message: "Room booked successfully", booking: newBooking });
});

// List all rooms with booked data
router.get("/rooms", (req, res) => {
  const roomList = rooms.map((room) => ({
    roomName: room.roomName,
    seats: room.seats,
    pricePerHour: room.pricePerHour,
    amenities: room.amenities,
    bookings: room.bookings.map((booking) => ({
      customerName: booking.customerName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
    })),
  }));
  res.status(200).json(roomList);
});

// List all customers with their booking data
router.get("/customers", (req, res) => {
  const customerList = customers.map((customer) => ({
    customerName: customer.customerName,
    bookings: customer.bookings.map((booking) => ({
      roomName: booking.roomName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
    })),
  }));
  res.status(200).json(customerList);
});

// List how many times a customer has booked rooms
router.get("/customer-bookings/:customerName", (req, res) => {
  const customerName = req.params.customerName;
  const customer = customers.find((c) => c.customerName === customerName);
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  const bookingCount = customer.bookings.length;
  const bookingDetails = customer.bookings.map((booking) => ({
    roomName: booking.roomName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    bookingId: booking.id,
    bookingDate: booking.bookingDate,
    status: booking.status,
  }));

  res.status(200).json({
    customerName: customer.customerName,
    totalBookings: bookingCount,
    bookingDetails,
  });
});

module.exports = router;
