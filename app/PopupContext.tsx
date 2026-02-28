"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface Popup {
  id: string;
  message: string;
  isExiting: boolean;
}

interface PopupContextType {
  addPopup: (message: string) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [popups, setPopups] = useState<Popup[]>([]);

  const removePopup = useCallback((id: string) => {
    setPopups((prev) => {
      const exists = prev.find((p) => p.id === id);
      if (!exists || exists.isExiting) return prev;
      return prev.map((p) => (p.id === id ? { ...p, isExiting: true } : p));
    });

    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 300); // Match CSS animation duration
  }, []);

  const addPopup = useCallback((message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setPopups((prev) => [...prev, { id, message, isExiting: false }]);

    setTimeout(() => {
      removePopup(id);
    }, 5000);
  }, [removePopup]);

  useEffect(() => {
    const activePopups = popups.filter((p) => !p.isExiting);
    if (activePopups.length > 4) {
      const oldest = activePopups[0];
      removePopup(oldest.id);
    }
  }, [popups, removePopup]);

  return (
    <PopupContext.Provider value={{ addPopup }}>
      {children}
      <div className="popup-container">
        {popups.map((popup) => (
          <div
            key={popup.id}
            className={`popup-message ${popup.isExiting ? 'slide-out' : 'slide-in'}`}
          >
            {popup.message}
          </div>
        ))}
      </div>
    </PopupContext.Provider>
  );
};