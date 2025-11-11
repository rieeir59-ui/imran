"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { allData as initialData, Property, CommercialProperty, ResidentialProperty, HotelProperty, BankBranch } from '@/lib/data';

type AllData = {
  commercial: CommercialProperty[];
  residential: ResidentialProperty[];
  hotel: HotelProperty[];
  bank: BankBranch[];
};

type DataContextType = {
  data: AllData;
  addData: (category: keyof AllData, item: Property) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AllData>(initialData);

  const addData = (category: keyof AllData, item: Property) => {
    setData((prevData) => {
      const newId = `${category.charAt(0).toUpperCase()}${(prevData[category].length + 1).toString().padStart(3, '0')}`;
      const newItem = { ...item, id: newId };

      return {
        ...prevData,
        [category]: [...prevData[category], newItem],
      };
    });
  };

  return (
    <DataContext.Provider value={{ data, addData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
