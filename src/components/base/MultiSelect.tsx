import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';

// Theme styles interface following DirectTheme pattern
interface ThemeStyles {
  colors: {
    primary: string;
    secondary: string;
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
    label: string;
    placeholder: string;
    selectedItem: string;
    dropdownItem: string;
    error: string;
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

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface MultiSelectProps {
  /** Array of options to display */
  options: MultiSelectOption[];
  /** Currently selected values */
  value: string[];
  /** Callback when selection changes */
  onChange: (values: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Maximum number of items that can be selected */
  maxItems?: number;
  /** Whether to show a search input */
  searchable?: boolean;
  /** Custom filter function */
  filterOption?: (option: MultiSelectOption, searchText: string) => boolean;
  /** Whether to group options */
  groupBy?: boolean;
  /** Custom option render function */
  renderOption?: (option: MultiSelectOption) => React.ReactNode;
  /** Custom selected value render function */
  renderValue?: (selectedOptions: MultiSelectOption[]) => React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const Container = styled.div<{ $themeStyles: ThemeStyles; hasError?: boolean }>`
  position: relative;
  width: 100%;
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};
`;

const SelectContainer = styled.div<{ $themeStyles: ThemeStyles; isOpen: boolean; hasError?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: ${props => props.$themeStyles.spacing.sm};
  background: ${props => props.disabled ? props.$themeStyles.colors.background : props.$themeStyles.colors.surface || '#ffffff'};
  border: 1px solid ${props => 
    props.hasError ? 'red' : 
    props.isOpen ? props.$themeStyles.colors.focus.border :
    props.$themeStyles.colors.border || '#c3c6d4'
  };
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all ${props => props.$themeStyles.transitions.fast};
  color: ${props => props.disabled ? (props.$themeStyles.colors.text.disabled || '#ccc') : (props.$themeStyles.colors.text.primary || '#323338')};

  &:hover {
    border-color: ${props => !props.disabled && (props.$themeStyles.colors.hover.border || props.$themeStyles.colors.primary || '#0073ea')};
  }

  &:focus-within {
    border-color: ${props => props.$themeStyles.colors.focus.border || props.$themeStyles.colors.primary || '#0073ea'};
    box-shadow: ${props => props.$themeStyles.shadows.sm};
  }
`;

const ValueContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.$themeStyles.spacing.xs};
  flex: 1;
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};
`;

const Chip = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  padding: ${props => props.$themeStyles.spacing.xs} ${props => props.$themeStyles.spacing.sm};
  background: ${props => props.$themeStyles.colors.primary || '#0073ea'};
  color: white;
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  gap: ${props => props.$themeStyles.spacing.xs};

  button {
    background: none;
    border: none;
    color: white;
    padding: 0;
    cursor: pointer;
    font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  }
`;

const Dropdown = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: ${props => props.$themeStyles.spacing.xs};
  background: ${props => props.$themeStyles.colors.surface || '#ffffff'};
  border: 1px solid ${props => props.$themeStyles.colors.border || '#c3c6d4'};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  box-shadow: ${props => props.$themeStyles.shadows.md};
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};
`;

const SearchInput = styled.input<{ $themeStyles: ThemeStyles }>`
  width: 100%;
  padding: ${props => props.$themeStyles.spacing.sm};
  border: none;
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border || '#c3c6d4'};
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
  outline: none;
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};
  background: ${props => props.$themeStyles.colors.surface || '#ffffff'};

  &:focus {
    border-color: ${props => props.$themeStyles.colors.focus.border || props.$themeStyles.colors.primary || '#0073ea'};
  }

  &::placeholder {
    color: ${props => props.$themeStyles.colors.text.secondary || '#676879'};
  }
`;

const OptionGroup = styled.div<{ $themeStyles: ThemeStyles }>`
  > label {
    display: block;
    padding: ${props => props.$themeStyles.spacing.sm};
    color: ${props => props.$themeStyles.colors.text.secondary || '#676879'};
    font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
    font-size: ${props => props.$themeStyles.typography.fontSize.sm};
    background: ${props => props.$themeStyles.colors.background || '#f6f7fb'};
  }
`;

const Option = styled.div<{ 
  $themeStyles: ThemeStyles; 
  isSelected: boolean; 
  isHighlighted?: boolean;
  disabled?: boolean 
}>`
  padding: ${props => props.$themeStyles.spacing.sm};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background: ${props => {
    if (props.isHighlighted) return props.$themeStyles.colors.hover.background || 'rgba(0, 0, 0, 0.08)';
    if (props.isSelected) return props.$themeStyles.colors.hover.background || 'rgba(0, 0, 0, 0.04)';
    return 'transparent';
  }};
  color: ${props => props.disabled ? (props.$themeStyles.colors.text.disabled || '#ccc') : (props.$themeStyles.colors.text.primary || '#323338')};
  transition: background ${props => props.$themeStyles.transitions.fast};
  outline: none;
  
  &:hover {
    background: ${props => !props.disabled && (props.$themeStyles.colors.hover.background || 'rgba(0, 0, 0, 0.04)')};
  }
`;

const HelperText = styled.div<{ $themeStyles: ThemeStyles; error?: boolean }>`
  margin-top: ${props => props.$themeStyles.spacing.xs};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  color: ${props => props.error ? 'red' : props.$themeStyles.colors.text.secondary || '#676879'};
`;

const createThemeStyles = (theme: DirectThemeContextType): ThemeStyles => ({
  colors: {
    primary: theme.getColor('colors.primary'),
    secondary: theme.getColor('colors.secondary'),
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
    label: theme.getTypography('fontSize.sm') as string,
    placeholder: theme.getTypography('fontSize.md') as string,
    selectedItem: theme.getTypography('fontSize.md') as string,
    dropdownItem: theme.getTypography('fontSize.md') as string,
    error: theme.getTypography('fontSize.sm') as string,
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

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select items...',
  disabled = false,
  error,
  helperText,
  maxItems,
  searchable = true,
  filterOption,
  groupBy = false,
  renderOption,
  renderValue,
  className,
  style,
}) => {
  const theme = useDirectTheme();
  const themeStyles = React.useMemo(() => createThemeStyles(theme), [theme]);

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  
  // Filter options based on search text
  const filteredOptions = React.useMemo(() => {
    if (!searchText) return options;
    
    return options.filter(option => 
      filterOption 
        ? filterOption(option, searchText)
        : option.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [options, searchText, filterOption]);

  // Group options if needed
  const groupedOptions = React.useMemo(() => {
    if (!groupBy) return { undefined: filteredOptions };
    
    return filteredOptions.reduce((acc, option) => {
      const group = option.group || 'undefined';
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {} as Record<string, MultiSelectOption[]>);
  }, [filteredOptions, groupBy]);

  // Flattened options for keyboard navigation
  const flattenedOptions = React.useMemo(() => {
    return Object.values(groupedOptions).flat();
  }, [groupedOptions]);

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset highlighted index when options change
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(highlightedIndex >= filteredOptions.length ? 0 : highlightedIndex);
    }
  }, [filteredOptions.length, isOpen, highlightedIndex]);

  // Scroll to highlighted option
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex] && optionsRef.current) {
      const option = optionRefs.current[highlightedIndex];
      const container = optionsRef.current;
      
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
  }, [highlightedIndex, isOpen]);

  const selectedOptions = options.filter(option => value.includes(option.value));

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchText('');
      setHighlightedIndex(isOpen ? -1 : 0);
    }
  };

  const handleOptionClick = (option: MultiSelectOption) => {
    if (disabled || option.disabled) return;

    const newValue = value.includes(option.value)
      ? value.filter(v => v !== option.value)
      : maxItems && value.length >= maxItems
      ? value
      : [...value, option.value];

    onChange(newValue);
  };

  const handleRemoveValue = (optionValue: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    const keyHandlers: Record<string, () => void> = {
      ArrowDown: () => {
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            return nextIndex >= flattenedOptions.length ? 0 : nextIndex;
          });
        }
        event.preventDefault();
      },
      ArrowUp: () => {
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(flattenedOptions.length - 1);
        } else {
          setHighlightedIndex((prevIndex) => {
            const nextIndex = prevIndex - 1;
            return nextIndex < 0 ? flattenedOptions.length - 1 : nextIndex;
          });
        }
        event.preventDefault();
      },
      Enter: () => {
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < flattenedOptions.length) {
          handleOptionClick(flattenedOptions[highlightedIndex]);
          if (!searchable) {
            setIsOpen(false);
          }
        } else if (!isOpen) {
          setIsOpen(true);
        }
        event.preventDefault();
      },
      ' ': () => {
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < flattenedOptions.length) {
          handleOptionClick(flattenedOptions[highlightedIndex]);
          event.preventDefault();
        }
      },
      Escape: () => {
        setIsOpen(false);
        setHighlightedIndex(-1);
        event.preventDefault();
      },
      Tab: () => {
        setIsOpen(false);
        setHighlightedIndex(-1);
      },
    };

    const handler = keyHandlers[event.key];
    if (handler) {
      handler();
    }
  };

  const handleOptionMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  // Update optionRefs when the number of options changes
  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, flattenedOptions.length);
    while (optionRefs.current.length < flattenedOptions.length) {
      optionRefs.current.push(null);
    }
  }, [flattenedOptions.length]);

  // Set the option reference
  const setOptionRef = (index: number) => (el: HTMLDivElement | null) => {
    optionRefs.current[index] = el;
  };

  return (
    <Container 
      ref={containerRef} 
      $themeStyles={themeStyles} 
      hasError={!!error} 
      className={className} 
      style={style}
      onKeyDown={handleKeyDown}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-owns={isOpen ? "multiselect-options" : undefined}
      aria-controls={isOpen ? "multiselect-options" : undefined}
      aria-labelledby={placeholder ? "multiselect-label" : undefined}
      tabIndex={disabled ? -1 : 0}
    >
      {placeholder && (
        <span id="multiselect-label" style={{ display: 'none' }}>
          {placeholder}
        </span>
      )}
      <SelectContainer
        $themeStyles={themeStyles}
        isOpen={isOpen}
        hasError={!!error}
        disabled={disabled}
        onClick={handleToggle}
        aria-disabled={disabled}
      >
        <ValueContainer $themeStyles={themeStyles}>
          {selectedOptions.length === 0 && (
            <div style={{ color: themeStyles.colors.text.secondary }}>{placeholder}</div>
          )}
          {renderValue ? renderValue(selectedOptions) : (
            selectedOptions.map(option => (
              <Chip key={option.value} $themeStyles={themeStyles}>
                {option.label}
                <button 
                  onClick={(e) => handleRemoveValue(option.value, e)}
                  aria-label={`Remove ${option.label}`}
                  tabIndex={0}
                >
                  &times;
                </button>
              </Chip>
            ))
          )}
        </ValueContainer>
      </SelectContainer>

      {isOpen && (
        <Dropdown 
          $themeStyles={themeStyles} 
          ref={optionsRef}
          id="multiselect-options"
          role="listbox"
          aria-multiselectable="true"
        >
          {searchable && (
            <SearchInput
              ref={searchInputRef}
              $themeStyles={themeStyles}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search..."
              onClick={(e) => e.stopPropagation()}
              aria-label="Search options"
            />
          )}

          {Object.entries(groupedOptions).map(([group, groupOptions], groupIndex) => (
            <OptionGroup key={group} $themeStyles={themeStyles} role="group" aria-label={group !== 'undefined' ? group : 'Options'}>
              {group !== 'undefined' && <label>{group}</label>}
              {groupOptions.map((option, optionIndex) => {
                // Calculate the absolute index of this option in the flattened list
                const absoluteIndex = flattenedOptions.findIndex(o => o.value === option.value);
                
                return (
                  <Option
                    key={option.value}
                    ref={setOptionRef(absoluteIndex)}
                    $themeStyles={themeStyles}
                    isSelected={value.includes(option.value)}
                    isHighlighted={highlightedIndex === absoluteIndex}
                    disabled={option.disabled}
                    onClick={() => handleOptionClick(option)}
                    onMouseEnter={() => handleOptionMouseEnter(absoluteIndex)}
                    role="option"
                    aria-selected={value.includes(option.value)}
                    aria-disabled={option.disabled}
                  >
                    {renderOption ? renderOption(option) : option.label}
                  </Option>
                );
              })}
            </OptionGroup>
          ))}
        </Dropdown>
      )}

      {(helperText || error) && (
        <HelperText $themeStyles={themeStyles} error={!!error} id={error ? "multiselect-error" : "multiselect-helper"}>
          {error || helperText}
        </HelperText>
      )}
    </Container>
  );
};

