const express = require("express");
const axios = require("axios");
const router = express.Router();
const moment = require("moment");

// --- MinHeap สำหรับ A* ---
class MinHeap {
  constructor() {
    this.data = [];
  }
  push(el, priority) {
    el.priority = priority;
    this.data.push(el);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[p].priority <= this.data[i].priority) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    if (!this.data.length) return null;
    const ret = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1,
          r = 2 * i + 2;
        let smallest = i;
        if (l < this.data.length && this.data[l].priority < this.data[smallest].priority) smallest = l;
        if (r < this.data.length && this.data[r].priority < this.data[smallest].priority) smallest = r;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return ret;
  }
  isEmpty() {
    return this.data.length === 0;
  }
}

// --- Config ---
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
let lastPlanData = null;

// --- ฟังก์ชันดึงข้อมูลเวลาเปิด/ปิดของสถานที่ ---
async function getOpeningHours(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,opening_hours&key=${GOOGLE_API_KEY}`;
  const { data } = await axios.get(url);
  return {
    name: data.result?.name || "Unknown",
    opening_hours: data.result?.opening_hours || null
  };
}

// --- เช็คว่าสถานที่เปิดในเวลานั้นหรือไม่ ---
function isPlaceOpen(openingHours, dt) {
    if (!openingHours?.periods) return true; // <-- แก้เป็น true เพื่อยอมรับกรณีไม่มีข้อมูล
    
    const isAlwaysOpen = openingHours.periods.some(period => {
      return period.open?.time === "0000" && !period.close;
    });
    if (isAlwaysOpen) return true;
  
    const day = dt.day(); // 0 (Sunday) ถึง 6 (Saturday)
    const time = dt.format("HHmm");
  
    for (const period of openingHours.periods) {
      const openDay = period.open.day;
      const openTime = period.open.time;
      const closeDay = period.close?.day;
      const closeTime = period.close?.time;
  
      // ตรวจสอบว่าค่าเวลาเปิด/ปิดข้ามวันหรือไม่
      if (openDay === closeDay) {
        // เปิดปิดในวันเดียวกัน
        if (day === openDay && time >= openTime && time < closeTime) {
          return true;
        }
      } else {
        // เปิดข้ามวัน
        if (
          (day === openDay && time >= openTime) || // เปิดในวันแรก
          (day === closeDay && time < closeTime) || // ปิดในวันถัดไป
          (day > openDay && day < closeDay) || // ข้ามวัน
          (openDay > closeDay && (day > openDay || day < closeDay)) // ข้ามวันจากวันสุดท้ายไปยังวันแรก
        ) {
          return true;
        }
      }
    }
  
    return false;
  }
  

  
// --- ดึงข้อมูล matrix ทั้งหมด ---
async function getAllPairDistances(coords, mode, avoidTolls = false) {
  const avoid = avoidTolls ? "&avoid=tolls" : "";
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${coords.join("|")}&destinations=${coords.join("|")}&mode=${mode}${avoid}&key=${GOOGLE_API_KEY}`;
  const { data } = await axios.get(url);
  if (data.status !== "OK") throw new Error(data.status);
  const mat = Array.from({ length: coords.length }, () => []);
  data.rows.forEach((row, i) =>
    row.elements.forEach((el, j) =>
      mat[i][j] = {
        distanceValue: el.distance?.value || Infinity,
        durationValue: el.duration?.value || Infinity
      }
    )
  );
  return mat;
}

// --- Heuristic สำหรับ A* ---
function mstHeuristic(remaining, straight) {
  let sum = 0;
  for (const u of remaining) {
    let m = Infinity;
    for (const v of remaining) {
      if (u !== v) m = Math.min(m, straight[u][v]);
    }
    if (m < Infinity) sum += m;
  }
  return sum;
}
    
