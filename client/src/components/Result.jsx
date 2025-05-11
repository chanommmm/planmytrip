import React, { useState } from "react";
 import './Result.css';

export default function Result({ routeData }) {
  const routes = routeData?.routes || [];
  const [showDetailsMap, setShowDetailsMap] = useState({});

  const toggleDetails = (index) => {
    setShowDetailsMap(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="result-wrapper">
      {routes.map((route, routeIndex) => {
        const showDetails = showDetailsMap[routeIndex] || false;
        const currentRoute = route.optimalRoute || [];

        return (
          <div key={routeIndex} className="info-result">
            {/* ส่วนแสดงหมายเลขเส้นทาง */}
            <div className="num-result">
              <span>เส้นทางแนะนำ {routeIndex + 1}</span>
              <h1>{route.totalDuration}</h1>  // แสดงระยะเวลารวมแทน
            </div>


            {/* ส่วนแสดงเส้นทาง */}
            <div className="path">
              <div className="path-visual">
                <div className="waypoint-visual">
                  {currentRoute.map((point, index) => (
                    <React.Fragment key={index}>
                      <div className="circle-label">{point.name}</div>
                      {index !== currentRoute.length - 1 && (
                        <span className="arrow-icon">
                          <i className="bi bi-chevron-double-right"></i>
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <button onClick={() => toggleDetails(routeIndex)}>
                  <i className={`bi ${showDetails ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                </button>
              </div>

              {/* สรุประยะทางและเวลา */}
              <div className="path-info">
                <span>{route.totalDistance} กม.</span>
                <span>ระยะเวลาทั้งหมด</span>
                <span>{route.totalDuration}</span>
              </div>

              {/* แสดงรายละเอียดเพิ่มเติม */}
              {showDetails && (
                <div className="details-content">
                  {currentRoute.map((step, index) => (
                    <React.Fragment key={index}>
                      <div className="detail-point">
                        <div className="circle-wrap">
                          <div className="circle-label">{step.name}</div>
                          {index < currentRoute.length - 1 && (
                            <div className="dot-separator">•<br />•<br />•</div>
                          )}
                        </div>
                        <div className="detail-wrap">
                          <span className="location-name">{step.name}</span>
                          <span>ถึง: {step.arrival} / พัก: {step.stay} ชม.</span>
                          <span>เดินทาง: {step.travelDistance} กม. / {step.travelDuration}</span>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* ปุ่มเริ่มเดินทาง */}
            <div className="btn-result">
              <button>
                <div className="grid-btn-result">
                  <i className="bi bi-car-front-fill"></i>
                  <span>เริ่มเดินทาง</span>
                </div>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
