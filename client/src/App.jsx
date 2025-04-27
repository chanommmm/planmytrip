import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Mainpage from "./pages/mainpage";
import Howto from "./pages/howto";

function App() {
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    // ดึงข้อมูลจาก Backend
    const fetchAPI = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api");
            setData(response.data);
        } catch (err) {
            console.error("Error fetching API:", err);
            setError("ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้");
        }
    };

    // ส่งข้อมูลไป Backend
    const sendDataToBackend = async (inputData) => {
      try {
          const response = await axios.post("http://localhost:8080/api/plan", inputData);
          console.log("ผลลัพธ์จาก Backend:", response.data.routes);
      } catch (err) {
          console.error("Error sending data:", err);
      }
  };

    useEffect(() => {
        fetchAPI();
    }, []);

    return (
        <>
            {error && <p style={{ color: "red" }}>{error}</p>} {/* แสดงข้อผิดพลาด */}
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
