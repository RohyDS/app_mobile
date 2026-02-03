const functions = require("firebase-functions");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // autoriser les requêtes depuis ton app web

// =========================
// Connexion MySQL
// =========================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "garage"
});

db.connect((err) => {
  if (err) {
    console.error("Erreur MySQL :", err);
  } else {
    console.log("Connecté à MySQL");
  }
});

// =========================
// Route : Signup
// =========================
app.post("/signup", (req, res) => {
  const { nom, adresse} = req.body;

  const query = "INSERT INTO client (nomPrenoms, adresse) VALUES (?, ?)";
  db.query(query, [nom, adresse], (err, result) => {
    if (err) return res.status(500).send({ error: err.message });
    res.send({ success: true, id: result.insertId });
  });
});

// =========================
// Export API
// =========================
exports.api = functions.https.onRequest(app);
