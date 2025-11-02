import React, { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      
      const parsedItem = JSON.parse(item);

      // Add validation to handle incompatible data from older app versions.
      // The main 'dailyRecords' must be an array.
      if (key === 'dailyRecords' && !Array.isArray(parsedItem)) {
        console.warn('Incompatible data found in localStorage. Starting fresh.');
        return initialValue;
      }

      return parsedItem;
    } catch (error) {
      console.error('Error reading from localStorage, starting fresh.', error);
      // If parsing fails, data is corrupted. Reset to initial value.
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage.', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
