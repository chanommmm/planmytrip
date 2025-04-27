import { formatInTimeZone } from 'date-fns-tz';
import { parseISO } from 'date-fns'; // ✅ ใช้ date-fns แทน date-fns-tz

/**
 
แปลงค่าเวลาจาก String เป็นเวลาในโซนไทย
@param {string} dateString - เวลารูปแบบ ISO เช่น '2025-04-15T12:00:00Z'
@returns {string} - เวลาที่แปลงเป็นโซนเวลาไทย*/
export const convertToThaiTime = (dateString) => {
    if (!dateString) {
        console.error("❌ ข้อมูลเวลาไม่ถูกต้อง!");
        return null;
    }

    try {
        const date = parseISO(dateString); // แปลงจาก String เป็น Date
        return formatInTimeZone(date, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss'); // แปลงเป็นเวลาไทย
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการแปลงเวลา:", error);
        return null;
    }
};