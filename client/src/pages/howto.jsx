import React from "react";
import "./howto.css";
import Footer from "../components/Footer";
import { HeaderHowto } from "../components/Header";
import { useTranslation } from 'react-i18next';

const Howto = () => {
  const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
  };

  const steps = [
    {
      id: 1,
      title: t('step1'),
      desc: t('step_desc1'),
      img: "step1-Copy.png",
      reverse: false,
    },
    {
      id: 2,
      title: t('step2'),
      desc: t('step_desc2'),
      img: "Step2.png",
      reverse: true,
    },
    {
      id: 3,
      title: t('step3'),
      desc: t('step_desc3'),
      img: "Step3.png",
      reverse: false,
    },
    {
      id: 4,
      title: t('step4'),
      desc: t('step_desc4'),
      img: "Step4.png",
      reverse: true,
    },
  ];
 
  return (
    <>
      <HeaderHowto />

      <div className="how-to-section">
        <h2 className="section-title">{t('how_to_use')}</h2>
        {steps.map(step => (
          <div key={step.id} className="step-card">
            <div className={`step-row ${step.reverse ? 'reverse' : ''}`}>
              <div className="step-image">
                <img src={step.img} alt={`Step ${step.id}`} />
              </div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
};

export default Howto;
