import express from "express";
import ViteExpress from "vite-express";
import { db } from "./config/database.js";

// Create Express app
const app = express();
app.use(express.json());

// Define a route

app.get("/api/employees", (req, res) => {
  const query = `SELECT * FROM employees`;
  db.query(query, (err, data) => {
    if (err) throw err;
    res.json(data);
  });
});

app.post("/api/register", async (req, res) => {
  const {
    firstName,
    lastName,
    address,
    contact_number,
    email,
    designation,
    department,
    gender,
  } = req.body;

  const userWithEmail = await getByEmail(email);
  if (userWithEmail) {
    return res.status(400).json({ msg: "Email already exists" });
  }
  const userWithPhone = await getByPhone(contact_number);
  if (userWithPhone) {
    return res.status(400).json({ msg: "Phone already exists" });
  }

  const query = `INSERT INTO employees (firstName, lastName, address, contact_number, email, designation, department, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    firstName,
    lastName,
    address,
    contact_number,
    email,
    designation,
    department,
    gender,
  ];
  db.query(query, [...values], (err, data) => {
    if (err) throw err;
    return res
      .status(200)
      .json({ msg: "Successfully registered ", data: data });
  });
});
function getByEmail(email) {
  const query = `SELECT * FROM employees WHERE email =?`;
  return new Promise((resolve, reject) => {
    db.query(query, [email], (err, data) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      if (data.length > 0) {
        resolve(data[0]);
      } else {
        resolve(null);
      }
    });
  });
}
function getByPhone(phone) {
  const query = `SELECT * FROM employees WHERE contact_number =?`;
  return new Promise((resolve, reject) => {
    db.query(query, [phone], (err, data) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      if (data.length > 0) {
        resolve(data[0]);
      } else {
        resolve(null);
      }
    });
  });
}

// Start the server
ViteExpress.listen(app, 3000, () => {
  console.log("Server is listening on port 3000...");
  createTable();
});

// Function to create a table
function createTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      contact_number VARCHAR(15) NOT NULL,
      email VARCHAR(255) NOT NULL,
      designation VARCHAR(255) NOT NULL,
      department VARCHAR(255) NOT NULL,
      gender VARCHAR(1) NOT NULL
    )
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Table created successfully !");
  });
}
