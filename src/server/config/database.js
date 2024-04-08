import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "papa2055",
  database: "SBBL_DB",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected successfully !");
});
