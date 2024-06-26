import express from "express";
import ViteExpress from "vite-express";
import { db } from "./config/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import { sendMail } from "./helpers/mailSend.js";

// Create Express app
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://phonebook.salapabikasbank.com.np",
    optionsSuccessStatus: 200,
  })
);
//middeware

function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ msg: "Token is required !" });
  }
  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      return res.status(500).json({ msg: "Token is not valid !" });
    }
    req.user = decoded;
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://phonebook.salapabikasbank.com.np"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    next();
  });
}

// Define a route

app.get("/api/employees/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM employees WHERE id=?`;
  db.query(query, [id], (err, data) => {
    if (err) throw err;
    return res.status(200).json(data);
  });
});

app.get("/api/employees/:name", verifyToken, (req, res) => {
  const name = req.params.name;
  const query = `SELECT * FROM employees WHERE firstName = ?`;
  db.query(query, [name], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: "Error fetching employees" });
    }
    return res.status(200).json(data);
  });
});

app.get("/api/employees", verifyToken, (req, res) => {
  const { query } = req.query;

  if (query) {
    const searchQuery = `
      SELECT *, CONCAT(firstName, ' ', lastName) AS fullName 
      FROM employees 
      WHERE CONCAT(firstName, ' ', lastName) LIKE ?
    `;
    const searchValue = `%${query}%`;

    db.query(searchQuery, [searchValue], (err, searchData) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: "Error searching for employees" });
      }

      return res.status(200).json({ data: searchData });
    });
  } else {
    const queryAll = `SELECT *, CONCAT(firstName, ' ', lastName) AS fullName FROM employees`;
    db.query(queryAll, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: "Error fetching employees" });
      }
      return res.status(200).json({ data });
    });
  }
});
app.patch("/api/forget_password", (req, res) => {
  const email = req.body.email;
  const query = `SELECT password FROM employees WHERE email=?`;
  const values = [email];
  db.query(query, [values], (err, data) => {
    if (err) throw err;
    if (data.length === 0) {
      return res.json({ message: "This email has not been registered" });
    }
    if (err) throw err;
    let subject = "Forget Password !";
    const randomString = "kdjfalksd";
    let content = `
    <p>Please <a href="https://phonebook.salapabikasbank.com.np/forget-password/${email}">Forget Passowrd</a></p>
    `;
    sendMail(email, subject, content);
    return res
      .status(200)
      .json({ message: "Email has been sent successfully !", status: 200 });
  });
});
app.patch("/api/forget_password/:email", (req, res) => {
  const email = req.params.email;
  const { newPassword } = req.body;
  const query = `SELECT password FROM employees WHERE email=?`;
  db.query(query, [email], async (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: "Error updating password !" });
    }

    // Check if user exists
    if (data.length === 0) {
      return res.status(404).json({ msg: "User not found !" });
    }

    try {
      // Ensure newPassword is provided
      if (!newPassword) {
        return res.status(400).json({ msg: "New password is required !" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password in the database
      const updateQuery = `
        UPDATE employees 
        SET password = ?
        WHERE email = ?
      `;
      db.query(updateQuery, [hashedPassword, email], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ msg: "Error updating password !" });
        }
        return res
          .status(200)
          .json({ msg: "Password updated successfully !", status: 200 });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error hashing password !" });
    }
  });
});

app.patch("/api/update_password/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  // Retrieve the user's current password from the database
  const query = `SELECT password FROM employees WHERE id=?`;
  db.query(query, [userId], async (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: "Error updating password !" });
    }

    // Check if user exists
    if (data.length === 0) {
      return res.status(404).json({ msg: "User not found !" });
    }

    const currentPassword = data[0].password;

    try {
      // Ensure newPassword is provided
      if (!newPassword) {
        return res.status(400).json({ msg: "New password is required !" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password in the database
      const updateQuery = `
        UPDATE employees 
        SET password = ?
        WHERE id = ?
      `;
      db.query(updateQuery, [hashedPassword, userId], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ msg: "Error updating password !" });
        }
        return res
          .status(200)
          .json({ msg: "Password updated successfully !", status: 200 });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error hashing password !" });
    }
  });
});

