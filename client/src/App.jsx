// src/App.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Mainpage from "./pages/mainpage";
import Howto from "./pages/howto";
import 'bootstrap-icons/font/bootstrap-icons.css';
import './i18n';

function App() {
  const [error, setError] = useState(null);

  // ดึงข้อมูลทดสอบจาก Backend
  const fetchAPI = async () => {
    try {
      await axios.get("http://localhost:8080/api");
    } catch (err) {
      console.error("Error fetching API:", err);
      setError("ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้");
    }
  };

  // ส่งข้อมูลไป Backend สำหรับวางแผน
  const sendDataToBackend = async (inputData) => {
    try {
      const res = await axios.post("http://localhost:8080/api/plan", inputData);
      // ถ้า backend ส่งกลับ success: false ให้ถือเป็น error ด้วย
      if (!res.data.success) {
        throw new Error(res.data.message || "Backend returned failure");
      }
      return res.data;      // <<< คืนค่า res.data ให้ Mainpage
    } catch (err) {
      console.error("Error sending data:", err);
      // โยน error ต่อไปยัง Mainpage.jsx เพื่อไปที่ catch อีกที
      throw err;
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mainpage" element={<Mainpage sendData={sendDataToBackend} />} />
          <Route path="/howto" element={<Howto />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
