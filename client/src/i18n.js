import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import th from './locales/th.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      th: { translation: th },
    },
    lng: 'th', // ภาษาเริ่มต้น
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // React มีการ escape ให้อยู่แล้ว
    },
  });

export default i18n;
