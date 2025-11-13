import React, { createContext, useContext, useState } from "react";

const BusinessModeContext = createContext({
  isBusinessMode: false,
  toggleMode: () => {},
});

export const BusinessModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isBusinessMode, setIsBusinessMode] = useState(false);

  const toggleMode = () => {
    setIsBusinessMode((prev) => !prev);
  };

  return (
    <BusinessModeContext.Provider value={{ isBusinessMode, toggleMode }}>
      {children}
    </BusinessModeContext.Provider>
  );
};

export const useBusinessMode = () => useContext(BusinessModeContext);