const StyledLabel = styled.label<{ $themeStyles: ThemeStyles }>`
  display: block;
  margin-bottom: ${({ $themeStyles }) => $themeStyles.spacing.xs};
  font-family: ${({ $themeStyles }) => $themeStyles.typography.label};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.sm};
  font-weight: ${({ $themeStyles }) => $themeStyles.typography.fontWeight.medium};
  line-height: ${({ $themeStyles }) => $themeStyles.typography.lineHeight.normal};
  color: ${({ $themeStyles }) => $themeStyles.colors.text.primary};
`;

const StyledInput = styled.input<{ $themeStyles: ThemeStyles }>`
  width: 100%;
  padding: ${({ $themeStyles }) => $themeStyles.spacing.sm};
  border: 1px solid ${({ $themeStyles }) => $themeStyles.colors.border};
  border-radius: ${({ $themeStyles }) => $themeStyles.borderRadius.md};
  font-family: ${({ $themeStyles }) => $themeStyles.typography.placeholder};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.md};
  line-height: ${({ $themeStyles }) => $themeStyles.typography.lineHeight.normal};
  color: ${({ $themeStyles }) => $themeStyles.colors.text.primary};
  background-color: ${({ $themeStyles }) => $themeStyles.colors.background};
  transition: border-color ${({ $themeStyles }) => $themeStyles.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${({ $themeStyles }) => $themeStyles.colors.primary};
  }

  &::placeholder {
    color: ${({ $themeStyles }) => $themeStyles.colors.text.secondary};
  }
`;

