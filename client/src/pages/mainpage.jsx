// src/pages/Mainpage.jsx
import { useState, useEffect } from 'react';
import './mainpage.css';
import { HeaderInput } from '../components/Header';
import DynamicInput from '../components/DynamicInput';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import Result from '../components/Result';
import Footer from '../components/Footer';
import moment from 'moment-timezone';

registerLocale("th", th);

export default function Mainpage({ sendData }) {
  const [transport, setTransport] = useState("");
  const [date, setDate] = useState(null);

  const [time, setTime] = useState("");
  const [inputData, setInputData] = useState({ inputs: [], avoidTolls: false });

  useEffect(() => {
    console.log("ข้อมูล Input ล่าสุด:", inputData);
  }, [inputData]);

  const handleSubmit = async () => {
    if (!transport || !date || !time || inputData.inputs.length === 0) {
      return alert("กรุณากรอกข้อมูลให้ครบก่อนเริ่มวางแผน!");
    }

    // แยก hour/minute จาก time picker ("13.30" → 13, 30)
    const [hour, minute] = time.split('.').map(n => parseInt(n, 10));

    // สร้าง moment-timezone โดยใช้ date และ time
    const visitDateTime = moment(date)
      .tz('Asia/Bangkok')
      .hour(hour)
      .minute(minute)
      .second(0);

    // ฟอร์แมตเป็น "YYYY-MM-DD HH:mm:ss"
    const thaiDateTime = visitDateTime.format('YYYY-MM-DD HH:mm:ss');
    console.log("🕒 visitDateTime (Asia/Bangkok):", thaiDateTime);

    // สร้าง object ส่งไป backend
    const requestData = {
      transport,
      date: thaiDateTime,
      time,
      locations: inputData.inputs.map(input => ({
        text: input.text,
        lat: input.lat,
        lng: input.lng,
        number: input.number,
        placeId: input.placeId,
        name: input.name,
      })),
      avoidTolls: inputData.avoidTolls,
    };

    console.log("📌 ข้อมูลที่ส่งไป Backend:", requestData);

    try {
      // ส่งข้อมูลและรับผลลัพธ์กลับ
      const response = await sendData(requestData);
      console.log("RESPONSE FROM BACKEND:", response);

      // ตรวจสอบโครงสร้าง: อาจได้ response.routes หรือ response.data.locations
      const enriched = Array.isArray(response.routes)
        ? response.routes
        : Array.isArray(response.data?.locations)
          ? response.data.locations
          : [];

      // เก็บชื่อสถานที่ที่ปิดไว้ในอาเรย์
      const closedPlaces = enriched
        .filter(loc => loc.isOpen === false)
        .map(loc => loc.name);

      // แจ้งเตือนรวมชื่อสถานที่ที่ปิด หรือ บอกว่าเปิดปกติทั้งหมด
      if (closedPlaces.length > 0) {
        alert(`❌ สถานที่ปิดทำการ: ${closedPlaces.join(', ')}`);
      } else {
        alert("✅ ทุกสถานที่เปิดปกติ พร้อมวางแผนต่อได้เลย!");
      }
    } catch (err) {
      console.error("Error sending data:", err);
      alert("❌ เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่!");
    }
  };


  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m of ['00', '30']) {
        times.push(`${h.toString().padStart(2, '0')}.${m}`);
      }
    }
    return times;
  };



  return (

    <div className="background">
      <HeaderInput />

      <div className="main-content">
        <div className="postimage">
          <img src="/post4.jpg" alt="" />
        </div>

        <div className="overlay-content">
          <div className="Title">เริ่มต้นสร้างแผนการเดินทาง</div>

          <div className="box">
            <div className="category-box">
              <label className="category-botton">
                <input
                  type="radio"
                  name="transport"
                  value="car"
                  onChange={e => setTransport(e.target.value)}
                />
                <i className="bi bi-car-front-fill"></i>
                <span className="type">รถยนต์</span>
              </label>

              <label className="category-botton">
                <input
                  type="radio"
                  name="transport"
                  value="walk"
                  onChange={e => setTransport(e.target.value)}
                />
                <i className="bi bi-person-standing"></i>
                <span className="type">เดิน</span>
              </label>
            </div>

            <div className="main-box">
              <div className="date-time">

                <label className="date-wrapper">
                  <i className="bi bi-calendar3"></i>
                  <DatePicker
                    selected={date}
                    onChange={d => setDate(d)}
                    locale="th"
                    dateFormat="dd MMMM yyyy"
                    placeholderText="เลือกวันที่เริ่มเดินทาง"
                    className="date-picker"
                  />
                </label>


                <label className="time-wrapper">
                  <i className="bi bi-clock"></i>
                  <select
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className={`styled-select no-border ${!time ? 'placeholder' : ''}`}
                  >
                    <option value="" disabled>เลือกเวลาเริ่มต้น</option>
                    {generateTimeOptions().map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="location-box">
                <DynamicInput onDataChange={setInputData} />
              </div>

              <div className="submit-box">
                <button className="submit-button" onClick={handleSubmit}>
                  เริ่มต้นวางแผนการเดินทาง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='hiddenpage'>
        <Result /><Result /><Result /><Result />
      </div>

      <Footer />
    </div>

  );


}
