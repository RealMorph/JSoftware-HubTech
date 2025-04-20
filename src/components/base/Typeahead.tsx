import React, { useState, useRef, useEffect, useMemo, KeyboardEvent } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';
import debounce from 'lodash/debounce';

interface TypeaheadOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
}

interface TypeaheadProps {
  /** Options to display */
  options: TypeaheadOption[];
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Minimum characters before showing suggestions */
  minChars?: number;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Whether to highlight matching text */
  highlightMatch?: boolean;
  /** Custom filter function */
  filterOption?: (option: TypeaheadOption, inputValue: string) => boolean;
  /** Async function to fetch options */
  loadOptions?: (inputValue: string) => Promise<TypeaheadOption[]>;
  /** Custom option render function */
  renderOption?: (option: TypeaheadOption, inputValue: string) => React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

interface ThemeStyles {
  colors: {
    primary: string;
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    hover: {
      background: string;
      border: string;
    };
    focus: {
      border: string;
      shadow: string;
    };
  };
  typography: {
    fontSize: {
      sm: string;
      md: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
    };
    lineHeight: {
      normal: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
  };
  borderRadius: {
    sm: string;
    md: string;
  };
  shadows: {
    sm: string;
    md: string;
  };
  transitions: {
    fast: string;
    normal: string;
  };
}

const Container = styled.div<{ $themeStyles: ThemeStyles; hasError?: boolean }>`
  position: relative;
  width: 100%;
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};
`;

const Input = styled.input<{ $themeStyles: ThemeStyles; hasError?: boolean; disabled?: boolean }>`
  width: 100%;
  padding: ${props => props.$themeStyles.spacing.sm};
  background: ${props => props.disabled ? props.$themeStyles.colors.background : props.$themeStyles.colors.surface || '#ffffff'};
  border: 1px solid ${props => 
    props.hasError ? 'red' : props.$themeStyles.colors.border || '#c3c6d4'
  };
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
  color: ${props => props.disabled ? props.$themeStyles.colors.text.disabled || '#ccc' : props.$themeStyles.colors.text.primary || '#323338'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};
  transition: all ${props => props.$themeStyles.transitions.fast};

  &:hover {
    border-color: ${props => !props.disabled && (props.$themeStyles.colors.hover.border || props.$themeStyles.colors.primary || '#0073ea')};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.$themeStyles.colors.focus.border || props.$themeStyles.colors.primary || '#0073ea'};
    box-shadow: ${props => props.$themeStyles.shadows.sm};
  }

  &::placeholder {
    color: ${props => props.$themeStyles.colors.text.secondary || '#676879'};
  }
`;

const Dropdown = styled.ul<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: ${props => props.$themeStyles.spacing.xs};
  padding: 0;
  list-style: none;
  background: ${props => props.$themeStyles.colors.surface || '#ffffff'};
  border: 1px solid ${props => props.$themeStyles.colors.border || '#c3c6d4'};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  box-shadow: ${props => props.$themeStyles.shadows.md};
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};
`;

const Option = styled.li<{ $themeStyles: ThemeStyles; isHighlighted: boolean }>`
  padding: ${props => props.$themeStyles.spacing.sm};
  background: ${props => props.isHighlighted ? (props.$themeStyles.colors.hover.background || 'rgba(0, 0, 0, 0.04)') : 'transparent'};
  cursor: pointer;
  transition: background ${props => props.$themeStyles.transitions.fast};
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};

  &:hover {
    background: ${props => props.$themeStyles.colors.hover.background || 'rgba(0, 0, 0, 0.04)'};
  }
`;

const OptionContent = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing.xs};
`;

const OptionLabel = styled.span<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
`;

const OptionDescription = styled.span<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.secondary || '#676879'};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
`;

const HelperText = styled.div<{ $themeStyles: ThemeStyles; error?: boolean }>`
  margin-top: ${props => props.$themeStyles.spacing.xs};
  color: ${props => props.error ? 'red' : props.$themeStyles.colors.text.secondary || '#676879'};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
`;

const LoadingSpinner = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.sm};
  text-align: center;
  color: ${props => props.$themeStyles.colors.text.secondary || '#676879'};
