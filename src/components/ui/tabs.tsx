'use client';

import * as React from 'react';
import { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange,
  className = '', 
  children, 
  ...props 
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const activeTab = value !== undefined ? value : internalValue;
  
  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabsList({ className = '', children, ...props }: TabsListProps) {
  return (
    <div
      className={`flex space-x-1 bg-metallic-800/50 p-1 rounded-lg border border-metallic-700/50 ${className}`}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ 
  value, 
  className = '', 
  children, 
  ...props 
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={`
        px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
        ${isActive 
          ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30' 
          : 'text-metallic-400 hover:text-metallic-200 hover:bg-metallic-700/50'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ 
  value, 
  className = '', 
  children, 
  ...props 
}: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={`mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
