import React from "react";
import "./home.css";
import Footer from "../components/Footer";
import { HeaderHome } from "../components/Header";
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
  };
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
          <a href="#about" className="about-link">{t('about_us')}</a>
        </div>
      </div>

      {/* Banner with image and text */}
      <div className="banner-con1">
        <div className="banner-item1">
          <div className="banner-left">
            <img src="/city.jpg" alt="Image description" />
          </div>
          <div className="banner-right">
            <h2>{t('Banner_homepage')}</h2>
            <p>
              {t('Banner2_homepage')}
            </p>
            <a href="#create-trip" className="create-trip-btn">{t('create_trip_btn')}</a>
          </div>
        </div>
      </div>

      {/* Popular Places */}
      <div className="popular-places">
        <h2 className="title">{t('title1')}</h2>
        <div className="places-container">
          <div className="place-box">
            <img src="/bkk.jpg" alt="สถานที่ 1" />
            <p className="place-name">{t('place1')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/bkk1.jpg" alt="สถานที่ 2" />
            <p className="place-name">{t('place2')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/hkt.jpg" alt="สถานที่ 3" />
            <p className="place-name">{t('place3')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/cnx1.jpg" alt="สถานที่ 4" />
            <p className="place-name">{t('place4')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          {/* Additional places */}
          <div className="place-box">
            <img src="/bkk.jpg" alt="สถานที่ 1" />
            <p className="place-name">{t('place1')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/bkk1.jpg" alt="สถานที่ 2" />
            <p className="place-name">{t('place2')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/hkt.jpg" alt="สถานที่ 3" />
            <p className="place-name">{t('place3')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/cnx1.jpg" alt="สถานที่ 4" />
            <p className="place-name">{t('place4')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
        </div>
      </div>

      {/* Popular Cafes */}
      <div className="popular-places">
        <h2 className="title">{t('title2')}</h2>
        <div className="places-container">
          <div className="place-box">
            <img src="/bkk.jpg" alt="สถานที่ 1" />
            <p className="place-name">{t('place1')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/bkk1.jpg" alt="สถานที่ 2" />
            <p className="place-name">{t('place2')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/hkt.jpg" alt="สถานที่ 3" />
            <p className="place-name">{t('place3')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/cnx1.jpg" alt="สถานที่ 4" />
            <p className="place-name">{t('place4')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          {/* Additional places */}
          <div className="place-box">
            <img src="/bkk.jpg" alt="สถานที่ 1" />
            <p className="place-name">{t('place1')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/bkk1.jpg" alt="สถานที่ 2" />
            <p className="place-name">{t('place2')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/hkt.jpg" alt="สถานที่ 3" />
            <p className="place-name">{t('place3')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
          <div className="place-box">
            <img src="/cnx1.jpg" alt="สถานที่ 4" />
            <p className="place-name">{t('place4')}</p>
            <p className="place-description">{t('description1')}</p>
          </div>
        </div>
      </div>
    <Footer />
    </>
  );
};

export default Home;
