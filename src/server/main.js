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

app.post("/api/employees", (req, res) => {
  // const query = `INSERT INTO employees()
});

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
      gender VARCHAR(255) NOT NULL
    )
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Table created successfully !");
  });
}