`;

const createThemeStyles = (theme: DirectThemeContextType): ThemeStyles => ({
  colors: {
    primary: theme.getColor('colors.primary'),
    background: theme.getColor('colors.background'),
    surface: theme.getColor('colors.surface'),
    border: theme.getColor('colors.border'),
    text: {
      primary: theme.getColor('colors.text.primary'),
      secondary: theme.getColor('colors.text.secondary'),
      disabled: theme.getColor('colors.text.disabled', '#ccc'),
    },
    hover: {
      background: theme.getColor('colors.hover.background', 'rgba(0, 0, 0, 0.04)'),
      border: theme.getColor('colors.hover.border', theme.getColor('colors.primary')),
    },
    focus: {
      border: theme.getColor('colors.focus.border', theme.getColor('colors.primary')),
      shadow: theme.getColor('colors.focus.shadow', '0 0 0 2px rgba(0, 123, 255, 0.25)'),
    },
  },
  typography: {
    fontSize: {
      sm: theme.getTypography('fontSize.sm') as string,
      md: theme.getTypography('fontSize.md') as string,
    },
    fontWeight: {
      normal: theme.getTypography('fontWeight.normal') as number,
      medium: theme.getTypography('fontWeight.medium') as number,
    },
    lineHeight: {
      normal: theme.getTypography('lineHeight.normal') as number,
    },
  },
  spacing: {
    xs: theme.getSpacing('xs'),
    sm: theme.getSpacing('sm'),
    md: theme.getSpacing('md'),
  },
  borderRadius: {
    sm: theme.getBorderRadius('sm'),
    md: theme.getBorderRadius('md'),
  },
  shadows: {
    sm: theme.getShadow('sm'),
    md: theme.getShadow('md'),
  },
  transitions: {
    fast: theme.getTransition('fast', '150ms'),
    normal: theme.getTransition('normal', '300ms'),
  },
});

export const Typeahead: React.FC<TypeaheadProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Type to search...',
  disabled = false,
  error,
  helperText,
  minChars = 1,
  debounceMs = 300,
  highlightMatch = true,
  filterOption,
  loadOptions,
  renderOption,
  className,
  style,
}) => {
  const theme = useDirectTheme();
  const themeStyles = useMemo(() => createThemeStyles(theme), [theme]);
  
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState<TypeaheadOption[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Initialize input value from selected value
  useEffect(() => {
    if (value) {
      const selectedOption = [...options, ...asyncOptions].find(opt => opt.value === value);
      if (selectedOption) {
        setInputValue(selectedOption.label);
      }
    }
  }, [value, options, asyncOptions]);

  // Debounced options loading
  const debouncedLoadOptions = useMemo(
    () =>
      debounce(async (input: string) => {
        if (loadOptions) {
          setLoading(true);
          try {
            const results = await loadOptions(input);
            setAsyncOptions(results);
            // Reset highlighted index when options change
            setHighlightedIndex(results.length > 0 ? 0 : -1);
          } catch (error) {
            console.error('Error loading options:', error);
            setAsyncOptions([]);
            setHighlightedIndex(-1);
          }
          setLoading(false);
        }
      }, debounceMs),
    [loadOptions, debounceMs]
  );

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    if (loadOptions) {
      return asyncOptions;
    }

    if (!inputValue || inputValue.length < minChars) {
      return [];
    }

    const filtered = options.filter(option =>
      filterOption
        ? filterOption(option, inputValue)
        : option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    // Update highlighted index when options change
    if (isOpen && filtered.length > 0 && highlightedIndex >= filtered.length) {
      setHighlightedIndex(0);
    }
    
    return filtered;
  }, [options, inputValue, minChars, filterOption, loadOptions, asyncOptions, isOpen, highlightedIndex]);

  // Update option refs when the list changes
  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, filteredOptions.length);
    while (optionRefs.current.length < filteredOptions.length) {
      optionRefs.current.push(null);
    }
  }, [filteredOptions.length]);

  // Set the option reference
  const setOptionRef = (index: number) => (el: HTMLLIElement | null) => {
    optionRefs.current[index] = el;
  };

  // Scroll to highlighted option
  useEffect(() => {
    if (isOpen && !loading && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
      const option = optionRefs.current[highlightedIndex];
      const container = dropdownRef.current;
      
      if (option && container) {
        const optionTop = option.offsetTop;
        const optionBottom = optionTop + option.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.offsetHeight;

        if (optionTop < containerTop) {
          container.scrollTop = optionTop;
        } else if (optionBottom > containerBottom) {
          container.scrollTop = optionBottom - container.offsetHeight;
        }
      }
    }
  }, [highlightedIndex, isOpen, loading, filteredOptions.length]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    if (newValue.length >= minChars) {
      setIsOpen(true);
      if (loadOptions) {
        debouncedLoadOptions(newValue);
      } else if (filteredOptions.length > 0) {
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(-1);
      }
    } else {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
    
    // If the input is cleared, also clear the selected value
    if (newValue === '') {
      onChange('');
    }
  };

  const handleOptionClick = (option: TypeaheadOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    const keyHandlers: Record<string, () => void> = {
      ArrowDown: () => {
        if (!isOpen) {
          setIsOpen(true);
          if (filteredOptions.length > 0) {
            setHighlightedIndex(0);
          }
        } else if (filteredOptions.length > 0) {
          setHighlightedIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            return nextIndex >= filteredOptions.length ? 0 : nextIndex;
          });
        }
        event.preventDefault();
      },
      ArrowUp: () => {
        if (!isOpen) {
          setIsOpen(true);
          if (filteredOptions.length > 0) {
            setHighlightedIndex(filteredOptions.length - 1);
          }
        } else if (filteredOptions.length > 0) {
          setHighlightedIndex((prevIndex) => {
            const nextIndex = prevIndex - 1;
            return nextIndex < 0 ? filteredOptions.length - 1 : nextIndex;
          });
        }
        event.preventDefault();
      },
      Enter: () => {
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[highlightedIndex]);
          event.preventDefault();
        }
      },
      Escape: () => {
        if (isOpen) {
          setIsOpen(false);
          setHighlightedIndex(-1);
          event.preventDefault();
        }
      },
      Tab: () => {
        if (isOpen) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      },
    };

    const handler = keyHandlers[event.key];
    if (handler) {
      handler();
    }
  };

  const handleInputFocus = () => {
    if (inputValue.length >= minChars && filteredOptions.length > 0) {
      setIsOpen(true);
      setHighlightedIndex(0);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!highlightMatch || !query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index}>{part}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <Container 
      ref={containerRef} 
      $themeStyles={themeStyles} 
      hasError={!!error} 
      className={className} 
      style={style}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-owns={isOpen ? "typeahead-options" : undefined}
    >
      <Input
        ref={inputRef}
        $themeStyles={themeStyles}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        disabled={disabled}
        hasError={!!error}
        aria-autocomplete="list"
        aria-controls={isOpen ? "typeahead-options" : undefined}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0 ? `typeahead-option-${highlightedIndex}` : undefined
        }
        aria-labelledby={placeholder ? "typeahead-label" : undefined}
      />
      
      {placeholder && (
        <span id="typeahead-label" style={{ display: 'none' }}>
          {placeholder}
        </span>
      )}

      {isOpen && (filteredOptions.length > 0 || loading) && (
        <Dropdown 
          ref={dropdownRef}
          $themeStyles={themeStyles}
          id="typeahead-options"
          role="listbox"
        >
          {loading ? (
            <LoadingSpinner $themeStyles={themeStyles} role="status" aria-live="polite">Loading...</LoadingSpinner>
          ) : (
            filteredOptions.map((option, index) => (
              <Option
                ref={setOptionRef(index)}
                key={option.value}
                id={`typeahead-option-${index}`}
                $themeStyles={themeStyles}
                isHighlighted={index === highlightedIndex}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {renderOption ? (
                  renderOption(option, inputValue)
                ) : (
                  <OptionContent $themeStyles={themeStyles}>
                    <OptionLabel $themeStyles={themeStyles}>
                      {highlightMatch ? highlightText(option.label, inputValue) : option.label}
                    </OptionLabel>
                    {option.description && (
                      <OptionDescription $themeStyles={themeStyles}>
                        {option.description}
                      </OptionDescription>
                    )}
                  </OptionContent>
                )}
              </Option>
            ))
          )}
        </Dropdown>
      )}

      {(helperText || error) && (
        <HelperText 
          $themeStyles={themeStyles} 
          error={!!error}
          id={error ? "typeahead-error" : "typeahead-helper"}
          aria-live="polite"
        >
          {error || helperText}
        </HelperText>
      )}
    </Container>
  );
}; 