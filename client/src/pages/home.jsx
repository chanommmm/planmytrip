import React from "react";
import "./home.css";
import Footer from "../components/Footer";
import { HeaderHome } from "../components/Header";

const Home = () => {
  return (
    <>

    <HeaderHome />

      {/* Banner with video */}
      <div className="banner-con">
        <div className="banner-item">
          <a className="vdo" href="#">
            <video playsInline autoPlay muted loop>
              <source src="/thailand.mp4" type="video/mp4" />
            </video>
          </a>
        </div>
        <div className="about-bar">
          <a href="#about" className="about-link">เกี่ยวกับเรา</a>
        </div>
      </div>

      {/* Banner with image and text */}
      <div className="banner-con1">
        <div className="banner-item1">
          <div className="banner-left">
            <img src="/city.jpg" alt="Image description" />
          </div>
          <div className="banner-right">
            <h2>เริ่มต้นสร้างแผนการเดินทางของคุณ</h2>
            <p>
              ด้วยการสร้างแผนการที่ง่ายพร้อมคำแนะนำเส้นทางต่างๆ ด้วยตัวของคุณเอง
            </p>
            <a href="#create-trip" className="create-trip-btn">สร้างแผนการเดินทาง</a>
          </div>
        </div>
      </div>

      {/* Popular Places */}
      <div className="popular-places">
        <h2 className="title">สถานที่ท่องเที่ยวยอดนิยม</h2>
        <div className="places-container">
          <div className="place-box">
            <img src="/bkk.jpg" alt="สถานที่ 1" />
            <p className="place-name">วัดพระแก้ว</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/bkk1.jpg" alt="สถานที่ 2" />
            <p className="place-name">วัดอรุณ</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/hkt.jpg" alt="สถานที่ 3" />
            <p className="place-name">อ่าวนาง</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/cnx1.jpg" alt="สถานที่ 4" />
            <p className="place-name">ดอยอินทนนท์</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          {/* Additional places */}
          <div className="place-box">
            <img src="/bkk.jpg" alt="สถานที่ 1" />
            <p className="place-name">วัดพระแก้ว</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/bkk1.jpg" alt="สถานที่ 2" />
            <p className="place-name">วัดอรุณ</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/hkt.jpg" alt="สถานที่ 3" />
            <p className="place-name">อ่าวนาง</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/cnx1.jpg" alt="สถานที่ 4" />
            <p className="place-name">ดอยอินทนนท์</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
        </div>
      </div>

      {/* Popular Cafes */}
      <div className="popular-places">
        <h2 className="title">คาเฟ่ยอดนิยม</h2>
        <div className="places-container">
          <div className="place-box">
            <img src="/bkk.jpg" alt="สถานที่ 1" />
            <p className="place-name">วัดพระแก้ว</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/bkk1.jpg" alt="สถานที่ 2" />
            <p className="place-name">วัดอรุณ</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/hkt.jpg" alt="สถานที่ 3" />
            <p className="place-name">อ่าวนาง</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/cnx1.jpg" alt="สถานที่ 4" />
            <p className="place-name">ดอยอินทนนท์</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          {/* Additional places */}
          <div className="place-box">
            <img src="/bkk.jpg" alt="สถานที่ 1" />
            <p className="place-name">วัดพระแก้ว</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/bkk1.jpg" alt="สถานที่ 2" />
            <p className="place-name">วัดอรุณ</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/hkt.jpg" alt="สถานที่ 3" />
            <p className="place-name">อ่าวนาง</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
          <div className="place-box">
            <img src="/cnx1.jpg" alt="สถานที่ 4" />
            <p className="place-name">ดอยอินทนนท์</p>
            <p className="place-description">สถานที่ท่องเที่ยวที่เต็มไปด้วยวัฒนธรรมและชีวิตเมือง</p>
          </div>
        </div>
      </div>
    <Footer />
    </>
  );
};

export default Home;