const StyledTag = styled.span<{ $themeStyles: ThemeStyles }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ $themeStyles }) => `${$themeStyles.spacing.xs} ${$themeStyles.spacing.sm}`};
  margin: ${({ $themeStyles }) => $themeStyles.spacing.xs};
  background-color: ${({ $themeStyles }) => $themeStyles.colors.primary};
  color: ${({ $themeStyles }) => $themeStyles.colors.background};
  border-radius: ${({ $themeStyles }) => $themeStyles.borderRadius.md};
  font-family: ${({ $themeStyles }) => $themeStyles.typography.selectedItem};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.sm};
  line-height: ${({ $themeStyles }) => $themeStyles.typography.lineHeight.normal};
`;

const StyledTagButton = styled.button<{ $themeStyles: ThemeStyles }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: ${({ $themeStyles }) => $themeStyles.spacing.xs};
  padding: ${({ $themeStyles }) => $themeStyles.spacing.xs};
  border: none;
  background: none;
  color: ${({ $themeStyles }) => $themeStyles.colors.background};
  cursor: pointer;
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.sm};
  line-height: ${({ $themeStyles }) => $themeStyles.typography.lineHeight.normal};
  transition: opacity ${({ $themeStyles }) => $themeStyles.transitions.normal};

  &:hover {
    opacity: 0.8;
  }
`;

