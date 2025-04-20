import React, { useState, useEffect, useRef } from 'react';
import * as Select from '@radix-ui/react-select';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: Option[];
  selectedValues?: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxDisplayItems?: number;
  error?: string;
  required?: boolean;
  label?: string;
  name?: string;
  id?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues = [],
  onChange,
  placeholder = 'Select options...',
  disabled = false,
  className = '',
  maxDisplayItems = 3,
  error,
  required = false,
  label,
  name,
  id,
}) => {
  const theme = useDirectTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedOption, setFocusedOption] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  // Handle selection toggling
  const handleToggleOption = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    onChange(newValues);
  };

  // Clear search when closing dropdown
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = focusedOption 
            ? filteredOptions.findIndex(o => o.value === focusedOption) 
            : -1;
          const nextIndex = currentIndex < filteredOptions.length - 1 ? currentIndex + 1 : 0;
          setFocusedOption(filteredOptions[nextIndex]?.value || null);
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          const currentIndex = focusedOption 
            ? filteredOptions.findIndex(o => o.value === focusedOption) 
            : filteredOptions.length;
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredOptions.length - 1;
          setFocusedOption(filteredOptions[prevIndex]?.value || null);
        }
        break;
      
      case 'Enter':
        if (isOpen && focusedOption) {
          e.preventDefault();
          handleToggleOption(focusedOption);
        }
        break;
      
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;
      
      case ' ': // Space key
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;
      
      default:
        break;
    }
  };

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine what to display in the trigger
  const displaySelectedItems = () => {
    if (selectedValues.length === 0) return placeholder;
    
    const selectedLabels = selectedValues
      .map(value => options.find(option => option.value === value)?.label || value);
    
    if (selectedLabels.length <= maxDisplayItems) {
      return selectedLabels.join(', ');
    }
    
    return `${selectedLabels.slice(0, maxDisplayItems).join(', ')} +${selectedLabels.length - maxDisplayItems} more`;
  };

  const selectedItemsCount = selectedValues.length;

  const selectTriggerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.getSpacing('sm'),
    borderRadius: theme.getBorderRadius('md'),
    fontSize: theme.getTypography('fontSize.md'),
    minHeight: '40px',
    backgroundColor: theme.getColor('colors.background'),
    border: `1px solid ${error ? theme.getColor('colors.error') : theme.getColor('colors.border')}`,
    color: theme.getColor('colors.text'),
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: '100%',
    opacity: disabled ? 0.6 : 1,
  };

  const contentStyle = {
    backgroundColor: theme.getColor('colors.background'),
    borderRadius: theme.getBorderRadius('md'),
    boxShadow: theme.getShadow('md'),
    maxHeight: '300px',
    overflow: 'auto',
    marginTop: '4px',
    width: containerRef.current?.offsetWidth || 300,
    border: `1px solid ${theme.getColor('colors.border')}`,
    zIndex: 1000,
  };

  const searchInputStyle = {
    width: '100%',
    padding: theme.getSpacing('sm'),
    border: `1px solid ${theme.getColor('colors.border')}`,
    borderRadius: theme.getBorderRadius('sm'),
    marginBottom: theme.getSpacing('xs'),
    fontSize: theme.getTypography('fontSize.sm'),
  };

  const optionStyle = (isSelected: boolean, isFocused: boolean) => ({
    padding: theme.getSpacing('sm'),
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: isFocused ? theme.getColor('colors.hover') : isSelected ? theme.getColor('colors.primary') + '20' : 'transparent',
    color: isSelected ? theme.getColor('colors.primary') : theme.getColor('colors.text'),
    '&:hover': {
      backgroundColor: theme.getColor('colors.hover'),
    },
  });

  return (
    <div 
      ref={containerRef}
      className={className} 
      style={{ width: '100%', position: 'relative' }}
    >
      {label && (
        <label 
          htmlFor={id || name} 
          style={{ 
            display: 'block', 
            marginBottom: theme.getSpacing('xs'),
            fontWeight: 500,
            color: theme.getColor('colors.text')
          }}
        >
          {label}
          {required && <span style={{ color: theme.getColor('colors.error') }}> *</span>}
        </label>
      )}
      
      <div
        style={selectTriggerStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-required={required}
        aria-invalid={!!error}
        aria-labelledby={label ? `${id || name}-label` : undefined}
        id={id || name}
      >
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {displaySelectedItems()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {selectedItemsCount > 0 && (
            <span 
              style={{ 
                marginRight: theme.getSpacing('xs'),
                backgroundColor: theme.getColor('colors.primary'),
                color: theme.getColor('colors.white', '#FFFFFF'),
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}
            >
              {selectedItemsCount}
            </span>
          )}
          <span 
            style={{ 
              transform: `rotate(${isOpen ? '180deg' : '0deg'})`,
              transition: 'transform 0.2s',
            }}
          >
            ▼
          </span>
        </div>
      </div>
      
      {error && (
        <div style={{ color: theme.getColor('colors.error'), fontSize: theme.getTypography('fontSize.sm'), marginTop: theme.getSpacing('xs') }}>
          {error}
        </div>
      )}
      
      {isOpen && (
        <div
          style={{
            ...contentStyle,
            position: 'absolute',
            left: 0,
            top: '100%', 
            width: '100%',
          }}
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
            onKeyDown={handleKeyDown}
          />
          
          <div role="listbox" aria-multiselectable="true">
            {filteredOptions.length === 0 ? (
              <div style={{ padding: theme.getSpacing('sm'), color: theme.getColor('colors.textMuted', '#999') }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={selectedValues.includes(option.value)}
                  tabIndex={-1}
                  style={optionStyle(
                    selectedValues.includes(option.value),
                    focusedOption === option.value
                  ) as React.CSSProperties}
                  onClick={() => {
                    handleToggleOption(option.value);
                    setFocusedOption(option.value);
                  }}
                  onMouseEnter={() => setFocusedOption(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleOption(option.value);
                    }
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: `1px solid ${selectedValues.includes(option.value) ? theme.getColor('colors.primary') : theme.getColor('colors.border')}`,
                      backgroundColor: selectedValues.includes(option.value) ? theme.getColor('colors.primary') : 'transparent',
                      borderRadius: '3px',
                      marginRight: theme.getSpacing('sm'),
                      position: 'relative',
                    }}
                  >
                    {selectedValues.includes(option.value) && (
                      <span 
                        style={{
                          position: 'absolute',
                          top: '1px',
                          left: '3px',
                          color: theme.getColor('colors.white', '#FFFFFF'),
                          fontSize: '10px',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 