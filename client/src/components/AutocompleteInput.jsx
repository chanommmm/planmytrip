import { useEffect, useRef } from "react";

const AutocompleteInput = ({ index, onSelect }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!window.google) {
            console.error("❌ Google API ไม่ถูกโหลด! ตรวจสอบ <script> ใน index.html");
            return;
        }

        if (!inputRef.current) {
            console.error("❌ inputRef ยังไม่มีค่า! ตรวจสอบว่า input ถูกสร้างหรือไม่");
            return;
        }

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ["establishment"], // ค้นหาร้านค้า, โรงแรม, อาคาร
            componentRestrictions: { country: "TH" },
            fields: ["formatted_address", "name", "geometry", "place_id", ] // ดึงข้อมูลชื่อ, ที่อยู่ และพิกัด
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            console.log("🚀 สถานที่ที่เลือก:", place); // ✅ ตรวจสอบค่าที่ได้รับ

            if (!place.geometry) {
                console.warn("⚠️ ไม่พบพิกัดของสถานที่นี้");
                return;
            }

            const locationData = {
                text: place.formatted_address, 
                lat: place.geometry.location.lat(), // ✅ ดึงค่าละติจูด
                lng: place.geometry.location.lng(), // ✅ ดึงค่าลองจิจูด
<<<<<<< HEAD
                placeId: place.place_id, // ✅ เพิ่ม place_id เพื่อส่งไป Backend
=======
                placeId: place.place_id, // ✅ เพิ่ม place_id เพื่อส่งไป Backend
>>>>>>> 019bbc9cee79d406bffaad6f89798b2fa6359274
                name: place.name,
            };

            console.log("📌 ข้อมูลที่ส่งไป DynamicInput:", locationData);
            onSelect(index, locationData); // ✅ ส่งข้อมูลไป DynamicInput.jsx
        });

    }, [index, onSelect]);

    return (
        <input 
            type="text"
            ref={inputRef}
            placeholder={index === 0 ? "เลือกจุดเริ่มต้น" : "เลือกจุดหมาย"}
            className="autocomplete-input"
        />
    );
};

export default AutocompleteInput;
