const express = require("express");
const axios = require("axios");
const router = express.Router();

let lastPlanData = null;  // เก็บข้อมูลล่าสุดที่ถูกส่งมา

// 👉 ฟังก์ชันแปลงที่อยู่เป็นพิกัด
async function geocodeAddress(address) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // 🔍 Log ค่าที่จะใช้
    console.log("📌 Address to geocode:", address);
    console.log("🧪 Using API Key:", apiKey ? "(found)" : "(❌ NOT FOUND)");
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    console.log("🌐 Geocoding Request URL:", url);

    try {
        const res = await axios.get(url);

        // 🔍 Log ผลลัพธ์ที่ได้จาก API
        console.log("📦 Geocoding API response:", JSON.stringify(res.data, null, 2));

        if (!res.data.results || res.data.results.length === 0) {
            console.warn("⚠️ No results from Geocoding API for:", address);
            return null;
        }

        const result = res.data.results[0];
        return {
            address: result.formatted_address,
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
        };
    } catch (error) {
        console.error("❌ Geocoding error:", error.response?.data || error.message);
        return null;
    }
}

// ✅ API ทดสอบระบบ
router.get("/api", (req, res) => {
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
