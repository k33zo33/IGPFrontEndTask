// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json'; // Your English translation file
import hrTranslation from './locales/hr.json'; // Your Croatian translation file

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      hr: { translation: hrTranslation },
      // Add more languages as needed
    },
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n;
