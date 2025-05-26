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
        const l = 2 * i + 1, r = 2 * i + 2;
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
  if (!openingHours?.periods) return true;
  
  const isAlwaysOpen = openingHours.periods.some(period => {
    return period.open?.time === "0000" && !period.close;
  });
  if (isAlwaysOpen) return true;

  const day = dt.day();
  const time = dt.format("HHmm");

  for (const period of openingHours.periods) {
    const openDay = period.open.day;
    const openTime = period.open.time;
    const closeDay = period.close?.day;
    const closeTime = period.close?.time;

    if (openDay === closeDay) {
      if (day === openDay && time >= openTime && time < closeTime) {
        return true;
      }
    } else {
      if (
        (day === openDay && time >= openTime) ||
        (day === closeDay && time < closeTime) ||
        (day > openDay && day < closeDay) ||
        (openDay > closeDay && (day > openDay || day < closeDay))
      ) {
        return true;
      }
    }
  }
  return false;
}

// --- ดึงข้อมูล matrix ทั้งหมด ---
async function getAllPairDistances(coords, mode, avoidTolls = false, departureTime = null) {
  const avoid = avoidTolls ? "&avoid=tolls" : "";
  const depTimeParam = mode === "transit" && departureTime
    ? `&departure_time=${Math.floor(departureTime / 1000)}`
    : "";
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${coords.join("|")}&destinations=${coords.join("|")}&mode=${mode}${avoid}&key=${GOOGLE_API_KEY}${depTimeParam}`;
  
  const { data } = await axios.get(url);
  if (data.status !== "OK") throw new Error(data.status); 
  const mat = Array.from({ length: coords.length }, () => []); 
  data.rows.forEach((row, i) =>
    row.elements.forEach((el, j) => {
      if (el.status === "OK") {
        mat[i][j] = {
          distanceValue: el.distance.value,
          durationValue: el.duration.value
        };
      } else {
        mat[i][j] = {
          distanceValue: Infinity,
          durationValue: Infinity
        };
        console.warn(`⚠️ No valid route from point ${i} to ${j}:`, el.status);
      }
    })
  );
  return mat; 
}

// --- Heuristic สำหรับ A* --- 
function mstHeuristic(remaining, straight) {
  if (remaining.length === 0) return 0;
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

// --- แปลง locked positions จาก frontend format เป็น backend format ---
function convertLockedPositions(locations) {
  const lockedPositions = [];
  
  locations.forEach((location, index) => {
    if (location.locked && location.position !== undefined) {
      // ใช้ position ที่กำหนดใน frontend
      lockedPositions.push({
        position: location.position,
        nodeIndex: index
      });
    }
  });
  
  console.log("🔄 Converted locked positions:", lockedPositions);
  return lockedPositions;
}

// --- ฟังก์ชันตรวจสอบว่าเส้นทางปัจจุบันตรงกับ locked positions หรือไม่ ---
function isValidWithLocks(sequence, lockedPositions) {
  if (!lockedPositions || lockedPositions.length === 0) return true;
  
  for (const lock of lockedPositions) {
    const { position, nodeIndex } = lock;
    
    if (sequence.length <= position) continue;
    
    if (sequence[position] !== nodeIndex) {
      return false;
    }
  }
  
  return true;
}

// --- ฟังก์ชันตรวจสอบว่า node ถัดไปที่จะเพิ่มจะทำให้ละเมิด lock หรือไม่ ---
function canAddNode(sequence, nextNode, lockedPositions) {
  if (!lockedPositions || lockedPositions.length === 0) return true;
  
  const nextPosition = sequence.length;
  
  // หา lock ที่ตำแหน่งถัดไป
  const lockAtNextPosition = lockedPositions.find(lock => lock.position === nextPosition);
  
  if (lockAtNextPosition) {
    return lockAtNextPosition.nodeIndex === nextNode;
  }
  
  // ตรวจสอบว่า node นี้ไม่ถูก reserve ไว้สำหรับตำแหน่งอื่น
  for (const lock of lockedPositions) {
    if (lock.position > nextPosition && lock.nodeIndex === nextNode) {
      return false;
    }
  }
  
  return true;
}

// --- ฟังก์ชันสร้าง forced sequence สำหรับ locked positions ---
function getInitialForcedSequence(N, lockedPositions) {
  if (!lockedPositions || lockedPositions.length === 0) {
    return { sequence: [0], mask: 1 };
  }
  
  const sortedLocks = [...lockedPositions].sort((a, b) => a.position - b.position);
  
  let sequence = [0];
  let mask = 1;
  
  // บังคับให้ไปตาม locked positions ที่ต่อเนื่องจากเริ่มต้น
  for (const lock of sortedLocks) {
    if (lock.position === sequence.length && !sequence.includes(lock.nodeIndex)) {
      sequence.push(lock.nodeIndex);
      mask |= (1 << lock.nodeIndex);
    } else {
      break;
    }
  }
  
  return { sequence, mask };
}

// --- A* Algorithm with Position Locking ---
async function solveWithAStar(nodes, distMat, straight, startTime, overrideClosed, lockedPositions = []) {
  const N = nodes.length, ALL = (1 << N) - 1;
  const visited = new Map();
  const pq = new MinHeap();
  const results = [];

  console.log("🔒 Processing locked positions:", lockedPositions);

  // สร้าง initial forced sequence
  const initialState = getInitialForcedSequence(N, lockedPositions);
  let currentTime = startTime.clone();
  
  console.log("🚀 Initial state:", initialState);
  
  // คำนวณเวลาเดินทางไปยัง forced sequence
  let totalG = 0;
  for (let i = 1; i < initialState.sequence.length; i++) {
    const from = initialState.sequence[i - 1];
    const to = initialState.sequence[i];
    const d = distMat[from][to];
    
    if (!d || d.durationValue == null || isNaN(d.durationValue)) {
      throw new Error(`Invalid travel time from ${from} to ${to}`);
    }
    
    const travelTime = d.durationValue * 1000;
    currentTime = currentTime.clone().add(travelTime, "ms");
    totalG += d.distanceValue;
    
    // เพิ่มเวลาที่ใช้ในสถานที่ (ยกเว้นสถานที่สุดท้าย)
    if (i < initialState.sequence.length - 1) {
      const serviceTime = (parseFloat(nodes[to].number) || 0) * 3600 * 1000;
      currentTime = currentTime.clone().add(serviceTime, "ms");
    }
  }

  const lastNode = initialState.sequence[initialState.sequence.length - 1];
  const stateKey = `${initialState.mask}-${lastNode}-${initialState.sequence.join(',')}`;
  visited.set(stateKey, currentTime.valueOf());
  
  const remainingNodes = [...Array(N).keys()].filter(i => !(initialState.mask & (1 << i)));
  const h = mstHeuristic(remainingNodes, straight);
  
  pq.push({
    mask: initialState.mask,
    last: lastNode,
    time: currentTime,
    g: totalG,
    prev: null,
    sequence: initialState.sequence
  }, totalG + h);

  while (!pq.isEmpty()) {
    const cur = pq.pop();
    
    if (cur.mask === ALL) {
      console.log("✅ Found complete path:", cur.sequence);
      
      const route = [];
      let routeTime = startTime.clone();
      
      for (let i = 0; i < cur.sequence.length; i++) {
        const nodeIdx = cur.sequence[i];
        
        if (i > 0) {
          const prevIdx = cur.sequence[i - 1];
          const travelTime = distMat[prevIdx][nodeIdx].durationValue * 1000;
          routeTime = routeTime.clone().add(travelTime, "ms");
        }
        
        route.push({ node: nodes[nodeIdx], arrival: routeTime.clone() });
        
        if (i < cur.sequence.length - 1) {
          const serviceTime = (parseFloat(nodes[nodeIdx].number) || 0) * 3600 * 1000;
          routeTime = routeTime.clone().add(serviceTime, "ms");
        }
      }
      
      results.push(route);
      
      if (results.length >= 3) break;
      continue;
    }

    // ตรวจสอบเส้นทางไปยังจุดถัดไป
    for (let j = 0; j < N; j++) {
      if (cur.mask & (1 << j)) continue;
      
      // ตรวจสอบว่าสามารถเพิ่ม node นี้ได้หรือไม่ตาม locked positions
      if (!canAddNode(cur.sequence, j, lockedPositions)) {
        continue;
      }
      
      const d = distMat[cur.last][j];
      if (!d || d.durationValue == null || isNaN(d.durationValue)) {
        console.warn(`⛔️ Invalid travel time from ${cur.last} to ${j}:`, d);
        continue;
      }
      
      const tm = d.durationValue * 1000;
      let arrival = moment(cur.time).add(tm, "ms");
      
      const srvMs = (parseFloat(nodes[j].number) || 0) * 3600 * 1000;
      let depart = arrival.clone().add(srvMs, "ms");
      
      const m2 = cur.mask | (1 << j);
      const g2 = cur.g + d.distanceValue;
      const newSequence = [...cur.sequence, j];
      
      const stateKey2 = `${m2}-${j}-${newSequence.join(',')}`;
      if (!visited.has(stateKey2) || depart.valueOf() < visited.get(stateKey2)) {
        visited.set(stateKey2, depart.valueOf());
        const rem = [];
        for (let k = 0; k < N; k++) if (!(m2 & (1 << k))) rem.push(k);
        const h = mstHeuristic(rem, straight);
        
        pq.push({
          mask: m2,
          last: j,
          time: depart,
          g: g2,
          prev: cur,
          sequence: newSequence
        }, g2 + h);
      }
    }
  }

  console.log("Total complete paths found:", results.length);
  
  const bestPaths = results
    .map(seq => {
      const totalTime = seq[seq.length - 1].arrival.diff(startTime);
      return { path: seq, totalTime };
    })
    .sort((a, b) => a.totalTime - b.totalTime);

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

// --- Endpoint: POST /api/plan ---
router.post("/api/plan", async (req, res) => {
  try {
    const { 
      transport, 
      date, 
      time, 
      locations, 
      avoidTolls, 
      overrideClosed = false,
      lockedPositions: inputLockedPositions = [] 
    } = req.body;

    console.log("📥 Received request:");
    console.log("- Transport:", transport);
    console.log("- Date/Time:", date, time);
    console.log("- Locations count:", locations?.length);
    console.log("- Input locked positions:", inputLockedPositions);

    if (!Array.isArray(locations) || !locations.length) {
      return res.status(400).json({ success: false, message: "กรุณาระบุสถานที่อย่างน้อยหนึ่งแห่ง" });
    }

    // แปลง locked positions จาก frontend format
    const lockedPositions = convertLockedPositions(locations);

    // ตรวจสอบ date/time format
    let startTime;
    if (date && time) {
      // Format แบบแยก date และ time
      startTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").utcOffset("+07:00");
    } else if (date) {
      // Format แบบ datetime string
      startTime = moment(date).utcOffset("+07:00");
    } else {
      return res.status(400).json({ success: false, message: "กรุณาระบุวันที่และเวลา" });
    }

    if (!startTime.isValid()) {
      return res.status(400).json({ success: false, message: "รูปแบบวันที่หรือเวลาไม่ถูกต้อง" });
    }

    console.log("🕐 Start time:", startTime.format("YYYY-MM-DD HH:mm"));

    // enrich locations
    const enriched = await Promise.all(locations.map(async (loc, index) => {
      const { lat, lng, placeId, text, number, name } = loc;
      if (typeof lat !== "number" || typeof lng !== "number") {
        throw new Error(`lat/lng ไม่ถูกต้องสำหรับสถานที่ที่ ${index + 1}`);
      }
      if (number && (isNaN(number) || parseFloat(number) < 0)) {
        throw new Error(`เวลาที่ใช้ต้องเป็นค่าบวกสำหรับสถานที่ที่ ${index + 1}`);
      }
      
      // ถ้ามี placeId ให้ดึงข้อมูลจาก Google Places API
      if (placeId) {
        try {
          const det = await getOpeningHours(placeId);
          return { 
            ...loc, 
            ...det,
            originalIndex: index 
          };
        } catch (error) {
          console.warn(`⚠️ Failed to get details for place ${placeId}:`, error.message);
          return { 
            ...loc, 
            opening_hours: null, 
            name: name || text || "Unknown",
            originalIndex: index 
          };
        }
      }
      
      return { 
        ...loc, 
        opening_hours: null, 
        name: name || text || "Unknown",
        originalIndex: index 
      };
    }));

    // ตรวจสอบสถานที่ปิด
    const closed = [];
    for (const loc of enriched) {
      const open = !loc.opening_hours ? true : isPlaceOpen(loc.opening_hours, startTime);
      if (!open && !overrideClosed) closed.push(loc.name);
    }
    if (closed.length && !overrideClosed) {
      return res.json({ 
        success: false, 
        closed, 
        message: `สถานที่ปิดในวัน/เวลาที่กำหนด: ${closed.join(", ")}` 
      });
    }

    // สร้าง matrix
    const coords = enriched.map(l => `${l.lat},${l.lng}`);
    const mode = transport === "walk" ? "walking" : "driving";
    
    console.log("🗺️ Getting distance matrix for", coords.length, "locations");
    const distMat = await getAllPairDistances(coords, mode, avoidTolls);
    
    // คำนวณ straight line distance สำหรับ heuristic
    const straight = enriched.map(a => enriched.map(b => {
      const R = 6371, d2r = Math.PI / 180;
      const dLat = (b.lat - a.lat) * d2r, dLon = (b.lng - a.lng) * d2r;
      const A = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
                Math.cos(a.lat * d2r) * Math.cos(b.lat * d2r) * 
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A)) * 1000;
    }));

    console.log("🔍 Starting A* algorithm with locked positions:", lockedPositions);
    const solutions = await solveWithAStar(enriched, distMat, straight, startTime, overrideClosed, lockedPositions);

    if (!solutions || solutions.length === 0) {
      throw new Error("ไม่พบเส้นทางที่เป็นไปได้");
    }

    const optimal = solutions.map(solution => {
      let totDist = 0, totDur = 0;
      const optimalRoute = solution.map((step, i) => {
        const { node, arrival } = step;
        const stayH = parseFloat(node.number) || 0;
        let travelDist = 0, travelDur = 0;

        if (i < solution.length - 1) {
          const next = solution[i + 1].node;
          const fromIdx = enriched.findIndex(n => n.originalIndex === node.originalIndex);
          const toIdx = enriched.findIndex(n => n.originalIndex === next.originalIndex);
          const d = distMat[fromIdx][toIdx];
          travelDist = d.distanceValue;
          totDist += d.distanceValue;
          travelDur = d.durationValue;
          totDur += d.durationValue;
        }

        return {
          position: node.position || node.originalIndex,
          text: node.text,
          placeId: node.placeId,
          name: node.name,
          arrival: arrival.format("YYYY-MM-DD HH:mm"),
          stay: stayH,
          isOpenAtArrival: isPlaceOpen(node.opening_hours, arrival),
          travelDistance: (travelDist / 1000).toFixed(2),
          travelDuration: formatDuration(travelDur),
          locked: node.locked || false
        };
      });

      return {
        optimalRoute,
        totalDistance: (totDist / 1000).toFixed(2),
        totalDuration: formatDuration(totDur),
        feasible: optimalRoute.every(x => x.isOpenAtArrival) || overrideClosed
      };
    }).slice(0, 3);

    const responseData = {
      routes: optimal,
      lockedPositions: lockedPositions || []
    };

    lastPlanData = responseData;

    console.log("✅ Successfully generated", optimal.length, "routes");

    res.json({
      success: true,
      data: responseData
    });

  } catch (e) {
    console.error("❌ Error in /api/plan:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- Endpoint: GET /api/plan ล่าสุด ---
router.get("/api/plan", (req, res) => {
  if (!lastPlanData) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลแผนการเดินทางล่าสุด" });
  res.json({ success: true, data: lastPlanData });
});

module.exports = router;