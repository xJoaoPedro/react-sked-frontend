import { useRef, useEffect, ReactNode } from 'react';

interface CustomDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  width?: string;
  className?: string;
}

export function CustomDropdown({
  isOpen,
  onClose,
  trigger,
  children,
  align = 'right',
  width = '440px',
  className = '',
}: CustomDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {trigger}
      
      {isOpen && (
        <div 
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-3 bg-white rounded-md border border-border shadow-lg z-[100] animate-in fade-in slide-in-from-top-2 duration-200 ${className}`}
          style={{ width }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
