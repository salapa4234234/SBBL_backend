import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "sql8.freesqldatabase.com",
  user: "sql8697335",
  password: "gHzMKWPAux",
  database: "sql8697335",
  connectTimeout: 15000,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected successfully !");
});
