'use client'
import { useState, createContext, useContext, ReactNode } from 'react';
import { FaChevronDown } from 'react-icons/fa';

// Define all the types we need
type ChildInfo = {
  name: string;
  gender: string;
  age: string;
  ethnicity: string;
};

export type AssessData = {
  address: string;
  income: string;
  country: string;
  children: ChildInfo[];
  opportunityScore?: number | null;
};

interface AssessContextType {
  data: AssessData;
  updateData: (data: Partial<AssessData>) => void;
  setFullData: (data: AssessData) => void;
}

// Initial default values
const defaultData: AssessData = {
  address: '',
  income: '',
  country: '',
  children: [],
  opportunityScore: null
};

const AssessContext = createContext<AssessContextType | undefined>(undefined);

export function AssessProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AssessData>(defaultData);

  const updateData = (newData: Partial<AssessData>) => {
    setData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const setFullData = (newData: AssessData) => {
    setData(newData);
  };

  return (
    <AssessContext.Provider value={{ data, updateData, setFullData }}>
      {children}
    </AssessContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessProvider');
  }
  return context;
}

// Alias for backward compatibility
export const usePersonalization = useAssessment;

// Alias for backward compatibility
export { AssessProvider as PersonalizationProvider };

const AssessYourCommunity = () => {
  const { setFullData } = useAssessment();
  
  // Initialize formData with ALL fields, including address
  const [formData, setFormData] = useState<AssessData>({
    address: '',
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
      
      // Save to context for use across the site
      setFullData(formData);
      
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
      setTimeout(() => setSubmitSuccess(false), 3000); // Show checkmark for 3 seconds
      
      // Scroll to the map section after a short delay to ensure data is processed
      setTimeout(() => {
        const mapSection = document.getElementById('opportunity-map');
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="quiz-section" className="min-h-screen px-4 py-16 max-w-4xl mx-auto scroll-mt-28">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Assess Your Community</h2>
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
                <label htmlFor="address" className="block text-sm font-medium">
                  Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleParentInfoChange}
                  placeholder="Enter your full address"
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
                    value={formData.income || ''}
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
                  value={formData.country || ''}
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
                    value={child.name || ''}
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
                        value={child.gender || ''}
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
                      value={child.age || ''}
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
                        value={child.ethnicity || ''}
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
          
          {/* No separate success message - using checkmark next to button */}
          
          {/* Submit Button */}
          <div className="flex justify-center mt-10">
            <div className="relative inline-flex items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-primary hover:bg-opacity-90 text-white py-3 px-12 rounded-full font-medium text-lg transition-all ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit'}
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
    </div>
  );
};

export default AssessYourCommunity;