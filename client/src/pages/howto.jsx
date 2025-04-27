import React from "react";
import "./howto.css";
import Footer from "../components/Footer";
import { HeaderHowto } from "../components/Header";

const steps = [
  {
    id: 1,
    title: "ขั้นตอนที่ 1: เลือกวิธีการเดินทาง",
    desc: "เลือกระหว่างรถยนต์หรือเดินเท้า เพื่อเริ่มวางแผนเส้นทางที่เหมาะสมกับคุณ",
    img: "step1.png",
    reverse: false,
  },
  {
    id: 2,
    title: "ขั้นตอนที่ 2: กำหนดวันและเวลา",
    desc: "ระบุวันที่และเวลาที่คุณต้องการเริ่มต้นการเดินทาง",
    img: "step1.png",
    reverse: true,
  },
  {
    id: 3,
    title: "ขั้นตอนที่ 3: เพิ่มจุดหมาย",
    desc: "กรอกสถานที่ที่คุณอยากแวะหรือจุดหมายปลายทาง พร้อมตัวเลือกหลีกเลี่ยงค่าผ่านทาง",
    img: "step1.png",
    reverse: false,
  },
  {
    id: 4,
    title: "ขั้นตอนที่ 4: กำหนดเวลา",
    desc: "ระบุเวลาที่คุณต้องการจะอยู่ในแต่ละสถานที่",
    img: "step1.png",
    reverse: true,
  },
];

const Howto = () => {
  return (
    <>
      <HeaderHowto />

      <div className="how-to-section">
        <h2 className="section-title">วิธีการใช้งาน</h2>
        {steps.map(step => (
          <div key={step.id} className="step-card">
            <div className={`step-row ${step.reverse ? 'reverse' : ''}`}>
              <div className="step-image">
                <img src={step.img} alt={`Step ${step.id}`} />
              </div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
};

export default Howto;
