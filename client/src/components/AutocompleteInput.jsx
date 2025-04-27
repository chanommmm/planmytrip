import { useEffect, useRef } from "react";

const AutocompleteInput = ({ index, onSelect }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!window.google) {
            console.error("❌ Google API ไม่ถูกโหลด! ตรวจสอบ `<script>` ใน `index.html`");
            return;
        }
        
        if (!inputRef.current) {
            console.error("❌ `inputRef` ยังไม่มีค่า! ตรวจสอบว่า input ถูกสร้างหรือไม่");
            return;
        }

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ["establishment"], // ค้นหาร้านค้า, โรงแรม, อาคาร
            componentRestrictions: { country: "TH" },
            fields: ["formatted_address", "name", "geometry"] // ดึงข้อมูลชื่อ, ที่อยู่ และพิกัด
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place?.formatted_address) {
                onSelect(index, place.formatted_address);
            } else {
                console.warn("⚠️ ไม่พบข้อมูลที่อยู่ของสถานที่นี้");
            }
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