async function solveWithAStar(nodes, distMat, straight, startTime, overrideClosed) {
    const N = nodes.length, ALL = (1 << N) - 1;
    const visited = Array(1 << N).fill().map(() => Array(N).fill(Infinity));
    const pq = new MinHeap();
    const results = [];
  
    // เริ่มต้นที่จุด 0
    visited[1][0] = startTime.valueOf();
    pq.push({ mask: 1, last: 0, time: startTime, g: 0, prev: null },
      mstHeuristic([...Array(N).keys()].slice(1), straight));
  
    while (!pq.isEmpty()) {
      const cur = pq.pop();
      
      // ถ้าผ่านทั้งหมดแล้ว (mask == ALL) ให้เก็บผลลัพธ์
      if (cur.mask === ALL) {
        console.log('Found a complete path'); // Debug
        const seq = [];
        let it = cur;
        while (it) {
          seq.push({ idx: it.last, time: it.time });
          it = it.prev;
        }
        results.push(seq.reverse().map(x => ({ node: nodes[x.idx], arrival: x.time })));
        continue;
      }
  
      // ตรวจสอบเส้นทางไปยังจุดถัดไป
      for (let j = 0; j < N; j++) {
        if (cur.mask & (1 << j)) continue;  // ถ้าผ่านจุดนี้แล้วข้ามไป
        
        const tm = distMat[cur.last][j].durationValue * 1000; // เวลาที่ใช้ในการเดินทาง (ms)
        let arrival = moment(cur.time).add(tm, "ms");
        
        // เช็คเวลาเปิด-ปิดของสถานที่
        if (!overrideClosed && nodes[j].opening_hours && !isPlaceOpen(nodes[j].opening_hours, arrival)) {
          continue;  // ถ้าไม่เปิดให้ข้ามไป
        }
        
        const srvMs = (parseFloat(nodes[j].number) || 0) * 3600 * 1000;  // เวลาที่ใช้ในการบริการ
        let depart = arrival.clone().add(srvMs, "ms"); // เวลาที่ออกจากสถานที่
        
        const m2 = cur.mask | (1 << j);  // สถานะ mask ใหม่
        const g2 = cur.g + distMat[cur.last][j].distanceValue; // ระยะทางสะสม
        
        // ถ้าไม่เคยไปที่จุดนี้หรือไปใหม่ในเวลาที่ดีกว่า
        if (depart.valueOf() < visited[m2][j]) {
          visited[m2][j] = depart.valueOf();
          const rem = [];
          for (let k = 0; k < N; k++) if (!(m2 & (1 << k))) rem.push(k);  // คำนวณค่าสถานที่ที่เหลือ
          const h = mstHeuristic(rem, straight);  // คำนวณ heuristic
          pq.push({ mask: m2, last: j, time: depart, g: g2, prev: cur }, g2 + h);
        }
      }
    }
  
    // เลือกเส้นทางที่ดีที่สุด 5 เส้นทางจากผลลัพธ์ที่เก็บได้
    const bestPaths = results
      .map(seq => {
        const totalTime = seq.reduce((acc, x) => acc.add(x.arrival.diff(startTime)), moment.duration(0));
        return { path: seq, totalTime };
      })
      .sort((a, b) => a.totalTime - b.totalTime)  // จัดเรียงตามเวลาที่ใช้
      .slice(0, 5);  // เลือก 5 เส้นทางที่ดีที่สุด
      console.log("Total complete paths found:", results.length);
    // ส่งผลลัพธ์ 5 เส้นทางที่ดีที่สุด
    return bestPaths.map(item => item.path);
}

  
// --- แปลงวินาทีเป็นข้อความ ---
function formatDuration(sec) {
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    return `${h} ชม. ${m} นาที`;
  }
  return `${Math.round(sec / 60)} นาที`;
}

// ✅ เพิ่ม route นี้เพื่อให้ตอบกลับ /api
router.get("/api", (req, res) => {
  res.json({ message: "API OK" });
});

