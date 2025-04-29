const express = require("express");
const axios = require("axios");
const router = express.Router();

let lastPlanData = null;  // เก็บข้อมูลล่าสุดที่ถูกส่งมา

// ✅ API ทดสอบระบบ
router.get("/api", (req, res) => {
    console.log("🚀 API ถูกเรียกแล้ว!");
    res.json({ message: "API ทำงานแล้ว!" });
});

// ✅ API รับข้อมูลแผนการเดินทาง
router.post("/api/plan", (req, res) => {
    lastPlanData = req.body;
    res.json({ success: true, routes: req.body.locations });
});

// ✅ API ดูข้อมูลแผนการเดินทางล่าสุด + แปลงพิกัด
router.get("/api/plan", (req, res) => {
    if (!lastPlanData) {
        return res.status(404).json({ success: false, message: "ยังไม่มีข้อมูลแผนการเดินทาง" });
    }
    res.json({ success: true, data: lastPlanData });
});

module.exports = router;
