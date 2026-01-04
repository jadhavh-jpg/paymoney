const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { nanoid } = require("nanoid");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* 🔐 FIREBASE INIT (ENV VARIABLE SE) */
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  )
});

const db = admin.firestore();

/* ===============================
   CREATE PAYMENT / LANDING LINK
   =============================== */
app.post("/api/create", async (req, res) => {
  try {
    const id = "PM" + nanoid(5).toUpperCase();

    await db.collection("links").doc(id).set({
      ...req.body,
      createdAt: Date.now()
    });

    res.json({
      success: true,
      shortUrl: `/p/${id}`,
      id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Create failed" });
  }
});

/* ===============================
   GET LANDING DATA (API)
   =============================== */
app.get("/api/get/:id", async (req, res) => {
  try {
    const doc = await db.collection("links").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(doc.data());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

/* ===============================
   SHORT LINK ROUTE
   =============================== */
app.get("/p/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "lp.html"));
});

/* ===============================
   START SERVER
   =============================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ PayMoney server running on port", PORT);
});