// --- Endpoint: POST /api/plan ---
router.post("/api/plan", async (req, res) => {
    try {
      const { transport, date, time, locations, avoidTolls, overrideClosed = false } = req.body;
  
      if (!Array.isArray(locations) || !locations.length) {
        return res.status(400).json({ success: false, message: "กรุณาระบุสถานที่อย่างน้อยหนึ่งแห่ง" });
      }
  
      const startTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").utcOffset("+07:00");
  
      // enrich
      const enriched = await Promise.all(locations.map(async loc => {
        const { lat, lng, placeId, text, number } = loc;
        if (typeof lat !== "number" || typeof lng !== "number") {
          throw new Error("lat/lng ไม่ถูกต้อง");
        }
        if (number && (isNaN(number) || parseFloat(number) < 0)) {
          throw new Error("เวลาที่ใช้ต้องเป็นค่าบวก");
        }
        if (!placeId) return { ...loc, opening_hours: null, name: text || "Unknown" };
        const det = await getOpeningHours(placeId);
        return { ...loc, ...det };
      }));
  
      // ตรวจสอบสถานที่ปิด
      const closed = [];
      for (const loc of enriched) {
        const open = !loc.opening_hours ? true : isPlaceOpen(loc.opening_hours, startTime);
        if (!open && !overrideClosed) closed.push(loc.name);
      }
      if (closed.length && !overrideClosed) {
        return res.json({ success: false, closed, message: `สถานที่ปิดในวัน/เวลาที่กำหนด: ${closed.join(", ")}` });
      }
  
      // สร้าง matrix
      const coords = enriched.map(l => `${l.lat},${l.lng}`);
      const mode = transport === "walk" ? "walking" : "driving";
      const distMat = await getAllPairDistances(coords, mode, avoidTolls);
      const straight = enriched.map(a => enriched.map(b => {
        const R = 6371, d2r = Math.PI / 180;
        const dLat = (b.lat - a.lat) * d2r, dLon = (b.lng - a.lng) * d2r;
        const A = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * d2r) * Math.cos(b.lat * d2r) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A)) * 1000;
      }));
  
      const solutions = await solveWithAStar(enriched, distMat, straight, startTime, overrideClosed);
      if (!solutions || solutions.length === 0) throw new Error("ไม่พบเส้นทางที่เป็นไปได้");
  
      const optimal = solutions.map(solution => {
        let totDist = 0, totDur = 0; // Reset total distance and duration for each solution
  
        const optimalRoute = solution.map((step, i) => {
          const { node, arrival } = step;
          const stayH = parseFloat(node.number) || 0;
          let travelDist = 0, travelDur = 0;
          if (i < solution.length - 1) {
            const next = solution[i + 1].node;
            const d = distMat[enriched.indexOf(node)][enriched.indexOf(next)];
            travelDist = d.distanceValue; 
            totDist += d.distanceValue; // Add to total distance of this route
            travelDur = d.durationValue; 
            totDur += d.durationValue; // Add to total duration of this route
          }
          return {
            text: node.text,
            placeId: node.placeId,
            name: node.name,
            arrival: arrival.format("YYYY-MM-DD HH:mm"),
            stay: stayH,
            isOpenAtArrival: isPlaceOpen(node.opening_hours, arrival),
            travelDistance: (travelDist / 1000).toFixed(2),
            travelDuration: formatDuration(travelDur)
          };
        });
  
        return {
          optimalRoute,
          totalDistance: (totDist / 1000).toFixed(2),
          totalDuration: formatDuration(totDur),
          feasible: optimalRoute.every(x => x.isOpenAtArrival) || overrideClosed
        };
      }).slice(0, 5); // Get the top 5 solutions
  
      res.json({
        success: true,
        data: {
          routes: optimal,
        }
      });
  
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, message: e.message });
    }
  });
  
  // --- Endpoint: GET /api/plan ล่าสุด ---
  router.get("/api/plan", (req, res) => {
    if (!lastPlanData) return res.status(404).json({ success: false });
    res.json({ success: true, data: lastPlanData });
  });
  
  module.exports = router;