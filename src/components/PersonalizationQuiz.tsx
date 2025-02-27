'use client'

import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

type ChildInfo = {
  name: string;
  gender: string;
  age: string;
  ethnicity: string;
};

type FormData = {
  zipCode: string;
  income: string;
  country: string;
  children: ChildInfo[];
};

const PersonalizationQuiz = () => {
  const [formData, setFormData] = useState<FormData>({
    zipCode: '',
    income: '',
    country: '',
    children: [{ name: '', gender: '', age: '', ethnicity: '' }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleParentInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleChildInfoChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name.split('-')[1]; // Extract the field name (name, gender, age, ethnicity)
    
    setFormData(prevData => {
      const updatedChildren = [...prevData.children];
      updatedChildren[index] = {
        ...updatedChildren[index],
        [key]: value
      };
      
      return {
        ...prevData,
        children: updatedChildren
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Submitting form data:', formData);
      
      // Make the API call
      const response = await fetch('/api/save-family-data', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData) 
      });
      
      const result = await response.json();
      console.log('API response:', result);
      
      // Show success state
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="quiz-section" className="min-h-screen px-4 py-16 max-w-4xl mx-auto scroll-mt-28">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Personalization Quiz</h2>
          <p className="text-lg text-gray-600">Help us provide personalized guidance for your family&apos;s future</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Parent Information Section */}
          <div className="space-y-6">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold">Parent Information</h3>
              <div className="flex-grow ml-4 h-px bg-gray-200"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="zipCode" className="block text-sm font-medium">
                  Zip Code<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleParentInfoChange}
                  placeholder="Enter zip code"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="income" className="block text-sm font-medium">
                  Annual Household Income<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="income"
                    name="income"
                    value={formData.income}
                    onChange={handleParentInfoChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select income range</option>
                    <option value="<25k">Less than $25,000</option>
                    <option value="25-50k">$25,000 - $50,000</option>
                    <option value="50-75k">$50,000 - $75,000</option>
                    <option value="75-100k">$75,000 - $100,000</option>
                    <option value=">100k">More than $100,000</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FaChevronDown className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium">
                  Country of Origin (Optional)
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleParentInfoChange}
                  placeholder="Enter country"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {/* Child Information Section */}
          <div className="space-y-6">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold">Child Information</h3>
              <div className="flex-grow ml-4 h-px bg-gray-200"></div>
            </div>
            
            {formData.children.map((child, index) => (
              <div key={index} className="space-y-6">
                <h4 className="font-medium">Child {index + 1}</h4>
                
                <div className="space-y-2">
                  <label htmlFor={`child${index}-name`} className="block text-sm font-medium">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`child${index}-name`}
                    name={`child-name`}
                    value={child.name}
                    onChange={(e) => handleChildInfoChange(index, e)}
                    placeholder="Enter child's name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor={`child${index}-gender`} className="block text-sm font-medium">
                      Gender<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id={`child${index}-gender`}
                        name={`child-gender`}
                        value={child.gender}
                        onChange={(e) => handleChildInfoChange(index, e)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <FaChevronDown className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor={`child${index}-age`} className="block text-sm font-medium">
                      Age<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id={`child${index}-age`}
                      name={`child-age`}
                      value={child.age}
                      onChange={(e) => handleChildInfoChange(index, e)}
                      placeholder="Enter age"
                      min="0"
                      max="18"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor={`child${index}-ethnicity`} className="block text-sm font-medium">
                      Ethnicity<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id={`child${index}-ethnicity`}
                        name={`child-ethnicity`}
                        value={child.ethnicity}
                        onChange={(e) => handleChildInfoChange(index, e)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select ethnicity</option>
                        <option value="W">White</option>
                        <option value="B">Black</option>
                        <option value="H">Hispanic</option>
                        <option value="A">Asian</option>
                        <option value="NA">Native American</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <FaChevronDown className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Child Button */}
            <div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  children: [...prev.children, { name: '', gender: '', age: '', ethnicity: '' }]
                }))}
                className="text-primary hover:text-primary-dark font-medium"
              >
                + Add another child
              </button>
            </div>
          </div>
          
          {/* Submit Button with Success Checkmark */}
          <div className="flex justify-center mt-10">
            <div className="relative inline-flex items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-primary hover:bg-opacity-90 text-white py-3 px-12 rounded-full font-medium text-lg transition-all ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              
              {/* Success Checkmark */}
              {submitSuccess && (
                <div className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default PersonalizationQuiz;