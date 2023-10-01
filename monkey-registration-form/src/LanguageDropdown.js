import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageDropdown = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="language-dropdown">
      <select onChange={(e) => changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="hr">Croatian</option>
        {/* Add more language options as needed */}
      </select>
    </div>
  );
};

export default LanguageDropdown;
