import React from 'react'
import { Link } from "react-router-dom";
import './Header.css'
import { useTranslation } from 'react-i18next';


const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const currentLang = i18n.language;
  const languages = [
    { code: "th", label: "ไทย", flag: "thailand.png" },
    { code: "en", label: "Eng", flag: "uk.png" }
  ];

  const selected = languages.find((lang) => lang.code === currentLang);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="fake-select" onClick={() => setOpen(!open)}>
      <div className="selected-option">
        <img src={selected.flag} alt={selected.label} className="flag" />
        {selected.label}
      </div>
      {open && (
        <div className="options">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="option"
              onClick={() => changeLanguage(lang.code)}
            >
              <img src={lang.flag} alt={lang.label} className="flag" />
              {lang.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



const HeaderHome = () => {
    const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };
    
    return(
        <header>
        <div className='head-con'>
            <div className='item-con'>
                <div className="logo">
                        <Link to="/" className="title">Plan My Trip</Link>
                </div>

                {/* Toggle สำหรับ Hamburger menu */}
                <input type="checkbox" id="menu-toggle" className="menu-toggle" />

                <label htmlFor="menu-toggle" className="ham-icon">
                    <i className="bi bi-list"></i>
                </label>

                <div className='right-btn'>
                    <div className="right-header">
                        <Link to="/howto" className='how-to-btn'>{t('how_to_use')}</Link>
                        <LanguageSelector />
                        <Link to="/mainpage" className="create-trip-btn">{t('create_trip_btn')}</Link>            
                    </div>
                </div>
            </div>
        </div>
    </header>
    );
    
};

const HeaderInput = () => {
    const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };
    return(
        <header>
            <div className='head-con'>
                <div className='item-con'>
                    <div className="logo">
                            <Link to="/" className="title">Plan My Trip</Link>
                    </div>

                    {/* Toggle สำหรับ Hamburger menu */}
                    <input type="checkbox" id="menu-toggle" className="menu-toggle" />

                    <label htmlFor="menu-toggle" className="ham-icon">
                        <i className="bi bi-list"></i>
                    </label>

                    <div className='right-btn'>
                        <div className="right-header">
                            <Link to="/" className='home-btn'>กลับสู่หน้าหลัก</Link>
                            <Link to="/howto" className='how-to-btn'>{t('how_to_use')}</Link> 
                            <LanguageSelector /> 
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

const HeaderHowto = () => {
    const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };
    return(
        <header>
            <div className='head-con'>
                <div className='item-con'>
                    <div className="logo">
                            <Link to="/" className="title">Plan My Trip</Link>
                    </div>

                    {/* Toggle สำหรับ Hamburger menu */}
                    <input type="checkbox" id="menu-toggle" className="menu-toggle" />

                    <label htmlFor="menu-toggle" className="ham-icon">
                        <i className="bi bi-list"></i>
                    </label>

                    <div className='right-btn'>
                        <div className="right-header">
                            <Link to="/" className='home-btn'>{t('how_to_use')}</Link>
                            <LanguageSelector />
                            <Link to="/mainpage" className="create-trip-btn">{t('create_trip_btn')}</Link>            
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export { HeaderHome, HeaderInput, HeaderHowto };