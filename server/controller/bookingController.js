const pool = require("../db/db.js");

// Get all bookings for a user
const getUserBookings = (req, res) => {
  const { username } = req.params;
  const query = "SELECT orderid FROM Bookings WHERE username = $1";
  pool.query(query, [username], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error fetching booking data" });

    if (results.rows.length > 0) {
      res.status(200).json({ orders: results.rows.map((row) => row.orderid) });
    } else {
      res.status(404).json({ message: "No bookings found for this user" });
    }
  });
};

// Create a new booking
const createBooking = (req, res) => {
  const { username, orderid } = req.body;

  if (!username || !orderid) {
    return res
      .status(400)
      .json({ error: "Username and Order ID are required" });
  }

  const insertQuery =
    "INSERT INTO Bookings (username, orderid) VALUES ($1, $2)";
  pool.query(insertQuery, [username, orderid], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error inserting booking data" });
      return;
    }
    res.status(200).json({ message: "Booking saved successfully!" });
  });
};

module.exports = {
  getUserBookings,
  createBooking,
};
