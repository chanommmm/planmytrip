import { useState, useEffect } from 'react';
import './mainpage.css'; 
import { HeaderInput } from '../components/Header';
import DynamicInput from '../components/DynamicInput';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import Result from '../components/Result';  // นำ Result component มาใช้งาน
import Footer from '../components/Footer';
import moment from 'moment-timezone';
import { useTranslation } from 'react-i18next';

registerLocale("th", th);

export default function Mainpage({ sendData }) {
  const [transport, setTransport] = useState(""); 
  const [date, setDate] = useState(null);        
  const [time, setTime] = useState("");          
  const [inputData, setInputData] = useState({ inputs: [], avoidTolls: false });
  const [planResult, setPlanResult] = useState(null);  // เก็บผลลัพธ์จาก backend

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupShowConfirm, setPopupShowConfirm] = useState(false); // << ปุ่มยืนยัน

  const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
  };
 
  useEffect(() => {
    console.log("ข้อมูล Input ล่าสุด:", inputData);
  }, [inputData]);

  const handleSubmit = async (overrideClosed = false) => {
    // 1. ตรวจสอบข้อมูลเบื้องต้น 
    if (!transport || !date || !time || inputData.inputs.length === 0) {
      return alert(t('alert4'));
    }

    // 2. สร้าง moment + format
    const [hour, minute] = time.split('.').map(n => parseInt(n, 10));
    const visitDateTime = moment(date)
      .tz('Asia/Bangkok')
      .hour(hour)
      .minute(minute)
      .second(0);
    const thaiDateTime = visitDateTime.format('YYYY-MM-DD HH:mm:ss');

    // 3. เตรียม payload พร้อม flag overrideClosed
    const request = {
      transport,
      date: thaiDateTime,
      time, 
      departureTime: visitDateTime.toISOString(),
      locations: inputData.inputs.map(i => ({
        text: i.text,
        lat: i.lat,
        lng: i.lng,
        number: i.number || "0",
        placeId: i.placeId,
        name: i.name,
        position: i.position,
        locked: i.locked || false,
      })),
      avoidTolls: inputData.avoidTolls,
      overrideClosed,
    };

    console.log("ส่งไป backend:", request);

    try {
      const resp = await sendData(request);
      console.log("ตอบกลับ:", resp);

      // 5. กรณีคำนวณสำเร็จ
      if (resp.success) {
        setPlanResult(resp.data);
      } else {
        throw new Error(resp.message || "ไม่สามารถคำนวณได้");
      }
    } catch (err) {
      console.error("Error:", err);

      const message = err?.response?.data?.message || err?.message;
      const closed = err?.response?.data?.closed || [];

      if (message || closed.length > 0) {
        const popupLines = [];
        popupLines.push(
          <strong key="title" style={{ fontSize: "22px", color: "#00000", display: "block", marginBottom: "16px" }}>
            {t('alert3')}
          </strong>
        );

        if (message) {
          popupLines.push(<p key="reason" style={{ marginBottom: "8px" }}>สาเหตุ: {message}</p>);
        }

        if (closed.length > 0) {
          popupLines.push(<p key="subtitle">{t('alert2')}:</p>);
          closed.forEach((name, idx) => {
            popupLines.push(<li key={`closed-${idx}`}>• {name}</li>);
          });
        }

        popupLines.push(
          <p key="confirm">{t('alert1')}</p>
        );

        setPopupMessage(popupLines); // ส่งเป็น array ของ JSX
        setIsPopupVisible(true);
        setPopupShowConfirm(true);
      } else {
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  useEffect(() => {
    if (time) {
      const [hours, minutes] = time.split(':');
      const updatedDepartureTime = new Date();
      updatedDepartureTime.setHours(hours);
      updatedDepartureTime.setMinutes(minutes);
      updatedDepartureTime.setSeconds(0);
      
    }
  }, [time]);

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
      <div className="main-wrap">
        <div className="main-content">
          <div className="postimage">
            <img src="/post4.jpg" alt="" />
          </div>

          <div className="overlay-content">
            <div className="Title">{t('title_mainpage')}</div> 
            <div className="box">
              <div className="category-box">
                <label className="category-botton">
                  <input
                    type="radio"
                    name="transport"
                    value="car"
                    onChange={e => setTransport(e.target.value)}
                  />
                  <i className="bi bi-car-front-fill" />
                  <span className="type">{t('type1')}</span>
                </label>
                <label className="category-botton">
                <input
                  type="radio"
                  name="transport"
                  value="transit"
                  onChange={e => setTransport(e.target.value)}
                />
                <i className="bi bi-truck-front-fill" />
                <span className="type">{t('type2')}</span>
              </label>                
                <label className="category-botton"> 
                  <input
                    type="radio"
                    name="transport"
                    value="walk"
                    onChange={e => setTransport(e.target.value)}
                  />
                  <i className="bi bi-person-standing" />
                  <span className="type">{t('type3')}</span>
                </label>
              </div>

              <div className="main-box">
                <div className="date-time">
                  <label className="date-wrapper">
                    <i className="bi bi-calendar3" />
                    <DatePicker
                      selected={date}
                      onChange={d => setDate(d)}
                      locale="th"
                      dateFormat="dd MMMM yyyy"
                      placeholderText={t('placeholder1')}
                      className="date-picker"
                    />
                  </label> 
                  <label className="time-wrapper">
                    <i className="bi bi-clock" />
                    <select
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className={`styled-select no-border ${!time ? 'placeholder' : ''}`}
                    >
                      <option value="" disabled>{t('placeholder2')}</option>
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
                  <button className="submit-button" onClick={() => handleSubmit(false)}>
                    {t('submit_btn')}
                  </button>
                </div>
              </div>
            </div>

            {/* แสดงผลลัพธ์เมื่อมี */}
            {planResult && (
              <div className="result-section">
                <Result routeData={planResult} /> {/* ส่งผลลัพธ์ไปยัง Result */}
              </div>
            )}

            
          </div>


        </div>
        <Footer />

        {isPopupVisible && (
        <div className="popup-overlay">
          <div className="popup-box">
            {/* <pre className="popup-message">{popupMessage}</pre> */}
            <div className="popup-message">{popupMessage}</div>

            {popupShowConfirm ? (
              <div className="popup-buttons">
                <button
                  className="popup-confirm"
                  onClick={() => {
                    setIsPopupVisible(false);
                    setPopupShowConfirm(false);
                    handleSubmit(true); 
                  }}
                >
                  {t('confirm_btn')}
                </button>
                <button
                  className="popup-close"
                  onClick={() => {
                    setIsPopupVisible(false);
                    setPopupShowConfirm(false);
                  }}
                >
                  {t('cancel_btn')}
                </button>
              </div>
            ) : (
              <button
                className="popup-close"
                onClick={() => setIsPopupVisible(false)}
              >
                {t('cancel_btn')}
              </button>
            )}
          </div>
        </div>
      )}
      
      </div>
    </div>
  );
} 