const StyledDropdown = styled.ul<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: ${({ $themeStyles }) => $themeStyles.spacing.xs} 0 0;
  padding: ${({ $themeStyles }) => $themeStyles.spacing.xs} 0;
  list-style: none;
  background-color: ${({ $themeStyles }) => $themeStyles.colors.background};
  border: 1px solid ${({ $themeStyles }) => $themeStyles.colors.border};
  border-radius: ${({ $themeStyles }) => $themeStyles.borderRadius.md};
  box-shadow: ${({ $themeStyles }) => $themeStyles.shadows.md};
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
`;

const StyledOption = styled.li<{ $themeStyles: ThemeStyles; isHighlighted: boolean }>`
  padding: ${({ $themeStyles }) => `${$themeStyles.spacing.xs} ${$themeStyles.spacing.sm}`};
  cursor: pointer;
  font-family: ${({ $themeStyles }) => $themeStyles.typography.dropdownItem};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.md};
  line-height: ${({ $themeStyles }) => $themeStyles.typography.lineHeight.normal};
  background-color: ${({ $themeStyles, isHighlighted }) =>
    isHighlighted ? $themeStyles.colors.primary : 'transparent'};
  color: ${({ $themeStyles, isHighlighted }) =>
    isHighlighted ? $themeStyles.colors.background : $themeStyles.colors.text.primary};

  &:hover {
    background-color: ${({ $themeStyles }) => $themeStyles.colors.primary};
    color: ${({ $themeStyles }) => $themeStyles.colors.background};
  }
`; 