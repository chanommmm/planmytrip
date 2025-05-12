import React, { useState } from "react";
import './Result.css';

export default function Result({ routeData, travelMode }) {
  const routes = routeData?.routes || [];
  const [showDetailsMap, setShowDetailsMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const toggleDetails = (index) => {
    setShowDetailsMap(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ฟังก์ชันสำหรับสร้าง URL ของ Google Maps
  const generateGoogleMapsLinkFromNames = (route) => {
    const points = route.optimalRoute;
    if (points.length < 2) return "#";
  
    const formatName = (name) =>
      encodeURIComponent(name.trim().replace(/\s+/g, " "));
  
    const origin = formatName(points[0].name);
    const destination = formatName(points[points.length - 1].name);
    const waypoints = points
      .slice(1, -1)
      .map((p) => formatName(p.name))
      .join("|");
  
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
  
    return url;
  };

  const handleStartJourney = (route) => {
    // เช็คว่าเป็นการเลือก Public Transit หรือไม่
    console.log("Selected travel mode:", travelMode); // เพิ่ม console.log
    if (travelMode === "TRANSIT") {
      console.log("Public Transit Selected, Showing Modal");
      setSelectedRoute(route);  // เก็บเส้นทางที่เลือก
      setShowModal(true);        // เปิด Modal แจ้งเตือน
    } else {
      // ถ้าไม่ใช่ Public Transit ให้ลิงค์ไป Google Maps ทันที
      console.log("Travel mode is not transit, opening Google Maps directly");
      window.open(generateGoogleMapsLinkFromNames(route), "_blank");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRoute(null); // ล้างการเลือกเส้นทางเมื่อปิด Modal
  };

  const confirmStartJourney = () => {
    if (selectedRoute) {
      console.log("Starting journey with selected route:", selectedRoute);
      // ลิงค์ไปยัง Google Maps
      window.open(generateGoogleMapsLinkFromNames(selectedRoute), "_blank");
    }
    setShowModal(false);
    setSelectedRoute(null);
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
              <h1>{route.totalDuration}</h1>  {/* แสดงระยะเวลารวม */}
            </div>

            {/* ส่วนแสดงเส้นทาง */}
            <div className="path">
              <div className="path-visual">
                <div className="waypoint-visual">
                  {currentRoute.map((point, index) => (
                    <React.Fragment key={index}>
                      <div className="circle-label">{point.position}</div>
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
                          <div className="circle-label">{step.position}</div>
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
                      {index < currentRoute.length - 1 && (
                        <div className="dot-separator">•<br />•<br />•</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* ปุ่มเริ่มเดินทาง */}
            <div className="btn-result">
              <button onClick={() => handleStartJourney(route)}>
                <div className="grid-btn-result">
                  <i className="bi bi-car-front-fill"></i>
                  <span>เริ่มเดินทาง</span>
                </div>
              </button>
            </div>

            {/* Modal Popup แจ้งเตือน */}
            {showModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <span className="close" onClick={closeModal}>&times;</span>
                  <h2>หมายเหตุ</h2>
                  <p>
                    ใน Google Maps API, เมื่อเลือกใช้ Public Transit (รถสาธารณะ) เป็นวิธีการเดินทาง,
                    ระบบจะไม่อนุญาตให้เพิ่มจุดแวะ (waypoints) ในเส้นทางได้เนื่องจากข้อจำกัดของระบบการเดินทางสาธารณะ
                    เช่น รถเมล์ หรือ รถไฟ ซึ่งมีเส้นทางที่กำหนดไว้ล่วงหน้าและมีเวลาที่แน่นอนในการเดินทางระหว่างจุดต่าง ๆ
                    การปรับเปลี่ยนเส้นทางเหล่านี้ด้วยจุดแวะเพิ่มเติมอาจทำให้ระบบไม่สามารถคำนวณเส้นทางที่สามารถใช้บริการสาธารณะได้อย่างแม่นยำ
                  </p>
                  <button onClick={closeModal}>ปิด</button>
                  <button onClick={confirmStartJourney}>ยืนยันและเริ่มเดินทาง</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
