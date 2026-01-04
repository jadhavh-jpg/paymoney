const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { nanoid } = require("nanoid");
const path = require("path");

const app = express();

/* ================= BASIC MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ================= FIREBASE INIT (SERVERLESS SAFE) ================= */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}")
    )
  });
}

const db = admin.firestore();

/* ================= API: CREATE PAYMENT LINK ================= */
/*
  POST /api/create
  body: { title, desc, image, amount, upi }
*/
app.post("/api/create", async (req, res) => {
  try {
    const id = "PM" + nanoid(5).toUpperCase();

    await db.collection("links").doc(id).set({
      title: req.body.title || "",
      desc: req.body.desc || "",
      image: req.body.image || "",
      amount: req.body.amount || "",
      upi: req.body.upi || "",
      createdAt: Date.now()
    });

    res.json({ id });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Failed to create link" });
  }
});

/* ================= API: GET PAYMENT DATA ================= */
/*
  GET /api/get/:id
*/
app.get("/api/get/:id", async (req, res) => {
  try {
    const doc = await db.collection("links").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(doc.data());
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= SHORT LINK ROUTE ================= */
/*
  /p/PM1023  →  public/lp.html
*/
app.get("/p/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "lp.html"));
});

/* ================= VERCEL SERVERLESS EXPORT ================= */
module.exports = app;
