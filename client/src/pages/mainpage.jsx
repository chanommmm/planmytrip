import { useState, useEffect } from 'react';
import './mainpage.css';
import { HeaderInput } from '../components/Header';
import DynamicInput from '../components/DynamicInput';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import Result from '../components/Result';
import Footer from '../components/Footer';
import { convertToThaiTime } from '../utils/dateUtils'; 

registerLocale("th", th);

const Mainpage = ({ sendData }) => {
  const [transport, setTransport] = useState("");
  const [date, setDate] = useState(null);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [time, setTime] = useState("");
  const [inputData, setInputData] = useState({ inputs: [], avoidTolls: false });

  useEffect(() => {
    console.log("ข้อมูล Input ล่าสุด:", inputData);
  }, [inputData]);

  const handleSubmit = async () => {
    if (!transport || !date || !time || inputData.inputs.length === 0) {
        alert("กรุณากรอกข้อมูลให้ครบก่อนเริ่มวางแผน!");
        return;
    }

    // รวม date และ time ให้เป็นค่าเดียวกัน
    const fullDateTime = `${date.toISOString().split("T")[0]} ${time}:00`;

    const requestData = {
      transport,
      date: convertToThaiTime(fullDateTime),
      time,
      locations: inputData.inputs.map(input => ({
          text: input.text,
          lat: input.lat, // ✅ ส่งละติจูดไป Backend
          lng: input.lng, // ✅ ส่งลองจิจูดไป Backend
          number: input.number,
          placeId: input.placeId, // ✅ ส่ง `placeId` ไป Backend
          name: input.name,
          
      })),
      avoidTolls: inputData.avoidTolls,
  };
  
  console.log("📌 ข้อมูลที่ส่งไป Backend:", requestData);
  await sendData(requestData);

    try {
        await sendData(requestData);
        alert("✅ ส่งข้อมูลสำเร็จ! กรุณารอผลลัพธ์.");
    } catch (error) {
        alert("❌ เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่!");
    }
};


  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      ["00", "30"].forEach(min => {
        const formatted = `${h.toString().padStart(2, '0')}.${min}`;
        times.push(formatted);
      });
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <>
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
                <input type="radio" name="transport" value="car" onChange={(e) => setTransport(e.target.value)} />
                <i className="bi bi-car-front-fill"></i>
                <span className="type">รถยนต์</span>
              </label>

              <label className="category-botton">
                <input type="radio" name="transport" value="walk" onChange={(e) => setTransport(e.target.value)} />
                <i className="bi bi-person-standing"></i>
                <span className="type">เดิน</span>
              </label>
            </div>

            <div className="main-box">
              <div className="date-time">
                {/* เลือกวันที่ */}
                <label className="date-wrapper">
                  <i className="bi bi-calendar3"></i>
                  <div className="custom-date-picker">
                    <DatePicker
                      selected={date}
                      onChange={(selectedDate) => {
                        setDate(selectedDate);
                        setIsDateOpen(false); // ปิดปฏิทิน
                      }}
                    //   onClickOutside={() => setIsDateOpen(false)}
                    //   onInputClick={() => setIsDateOpen(true)}
                    //   open={isDateOpen}
                      locale="th"
                      dateFormat="dd MMMM yyyy"
                      placeholderText="เลือกวันที่เริ่มเดินทาง"
                      className="date-picker"
                    //   shouldCloseOnSelect={true}
                      onSelect={() => setIsDateOpen(false)}
                    />
                  </div>
                </label>

                {/* เลือกเวลา */}
                <label className="time-wrapper">
                  <i className="bi bi-clock"></i>
                  <div className="custom-time-picker">
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`styled-select no-border ${!time ? 'placeholder' : ''}`}
                    >
                      <option value="" disabled>เลือกเวลาเริ่มต้น</option>
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
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
        <Result />
        <Result />
        <Result />
        <Result />
      </div>
      <Footer />
    </div>
    
    
    </>
  );
};

export default Mainpage;
