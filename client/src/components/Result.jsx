import React, { useState } from "react";
import './Result.css';
import { useTranslation } from 'react-i18next';

export default function Result({ routeData, travelMode }) {
  const routes = routeData?.routes || [];
  const [showDetailsMap, setShowDetailsMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
    };

  const toggleDetails = (index) => {
    setShowDetailsMap(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ฟังก์ชันแปลงนาทีเป็นชั่วโมงและนาที
  const formatDurationFromMinutes = (minutes, t) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} ${t('hourUnit')}`;
      } else {
        return `${hours} ${t('hourUnit')} ${remainingMinutes} ${t('minuteUnit')}`;
      }
    }
    return `${minutes} ${t('minuteUnit')}`;
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

  const convertPositionToLetter = (position) => {
    return String.fromCharCode(65 + position); // 'A' = 65, 'B' = 66, ...
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
              <span>{t('recommended_route')} {routeIndex + 1}</span>
              <h1>{formatDurationFromMinutes(route.travelDuration, t)}</h1>  {/* แสดงระยะเวลารวม */}
            </div>

            {/* ส่วนแสดงเส้นทาง */}
            <div className="path">
              <div className="path-visual">
                <div className="waypoint-visual">
                  {currentRoute.map((point, index) => (
                    <React.Fragment key={index}>
                      <div className="circle-label">{convertPositionToLetter(point.position)}</div>
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
                <span>{route.totalDistance} {t('km')}</span>
                <span>{t('total_duration')}</span>
                <span>{formatDurationFromMinutes(route.totalDuration, t)}</span>
              </div>

              {/* แสดงรายละเอียดเพิ่มเติม */}
              {showDetails && (
                <div className="details-content">
                  {currentRoute.map((step, index) => (
                    <React.Fragment key={index}>
                      <div className="detail-point">
                        <div className="circle-wrap">
                          <div className="circle-label">{convertPositionToLetter(step.position)}</div>
                          {index < currentRoute.length - 1 && (
                            <div className="dot-separator">•<br />•<br />•</div>
                          )}
                        </div>
                        <div className="detail-wrap">
                          <span className="location-name">{step.name}</span>
                          <span>{t('arrival')}: {step.arrival} {t('stay')}: {step.stay} {t('hourUnit')}</span>
                          {t('travel')}: {step.travelDistance} {t('kmUnit')}  {t('timespent')}: {formatDurationFromMinutes(step.travelDuration, t)}
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
                  <i class="bi bi-sign-turn-right-fill"></i>
                  <span>{t('startJourney')}</span>
                </div>
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
}
