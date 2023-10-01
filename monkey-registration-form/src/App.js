import React from 'react';
import DynamicMultiStepForm from './DynamicMultiStepForm'; // Adjust the import path

import sampleData from './sampleData.json';

import { I18nextProvider } from 'react-i18next';
import i18n from './i18n.js';



function App() {
  return (
    <I18nextProvider i18n={i18n}>
    <div>
      <DynamicMultiStepForm data={sampleData} />
    </div>
    </I18nextProvider>
  );
}

export default App;