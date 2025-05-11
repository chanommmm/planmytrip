import React from 'react'
import { Link } from "react-router-dom";
import './Header.css'


const HeaderHome = () => (
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
                        <Link to="/howto" className='how-to-btn'>วิธีการใช้งาน</Link>
                        <Link to="/mainpage" className="create-trip-btn">สร้างแผนการเดินทาง</Link>            
                    </div>
                </div>
            </div>
        </div>
    </header>
);

const HeaderInput = () => (
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
                        <Link to="/howto" className='how-to-btn'>วิธีการใช้งาน</Link>  
                    </div>
                </div>
            </div>
        </div>
    </header>
);

const HeaderHowto = () => (
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
                        <Link to="/mainpage" className="create-trip-btn">สร้างแผนการเดินทาง</Link>            
                    </div>
                </div>
            </div>
        </div>
    </header>
);

export { HeaderHome, HeaderInput, HeaderHowto };