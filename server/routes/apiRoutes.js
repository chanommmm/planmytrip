const express = require("express");
const axios = require("axios");
const router = express.Router();
const moment = require("moment");

<<<<<<< HEAD

=======
let lastPlanData = null;
>>>>>>> 019bbc9cee79d406bffaad6f89798b2fa6359274

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// ✅ ดึงเวลาเปิด-ปิดของสถานที่โดยใช้ placeId
async function getOpeningHours(placeId) {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,opening_hours,formatted_address,place_id&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url);

        console.log("📦 Google API Response for placeId:", placeId, response.data);

        const result = response.data.result;
        console.log("📦 Opening hours:", result.opening_hours); // แสดงเวลาที่เปิด-ปิด
        return {
            name: result.name,
            opening_hours: result.opening_hours || null,
        };
    } catch (error) {
        console.error(`❌ Error fetching details for placeId ${placeId}:`, error.message);
        return { opening_hours: null };
    }
}

// ✅ ฟังก์ชันตรวจสอบว่าเปิดหรือปิดในวันที่กำหนด
function isPlaceOpen(openingHours, visitDateTime) {
    if (!openingHours || !openingHours.periods) return false;

    const day = visitDateTime.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const time = visitDateTime.format("HHmm");
    console.log("⏰ เวลาเช็ค: ", time); // แสดงเวลาเช็ค

    // เช็ค weekday_text ว่าปิดทั้งวันไหม
    const weekdayText = openingHours.weekday_text;
    if (weekdayText) {
        const currentDayText = weekdayText[day];
        if (currentDayText && currentDayText.toLowerCase().includes("closed")) {
            console.log(`⛔ ปิดในวัน ${visitDateTime.format("dddd")}: ${currentDayText}`);
            return false;
        }
    }

    const todayPeriods = openingHours.periods.filter(p => p.open.day === day);
    if (todayPeriods.length === 0) {
        console.log(`⛔ ไม่มีเวลาเปิดในวัน ${visitDateTime.format("dddd")}`);
        return false;
    }

    for (const period of todayPeriods) {
        const openTime = period.open.time;
        const closeTime = period.close?.time || "2359";

        console.log(`⏰ ช่วงเวลาที่เปิด: ${openTime} ถึง ${closeTime}`); // ตรวจสอบช่วงเวลา
        if (time >= openTime && time < closeTime) {
            console.log(`✅ สถานที่เปิด: ${visitDateTime.format("dddd, MMMM Do YYYY")}`);
            return true;
        }
    }

    console.log(`⛔ เวลาไม่ตรงกับช่วงเปิดในวัน ${visitDateTime.format("dddd")}`);
    return false;
}

// ✅ POST /api/plan
router.post("/api/plan", async (req, res) => {
    const plan = req.body;

    // คำนวณ visitDateTime โดยแปลงเป็นเวลาท้องถิ่น
    const visitDateTime = moment(plan.date).utcOffset('+07:00'); // ปรับให้ตรงกับเขตเวลาของประเทศไทย
    console.log("🕒 วันที่ที่ผู้ใช้กรอก (ปรับโซนเวลา):", visitDateTime.format());
    

    const enrichedLocations = await Promise.all(
        plan.locations.map(async (loc) => {
            if (loc.placeId) {
                const details = await getOpeningHours(loc.placeId);
                const openingHours = details.opening_hours;

                if (!openingHours) {
                    console.warn(`${loc.name} ไม่มีข้อมูลเวลาเปิด-ปิด`);
                    return {
                        ...loc,
                        opening_hours: null,
                        isOpen: false,
                        alert: `${loc.name} ไม่มีข้อมูลเวลาเปิด-ปิด`,
                    };
                }

                const isOpen = isPlaceOpen(openingHours, visitDateTime);

                if (!isOpen) {
                    return {
                        ...loc,
                        opening_hours: openingHours,
                        isOpen: false,
                        alert: `${loc.name} ปิดในวันที่ ${visitDateTime.format("dddd, MMMM Do YYYY")}`, // ใช้วันที่ในเวลาท้องถิ่น
                    };
                } else {
                    return {
                        ...loc,
                        opening_hours: openingHours,
                        isOpen: true,
                    };
                }
            } else {
                return {
                    ...loc,
                    isOpen: false,
                    alert: `${loc.name || "สถานที่นี้"} ไม่มีข้อมูล placeId`,
                };
            }
        })
    );

    lastPlanData = {
        ...plan,
        locations: enrichedLocations,
    };

    console.log("📊 Plan data:", lastPlanData); // แสดงข้อมูลแผนการเดินทางที่บันทึกไว้

    res.json({ success: true, routes: enrichedLocations });
});

<<<<<<< HEAD
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
=======
// ✅ ทดสอบ API
router.get("/api", (req, res) => {
    res.send("API is working.");
>>>>>>> 019bbc9cee79d406bffaad6f89798b2fa6359274
});

// ✅ ดึงข้อมูลล่าสุด
router.get("/api/plan", (req, res) => {
    if (!lastPlanData) {
        return res.status(404).json({ success: false, message: "ยังไม่มีข้อมูลแผนการเดินทาง" });
    }
    res.json({ success: true, data: lastPlanData });
});

module.exports = router;