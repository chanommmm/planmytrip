// src/components/DynamicInput.jsx
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';            // <– ติดตั้งด้วย:  npm i uuid
import './DynamicInput.css';
import AutocompleteInput from './AutocompleteInput';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useTranslation } from 'react-i18next';

export default function DynamicInput({ onDataChange }) {
  // ──────────────────────────────────────────────
  // state หลัก
  // ──────────────────────────────────────────────
  const [inputs, setInputs] = useState([
    { id: uuidv4(), text: '', number: '', locked: false },
    { id: uuidv4(), text: '', number: '', locked: false },
  ]);
  const [avoidTolls, setAvoidTolls] = useState(false);

  const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
  };

  // ส่งข้อมูลขึ้นไปให้ parent ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    onDataChange({ inputs, avoidTolls });
  }, [inputs, avoidTolls, onDataChange]);


  // ──────────────────────────────────────────────
  // handlers
  // ──────────────────────────────────────────────
  const handlePlaceSelect = (idx, place) => {
    if (!place) return;
    setInputs(prev => {
      const updated = prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              text: place.text,
              lat: place.lat,
              lng: place.lng,
              placeId: place.placeId,
              name: place.name,
            }
          : item
      );
      return assignPositions(updated); 
    });
  };


  const assignPositions = inputs =>
  inputs.map((item, index) => ({
    ...item,
    position: index, 
  }));


  const addInputSet = () => {
    if (inputs.length >= 10) return alert(t('alert5'));
    const updated = [...inputs, { id: uuidv4(), text: '', number: '', locked: false }];
    setInputs(assignPositions(updated)); 
  };

 const removeInputSet = id => {
    if (inputs.length <= 2) return;
    const updated = inputs.filter(item => item.id !== id);
    setInputs(assignPositions(updated)); 
  };


  const toggleLock = idx => {
  if (idx === 0) return; // ห้ามล็อกตำแหน่งแรก
  const ok = window.confirm(
    inputs[idx].locked
      // ? `ปลดล็อกตำแหน่ง ${label(idx)} หรือไม่?`
      // : `ล็อกตำแหน่ง ${label(idx)} ไว้ที่ลำดับนี้หรือไม่?`
      ? t('unlockConfirm', { label: label(idx) })
      : t('lockConfirm', { label: label(idx) })
  );
  if (ok)
    setInputs(prev =>
      prev.map((item, i) => (i === idx ? { ...item, locked: !item.locked } : item))
    );
  };


  // helper สร้างตัวอักษร A-B-C-…
  const label = i => String.fromCharCode(65 + i);

  // ──────────────────────────────────────────────
  // UI
  // ──────────────────────────────────────────────
  return (
    <div className="container-input">
      {inputs.map((input, index) => (
        <div className="input-set" key={input.id}>
          {/* ไอคอนล็อก */}
          <div className="lock-icon-container">
              <i
                className={`bi ${input.locked ? 'bi-lock' : 'bi-lock-open'}`}
                title={input.locked ? t('unlockPosition') : t('lockPosition')}
                onClick={() => toggleLock(index)}
              /> 
          </div>

          {/* วงกลม A/B/C/... */}
          <div
            className={`label-container ${input.locked ? 'locked' : ''}`}
            onClick={() => index > 0 && toggleLock(index)} // ป้องกันคลิกตำแหน่งแรก
            data-label={label(index)}
          >
            <span className="label">{label(index)}</span>
            {index > 0 && <span className="tooltiptext">{t('tooltip')}</span>}
          </div>


          <div className="input-wrap">
            {/* AutocompleteInput */}
            <div className={`autocomplete-wrapper ${index <= 1 ? 'wide-input' : ''}`}>
              <AutocompleteInput
                key={input.id}          // ใช้ id คงที่
                index={index}
                onSelect={handlePlaceSelect}
              />
            </div>

            {/* เวลาอยู่ (ชั่วโมง) */}
            {index === 0 ? (
              <input type="hidden" value="0" />
            ) : (
              <select
                value={input.number}
                onChange={e =>
                  setInputs(prev =>
                    prev.map((item, i) =>
                      i === index ? { ...item, number: e.target.value } : item
                    )
                  )
                }
              >
                <option value="">{t('duration')}</option>
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>
                    {n} {t('hourUnit')}
                  </option>
                ))}
              </select>
            )}

            {/* <select
              value={input.number}
              onChange={e =>
                setInputs(prev =>
                  prev.map((item, i) => (i === index ? { ...item, number: e.target.value } : item))
                )
              }
            >
              <option value="">ระยะเวลาที่ใช้</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select> */}
          </div>

          {/* ปุ่มลบ */}
          {inputs.length > 2 && (
            <button className="remove-button" onClick={() => removeInputSet(input.id)}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
      ))}

      {/* ปุ่มเพิ่ม & checkbox หลีกเลี่ยงค่าผ่านทาง */}
      <div className="options-container">
        <button className="add-button" onClick={addInputSet} disabled={inputs.length >= 10}>
          {t('add_btn')}
        </button>

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="avoid-tolls"
            className="checkbox"
            checked={avoidTolls}
            onChange={e => setAvoidTolls(e.target.checked)}
          />
          <label htmlFor="avoid-tolls" className="checkbox-label">
            {t('avoidtolls')}
          </label>
        </div>
      </div>
    </div>
  );
} 