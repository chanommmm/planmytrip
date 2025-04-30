const express = require("express");
const axios = require("axios");
const router = express.Router();

// เก็บข้อมูลแผนการเดินทางล่าสุด
let lastPlanData = null;

// ✅ ฟังก์ชันดึงข้อมูลเวลาเปิด-ปิดจาก Google Places API
const checkPlaceHours = async (placeId) => {
    try {
        // เรียกใช้ Google Places API เพื่อดึงข้อมูลสถานที่
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
            params: {
                place_id: placeId,
                key: process.env.GOOGLE_API_KEY, // ใช้ API key ที่เก็บใน env
            },
        });

        const result = response.data.result;

        // ตรวจสอบผลลัพธ์ว่าได้ข้อมูลเวลาเปิด-ปิดหรือไม่
        if (result && result.opening_hours) {
            return result.opening_hours.weekday_text; // คืนค่ารายการวันและเวลาเปิด-ปิด
        } else {
            console.log("ไม่มีข้อมูลเวลาเปิด-ปิดสำหรับ placeId:", placeId);
            return null; // ถ้าไม่มีข้อมูลเวลาเปิด-ปิด
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลเวลาเปิด-ปิด:", error);
        return null; // คืนค่า null หากเกิดข้อผิดพลาด
    }
};

// ✅ API ทดสอบระบบ
router.get("/api", (req, res) => {
    console.log("🚀 API ถูกเรียกแล้ว!");
    res.json({ message: "API ทำงานแล้ว!" });
});

// ✅ API รับข้อมูลแผนการเดินทาง
router.post("/api/plan", async (req, res) => {
    lastPlanData = req.body; // เก็บข้อมูลแผนการเดินทางล่าสุด

    const { locations } = req.body;

    // ดึงข้อมูลเวลาเปิด-ปิดสำหรับแต่ละสถานที่
    for (let i = 0; i < locations.length; i++) {
        const placeId = locations[i].placeId;
        const openingHours = await checkPlaceHours(placeId);
        locations[i].opening_hours = openingHours; // เพิ่มข้อมูลเวลาเปิด-ปิดในแต่ละสถานที่
    }

    // ส่งข้อมูลสถานที่พร้อมเวลาเปิด-ปิดกลับไปยังผู้ใช้งาน
    res.json({ success: true, routes: locations });
});

// ✅ API ดูข้อมูลแผนการเดินทางล่าสุด + แปลงพิกัด
router.get("/api/plan", (req, res) => {
    if (!lastPlanData) {
        return res.status(404).json({ success: false, message: "ยังไม่มีข้อมูลแผนการเดินทาง" });
    }
    res.json({ success: true, data: lastPlanData });
});

module.exports = router;