import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontScale = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  toggleHighContrast: () => void;
  lowBandwidth: boolean;
  setLowBandwidth: (enabled: boolean) => void;
  toggleLowBandwidth: () => void;
  announcement: string;
  announce: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScale] = useState<FontScale>(() => {
    return (localStorage.getItem('edureach_font_scale') as FontScale) || 'normal';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('edureach_high_contrast') === 'true';
  });

  const [lowBandwidth, setLowBandwidth] = useState<boolean>(() => {
    return localStorage.getItem('edureach_low_bandwidth') === 'true';
  });

  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    const root = document.documentElement;

    // Apply font scale class
    root.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    root.classList.add(`font-scale-${fontScale}`);
    localStorage.setItem('edureach_font_scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('edureach_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (lowBandwidth) {
      root.classList.add('low-bandwidth');
    } else {
      root.classList.remove('low-bandwidth');
    }
    localStorage.setItem('edureach_low_bandwidth', String(lowBandwidth));
  }, [lowBandwidth]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleLowBandwidth = () => setLowBandwidth(prev => !prev);

  const announce = (message: string) => {
    setAnnouncement(message);
    // Clear after aria reader has caught it
    setTimeout(() => setAnnouncement(''), 3000);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        setFontScale,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        lowBandwidth,
        setLowBandwidth,
        toggleLowBandwidth,
        announcement,
        announce
      }}
    >
      {/* Live Screen Reader Announcement Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

