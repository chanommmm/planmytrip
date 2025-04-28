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
router.get("/api/plan", async (req, res) => {
    if (!lastPlanData) {
        return res.status(404).json({ success: false, message: "ยังไม่มีข้อมูลแผนการเดินทาง" });
    }

    try {
        const enrichedLocations = await Promise.all(
            lastPlanData.locations.map(async (loc) => {
                const geo = await geocodeAddress(loc.text);
                return {
                    ...loc,
                    coordinates: geo,
                };
            })
        );

        const responseData = {
            ...lastPlanData,
            locations: enrichedLocations,
        };

        res.json({ success: true, data: responseData });
    } catch (err) {
        console.error("❌ Error during geocoding:", err.message);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดขณะแปลงที่อยู่" });
    }
});

module.exports = router;
