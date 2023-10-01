import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { parse, isBefore } from 'date-fns';
import { useTranslation } from 'react-i18next';

import LanguageDropdown from './LanguageDropdown'; 

import './styles/form.css';

import { Audio } from  'react-loader-spinner';


import backgroundImg from './res/monkeys.jpg';


function DynamicMultiStepForm({ data }) {
  // naša polja
  const fields = data.fields;

  const [userData, setUserData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {t, i18n}=useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Function to change the language
  };

  const formContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '20px',
    border: '1px solid #ccc',
    backgroundImage: `url(${backgroundImg})`, // Set the background image using inline style
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  };


  // organiziranje polja po koracima
  const steps = {};
  fields.forEach((field) => {
    if (!steps[field.step]) {
      steps[field.step] = [];
    }
    steps[field.step].push(field);
  });

  // Initialize form step state
  const [currentStep, setCurrentStep] = useState(1);

  // definiranje inicijalnih vrijednosti
  const initialValues = {};
  fields.forEach((field) => {
    initialValues[field.code] = field.defaultValue || '';
  });

  // validation schema od polja
  const validationSchema = Yup.object().shape(
    fields.reduce((acc, field) => {
      let fieldSchema = Yup.string();

      if (field.required) {
      fieldSchema = fieldSchema.required(t('required_field'));
      };
      
      field.validators.forEach((validator) => {
        switch (validator.key) {
          case 'minLength':
            fieldSchema = fieldSchema.min(
              validator.parameters.targetLength,
              validator.invalid_message
            );
            break;
          case 'maxLength':
            fieldSchema = fieldSchema.max(
              validator.parameters.targetLength,
              validator.invalid_message
            );
            break;
          case 'emailValidator':
            fieldSchema = fieldSchema.email(validator.invalid_message);
            break;
          case 'regex':
            fieldSchema = fieldSchema.matches(
            new RegExp(validator.parameters.regex, validator.parameters.modifiers),
            validator.invalid_message
            );
            break;
          case 'passwordStrength':
          fieldSchema = fieldSchema.matches(
            new RegExp(validator.parameters.regex),
            validator.invalid_message
          );  
          break;
          case 'matchesField':
          fieldSchema = fieldSchema.test(
            'fieldMatch',
            validator.invalid_message,
            function (value) {
              return value === this.parent[validator.parameters.target];
            }
          );
          break;  
          case 'olderThan':
          fieldSchema = fieldSchema.test(
            'birthdate',
            validator.invalid_message,
            function (value) {
              // Parse the birthdate string into a Date object
              const birthdate = parse(value, 'yyyy-MM-dd', new Date());
              
              // Calculate the minimum allowed birthdate based on the provided age
              const minBirthdate = new Date();
              minBirthdate.setFullYear(minBirthdate.getFullYear() - validator.parameters.age);
              
              // Check if the birthdate is before the minimum allowed birthdate
              return isBefore(birthdate, minBirthdate);
            }
          );
          break;
          
          //dodati jos validatora po potrebi
          default:
          break;
        }
      });
      return {
        ...acc,
        [field.code]: fieldSchema,
      };
    }, {})
  );

  // kreiranje formik forme na temelju inicijalnih vrijednosti i validacijske scheme
  // const formik = useFormik({
  //   initialValues,
  //   validationSchema,
  //   onSubmit: async(values) => {

  //     setIsSubmitting(true);

  //     await new Promise((resolve)=>setTimeout(resolve, 1000)); 

  //     // Handle form submission
  //     console.log('Form data submitted:', values);
  //     setUserData([...userData, values]);
  //     formik.resetForm();
  //   },
  // });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      setIsSubmitting(true);
  
      // Simulate an API call with a setTimeout
      setTimeout(() => {
        // Handle form submission after the timeout (you can replace this with your actual API call)
        console.log('Form data submitted:', values);
  
        // Reset the form and hide the loading spinner
        setUserData([...userData, values]);
        formik.resetForm();
        setIsSubmitting(false);
      }, 1000); // Adjust the timeout duration as needed
    },
  });

  //renderanje formi


  const renderFormFields = () => {
    if (steps[currentStep]) {
      return steps[currentStep].map((field) => (
        <div key={field.code} className="form-field">
          {field.fieldType === 'dropdown' ? (
            <div>
              <label htmlFor={field.code} className="monkey-label">
                {t(`translation.${field.code}.label`)}
              </label>
              <select
                name={field.code}
                value={formik.values[field.code]}
                onChange={formik.handleChange}
                className="form-input"
              >
                <option value="">{t('translation.select')}</option>
                {field.valueList.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(`translation.${field.code}.${option.value}`)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor={field.code} className="monkey-label">
                {t(`translation.${field.code}`)}
              </label>
              <input
                type={field.fieldType}
                name={field.code}
                value={formik.values[field.code]}
                onChange={formik.handleChange}
                className="form-input"
              />
            </div>
          )}
          {formik.touched[field.code] && formik.errors[field.code] ? (
             <div className="error">{t(`translation.${formik.errors[field.code]}`)}</div>
          ) : null}
        </div>
      ));
    }
    return null;
  };
  
  

 
  const nextStep = () => {
    formik.validateForm().then((errors) => {
      // Check if there are validation errors in the current step
      const currentStepFields = steps[currentStep];
      if (currentStepFields) {
        const stepErrors = currentStepFields.map((field) => errors[field.code]);
        
        if (stepErrors.some(Boolean)) {
          // Display error messages for fields with errors in the current step
          alert('Please correct the errors before proceeding.');
          formik.setTouched(
            currentStepFields.reduce((acc, field) => ({ ...acc, [field.code]: true }), {})
          );
          return;
        }
      }
  
      // Proceed to the next step
      setCurrentStep(currentStep + 1);
    });
  };

 
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateAndSubmit = () => {
    formik.validateForm().then((errors) => {
      // Check if there are validation errors in the current step
      const currentStepFields = steps[currentStep];
      if (currentStepFields) {
        const stepErrors = currentStepFields.map((field) => errors[field.code]);

        if (stepErrors.some(Boolean)) {
          // Display error messages for fields with errors in the current step
          alert('Please correct the errors before submitting.');
          formik.setTouched(
            currentStepFields.reduce((acc, field) => ({ ...acc, [field.code]: true }), {})
          );
        } else if (
          currentStepFields.some((field) => field.required && !formik.values[field.code])
        ) {
          // Display an alert for empty required fields
          alert('Please fill in all required fields before submitting.');
        } else {
          // Submit the form when there are no errors
          formik.handleSubmit();
        }
      }
    });
  }
  return (

    <div style={formContainerStyle} className="form-container">
      <LanguageDropdown changeLanguage={changeLanguage}/>
      <h1 className="form-title">IGP frontend taks: Form step:{currentStep}</h1>
      <form onSubmit={formik.handleSubmit}>
      
      <div className="form-field">
        {renderFormFields()}
      </div>
        <div className="button-container">  
          {/* Show loader while submitting */}
          {isSubmitting ? (
            <Audio
            height = "80"
            width = "80"
            radius = "9"
            color = 'green'
            ariaLabel = 'three-dots-loading'     
            wrapperStyle
            wrapperClass
          />
          ) : (
            <>
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="monkey-button">
                  Previous
                </button>
              )}
              {currentStep < Object.keys(steps).length && (
                <button type="button" onClick={nextStep} className="monkey-button">
                  Next
                </button>
              )}
              {currentStep === Object.keys(steps).length && (
                <button type="button" onClick={validateAndSubmit} className="monkey-button">
                  Submit
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
   
  );

            



}

export default DynamicMultiStepForm;
