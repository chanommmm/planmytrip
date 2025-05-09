const express = require("express");
const axios = require("axios");
const router = express.Router();
const moment = require("moment");


let lastPlanData = null;

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// ดึงเวลาเปิด-ปิดของสถานที่
async function getOpeningHours(placeId) {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,opening_hours,formatted_address,place_id&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url);
        console.log("Distance Matrix response:", response.data);  // เพิ่มการ log ข้อมูล API response 
        const result = response.data.result;

        return {
            name: result.name,
            opening_hours: result.opening_hours || null,
        };
    } catch (error) {
        console.error(`❌ Error fetching details for placeId ${placeId}:`, error.message);
        return { opening_hours: null };
    }
}

// เช็คว่าสถานที่เปิดหรือไม่ในเวลาที่กำหนด
function isPlaceOpen(openingHours, visitDateTime) {
    if (!openingHours || !openingHours.periods) return false;

    const day = visitDateTime.day(); // 0 = Sunday
    const time = visitDateTime.format("HHmm"); 
    const weekdayText = openingHours.weekday_text;
    if (weekdayText) {
        const currentDayText = weekdayText[day];
        if (currentDayText && currentDayText.toLowerCase().includes("closed")) return false;
    }

    const todayPeriods = openingHours.periods.filter(p => p.open.day === day);
    if (todayPeriods.length === 0) return false;

    for (const period of todayPeriods) {
        const openTime = period.open.time;
        const closeTime = period.close?.time || "2359";
        if (time >= openTime && time < closeTime) return true;
    }

    return false;
}

// 🔄 คำนวณระยะทางระหว่างทุกคู่ของสถานที่
async function getAllPairDistances(coords, mode, apiKey, avoidTolls = false) {
    const avoidParam = avoidTolls ? '&avoid=tolls' : '';
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${coords.join('|')}&destinations=${coords.join('|')}&mode=${mode}${avoidParam}&key=${apiKey}`;
    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== 'OK') {
        throw new Error('Distance Matrix API error: ' + data.status);
    }

    const matrix = [];

    for (let i = 0; i < data.rows.length; i++) {
        const from = coords[i];
        const row = data.rows[i];

        for (let j = 0; j < row.elements.length; j++) {
            const to = coords[j];
            const element = row.elements[j];

            matrix.push({
                fromIndex: i,
                toIndex: j,
                from,
                to,
                distance: element.distance?.text || null,
                distanceValue: element.distance?.value || null,
                duration: element.duration?.text || null,
                durationValue: element.duration?.value || null,
                status: element.status,
            });
            console.log("Duration for walking:", element.duration?.text);  // log ระยะเวลาสำหรับ walking
        }
    }

    return matrix;
}

// ✅ POST /api/plan
router.post("/api/plan", async (req, res) => {
    const plan = req.body;
    const visitDateTime = moment(plan.date).utcOffset('+07:00'); // ปรับเป็นเวลาไทย
    // ✅ แปลง transport ที่มาจาก frontend ให้ตรงกับ format ที่ Google Maps API ต้องการ
    const mode = plan.transport === 'walk' ? 'walking' : 'driving';
    
    const enrichedLocations = await Promise.all(
        plan.locations.map(async (loc) => {
            if (loc.placeId) {
                const details = await getOpeningHours(loc.placeId);
                const openingHours = details.opening_hours;

                const isOpen = openingHours
                    ? isPlaceOpen(openingHours, visitDateTime)
                    : false;

                return {
                    ...loc,
                    opening_hours: openingHours,
                    isOpen,
                    alert: !isOpen ? `${loc.name} ปิดในวันที่ ${visitDateTime.format("dddd, MMMM Do YYYY")}` : undefined,
                };
            } else {
                return {
                    ...loc,
                    isOpen: false,
                    alert: `${loc.name || "สถานที่นี้"} ไม่มีข้อมูล placeId` ,
                };
            }
        })
    );

    // ✅ คำนวณระยะทางแบบ all-to-all
    const coords = enrichedLocations.map(loc => `${loc.lat},${loc.lng}`);
    let allPairDistances = [];
    try {
        const avoidTolls = plan.avoidTolls === true;
        const allDistances = await getAllPairDistances(coords, mode, GOOGLE_API_KEY, avoidTolls);
        allPairDistances = allDistances.filter(d => d.fromIndex !== d.toIndex); // 🔥 ตัด A->A, B->B ออก
    } catch (err) {
        console.error("❌ Error calculating distances:", err.message);
    }

    lastPlanData = {
        ...plan,
        locations: enrichedLocations,
        distances: allPairDistances, // ✅ แนบ matrix ที่ได้กลับไปด้วย
    };

    res.json({ success: true, routes: enrichedLocations, distances: allPairDistances });
});


// ✅ GET /api
router.get("/api", (req, res) => {
    res.send("API is working.");

});

// ✅ ดึงแผนล่าสุด
router.get("/api/plan", (req, res) => {
    if (!lastPlanData) {
        return res.status(404).json({ success: false, message: "ยังไม่มีข้อมูลแผนการเดินทาง" });
    }
    res.json({ success: true, data: lastPlanData });
});

module.exports = router;