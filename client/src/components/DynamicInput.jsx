import React, { useState, useEffect } from 'react';
import './DynamicInput.css';
import AutocompleteInput from "./AutocompleteInput";

function DynamicInput({ onDataChange }) {
    // จัดการ Input สถานที่แต่ละจุด
    const [inputs, setInputs] = useState([
        { text: '', number: '' },
        { text: '', number: '' }
    ]);

    // จัดการค่าหลีกเลี่ยงค่าผ่านทาง (Checkbox)
    const [avoidTolls, setAvoidTolls] = useState(false);

    // ส่งข้อมูลทั้งหมดไปที่ `App.jsx`
    useEffect(() => {
        onDataChange({ inputs, avoidTolls });
    }, [JSON.stringify(inputs), avoidTolls, onDataChange]); // ใช้ `JSON.stringify` เพื่อลดการ re-render ที่ไม่จำเป็น

    // ฟังก์ชันเมื่อเลือกสถานที่จาก `AutocompleteInput`
    const handlePlaceSelect = (index, place) => {
        if (place) {
            setInputs(prevInputs => {
                const newInputs = [...prevInputs];
                newInputs[index].text = place;
                return newInputs;
            });
        } else {
            console.warn(`⚠️ ไม่พบข้อมูลที่อยู่ของสถานที่ที่เลือก (Index: ${index})`);
        }
    };

    // ฟังก์ชันเพิ่มจุดแวะใหม่ (สูงสุด 5 จุด)
    const addInputSet = () => {
        if (inputs.length < 5) {
            setInputs([...inputs, { text: '', number: '' }]);
        } else {
            alert('ไม่สามารถเพิ่ม Input ได้มากกว่า 5 Set');
        }
    };

    // ฟังก์ชันลบจุดแวะ
    const removeInputSet = (index) => {
        setInputs(prevInputs => prevInputs.filter((_, i) => i !== index));
    };

    // สร้างตัวอักษร A, B, C, D, E ให้แต่ละตำแหน่ง
    const generateLabel = (index) => {
        return String.fromCharCode(65 + index);
    };

    return (
        <div className="container-input">
            {inputs.map((input, index) => (
                <div className="input-set" key={index}>
                    {/* แสดงตัวอักษรของตำแหน่ง (A, B, C, D, E) */}
                    <div className="label-container" data-label={generateLabel(index)}>
                        <span className="label">{generateLabel(index)}</span>
                    </div>

                    {/* AutocompleteInput สำหรับค้นหาสถานที่ */}
                    <AutocompleteInput key={index} index={index} onSelect={(idx, place) => handlePlaceSelect(idx, place)} />

                    {/* เลือกระยะเวลาที่ใช้ */}
                    <select
                        value={input.number}
                        onChange={(e) =>
                            setInputs(prevInputs => {
                                const newInputs = [...prevInputs];
                                newInputs[index].number = e.target.value;
                                return newInputs;
                            })
                        }
                    >
                        <option value="">ระยะเวลาที่ใช้</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>

                    {/* ปุ่มลบจุดแวะ */}
                    {inputs.length > 2 && (
                        <button className="remove-button" onClick={() => removeInputSet(index)}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    )}
                </div>
            ))}

            <div className="options-container">
                {/* ปุ่มเพิ่มจุดแวะ */}
                <button
                    className="add-button"
                    onClick={addInputSet}
                    disabled={inputs.length >= 5}
                >
                    + เพิ่มจุดแวะ
                </button>

                {/* Checkbox หลีกเลี่ยงค่าผ่านทาง */}
                <div className='checkbox-container'>
                    <input
                        type="checkbox"
                        id="avoid-tolls"
                        className="checkbox"
                        checked={avoidTolls}
                        onChange={(e) => setAvoidTolls(e.target.checked)}
                    />
                    <label htmlFor="avoid-tolls" className="checkbox-label">
                        หลีกเลี่ยงค่าผ่านทาง
                    </label>
                </div>
            </div>
        </div>
    );
}

export default DynamicInput;