app.patch("/api/update_profile/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  const {
    firstName,
    lastName,
    address,
    contact_number,
    designation,
    department,
    gender,
  } = req.body;

  // const userWithPhone = await getByPhone(contact_number);
  // if (userWithPhone && userWithPhone.id !== userId) {
  //   return res.status(201).json({ msg: "Phone already exists" });
  // }

  const fieldsToUpdate = {};
  if (firstName) fieldsToUpdate.firstName = firstName;
  if (lastName) fieldsToUpdate.lastName = lastName;
  if (address) fieldsToUpdate.address = address;
  if (contact_number) fieldsToUpdate.contact_number = contact_number;
  if (designation) fieldsToUpdate.designation = designation;
  if (department) fieldsToUpdate.department = department;
  if (gender) fieldsToUpdate.gender = gender;

  const query = `
    UPDATE employees 
    SET ?
    WHERE id=?
  `;
  const values = [fieldsToUpdate, userId];

  db.query(query, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: "Error updating profile !" });
    }
    return res.status(200).json({ msg: "Successfully updated !", status: 200 });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM employees WHERE email =?`;
  db.query(query, [email], async (err, data) => {
    if (err) throw err;
    if (data.length === 0) {
      return res.status(201).json({ message: "Invalid email or password !" });
    }
    const user = data[0];
    if (!user.password) {
      return res.status(201).json({ message: "Invalid email or password !" });
    }
    if (!user.verified) {
      return res.status(201).json({ message: "Please verify your email !" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(201).json({ message: "Invalid email or password !" });
    }
    const accessToken = jwt.sign({ email: user.email }, "secret");
    return res.status(200).json({
      name: user.firstName + " " + user.lastName,
      email: user.email,
      token: accessToken,
      id: user.id,
      gender: user.gender,
      status: 200,
    });
  });
});
app.patch("/api/email_varified/:email/varify/:token", async (req, res) => {
  const { email, token } = req.params;

  // Check if the provided email and token match any record in the database
  const query = `SELECT * FROM employees WHERE email = ? AND token = ?`;
  db.query(query, [email, token], async (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: "Error verifying email !" });
    }

    // If there's no match, return an error
    if (data.length === 0) {
      return res.status(404).json({ msg: "Invalid email or token !" });
    }

    // Update the verified field to true
    const updateQuery = `UPDATE employees SET verified = TRUE WHERE email = ?`;
    db.query(updateQuery, [email], (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ msg: "Error updating verification status !" });
      }
      return res
        .status(200)
        .json({ msg: "Email verified successfully !", status: 200 });
    });
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
    password,
  } = req.body;

  const userWithEmail = await getByEmail(email);
  if (userWithEmail) {
    return res.status(201).json({ msg: "Email already exists !" });
  }
  const userWithPhone = await getByPhone(contact_number);
  if (userWithPhone) {
    return res.status(201).json({ msg: "Phone already exists !" });
  }

  const query = `INSERT INTO employees (firstName, lastName, address, contact_number, email, designation, department, gender,password) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;
  const hashPassword = await bcrypt.hash(password, 10);
  const values = [
    firstName,
    lastName,
    address,
    contact_number,
    email,
    designation,
    department,
    gender,
    hashPassword,
  ];
  db.query(query, [...values], (err, data) => {
    if (err) throw err;
    let subject = "Email verification !";
    const randomString = "kdjfalksd";
    let content = `
    <p>Hi ${firstName},please <a href="https://phonebook.salapabikasbank.com.np/email-verification/${email}/varify/${randomString}">Verify</a> your email!</p>
    `;
    sendMail(email, subject, content);
    const query = "UPDATE employees SET token=? WHERE email=?";
    const updateValues = [randomString, email];
    db.query(query, [...updateValues], (err, data) => {
      if (err) {
        console.log("Error", err);
      }
    });

    return res.status(200).json({
      msg: "Email has been sent on your email check it out ! ",
      data: data,
      status: 200,
    });
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
      password VARCHAR(255) NOT NULL,
      gender VARCHAR(1) NOT NULL,
      token VARCHAR(255),
      verified BOOLEAN DEFAULT FALSE
    )
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Table created successfully !");
  });
}
