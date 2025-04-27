import React, { useState } from "react";
import './Result.css';
import { mockData } from "./mockupdata";

export default function Result() {
  const [showDetails, setShowDetails] = useState(false); // ใช้ state ควบคุมการแสดงผล
  const waypoints = mockData.steps.map(step => step.label); // ดึงข้อมูลจุดแวะจาก mockData

  return (
    <div className="info-result">
      <div className="num-result">
        <span>{mockData.recommended}</span>
        <h1>{mockData.duration}</h1>
      </div>

      <div className="path">
        <div className="path-visual">
          {/* วงกลม A → B → C → D พร้อมลูกศร */}
          <div className="waypoint-visual">
            {waypoints.map((point, index) => (
              <React.Fragment key={index}>
                <div className="circle-label">{point}</div>
                {index !== waypoints.length - 1 && (
                  <span className="arrow-icon">
                    <i className="bi bi-chevron-double-right"></i>
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ปุ่มกดเปิด/ปิดข้อมูล */}
          <button onClick={() => setShowDetails(!showDetails)}>
            <i className="bi bi-chevron-down"></i>
          </button>
        </div>

        <p className="path-info">
          <span>{mockData.distance}</span>
          <span>ระยะเวลาทั้งหมด</span>
          <span>{mockData.totalDuration}</span>
        </p>

        <div className="details">
          {showDetails && (
          <div className="details-content">
            {mockData.steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="detail-point">
                  <div className="circle-label">{step.label}</div>
                  <span className="location-name">{step.location}</span>
                </div>

                {/* จุดสามจุดแนวตั้ง เฉพาะถ้าไม่ใช่อันสุดท้าย */}
                {index < mockData.steps.length - 1 && (
                <div className="dot-separator">
                  •<br />•<br />•
                </div>
                )}
              </React.Fragment>
            ))}
          </div>
          )}
        </div>

      </div>

      <div className="btn-result">
        <button>
          <div className="grid-btn-result">
            <i className="bi bi-car-front-fill"></i>
            <span>เดินทาง</span>
          </div>
        </button>
      </div>
    </div>
  );
}