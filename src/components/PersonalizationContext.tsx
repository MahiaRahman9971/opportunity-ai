'use client'
import { createContext, useContext, useState, ReactNode } from 'react';

// Define all the types we need
type ChildInfo = {
  name: string;
  gender: string;
  age: string;
  ethnicity: string;
};

export type PersonalizationData = {
    address: string;
    income: string;
    country: string;
    children: ChildInfo[];
  };

interface PersonalizationContextType {
  data: PersonalizationData;
  updateData: (data: Partial<PersonalizationData>) => void;
  setFullData: (data: PersonalizationData) => void;
}

// Initial default values
const defaultData: PersonalizationData = {
  zipCode: '',
  income: '',
  country: '',
  children: []
};

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersonalizationData>(defaultData);

  const updateData = (newData: Partial<PersonalizationData>) => {
    setData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const setFullData = (newData: PersonalizationData) => {
    setData(newData);
  };

  return (
    <PersonalizationContext.Provider value={{ data, updateData, setFullData }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}