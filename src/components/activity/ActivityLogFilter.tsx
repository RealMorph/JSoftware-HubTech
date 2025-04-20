import React, { useState, useCallback, useEffect } from 'react';
import { ActivityType } from '../../core/firebase/websocket-service';
import { Button, TextField, Select, DatePicker } from '../ui';
import styled from 'styled-components';

export interface ActivityFilterOptions {
  types?: ActivityType[];
  entityId?: string;
  entityType?: string;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface ActivityLogFilterProps {
  onFilterChange: (filters: ActivityFilterOptions) => void;
  className?: string;
  initialFilters?: ActivityFilterOptions;
}

const activityTypeOptions = [
  { value: 'user_login', label: 'User Login/Logout' },
  { value: 'contact_created', label: 'Contact Created' },
  { value: 'contact_updated', label: 'Contact Updated' },
  { value: 'contact_deleted', label: 'Contact Deleted' },
  { value: 'deal_created', label: 'Deal Created' },
  { value: 'deal_updated', label: 'Deal Updated' },
  { value: 'deal_deleted', label: 'Deal Deleted' },
  { value: 'task_created', label: 'Task Created' },
  { value: 'task_completed', label: 'Task Completed' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'subscription_updated', label: 'Subscription Updated' },
];

const entityTypeOptions = [
  { value: 'user', label: 'User' },
  { value: 'contact', label: 'Contact' },
  { value: 'deal', label: 'Deal' },
  { value: 'task', label: 'Task' },
  { value: 'payment', label: 'Payment' },
  { value: 'subscription', label: 'Subscription' },
];

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.medium};
`;

const FilterSection = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FilterActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-top: 8px;
`;

const FilterTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: ${props => props.theme.typography.fontSizes.medium};
  color: ${props => props.theme.colors.text.primary};
`;

export const ActivityLogFilter: React.FC<ActivityLogFilterProps> = ({
  onFilterChange,
  className = '',
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<ActivityFilterOptions>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.searchTerm || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handle activity type selection
  const handleTypeChange = useCallback((selectedValues: string[]) => {
    setFilters(prev => ({
      ...prev,
      types: selectedValues as ActivityType[],
    }));
  }, []);

  // Handle entity type selection
  const handleEntityTypeChange = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      entityType: value || undefined,
    }));
  }, []);

  // Handle entity ID input
  const handleEntityIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setFilters(prev => ({
      ...prev,
      entityId: value || undefined,
    }));
  }, []);

  // Handle search term input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  // Apply search term when Enter is pressed or after a delay
  const applySearch = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      searchTerm: searchInput.trim() || undefined,
    }));
  }, [searchInput]);

  // Handle search on Enter key
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applySearch();
    }
  }, [applySearch]);

  // Handle date range selection
  const handleDateFromChange = useCallback((date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateFrom: date || undefined,
    }));
  }, []);

  const handleDateToChange = useCallback((date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateTo: date || undefined,
    }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchInput('');
  }, []);

  // Apply search after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.searchTerm || '')) {
        applySearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.searchTerm, applySearch]);

  return (
    <FilterContainer className={className}>
      <FilterSection>
        <TextField
          label="Search Activities"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search by keyword..."
          fullWidth
        />
      </FilterSection>

      <FilterActions>
        <Button 
          variant="secondary" 
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </Button>
        <Button 
          variant="text" 
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </FilterActions>

      {showAdvanced && (
        <>
          <FilterSection>
            <FilterTitle>Activity Types</FilterTitle>
            <Select
              isMulti
              options={activityTypeOptions}
              value={filters.types || []}
              onChange={handleTypeChange}
              placeholder="Select activity types..."
              fullWidth
            />
          </FilterSection>

          <FilterSection>
            <FilterTitle>Entity Type</FilterTitle>
            <Select
              options={entityTypeOptions}
              value={filters.entityType || ''}
              onChange={handleEntityTypeChange}
              placeholder="Select entity type..."
              isClearable
              fullWidth
            />
          </FilterSection>

          <FilterSection>
            <FilterTitle>Entity ID</FilterTitle>
            <TextField
              value={filters.entityId || ''}
              onChange={handleEntityIdChange}
              placeholder="Enter entity ID..."
              fullWidth
            />
          </FilterSection>

          <FilterSection>
            <FilterTitle>Date Range</FilterTitle>
            <div style={{ display: 'flex', gap: '8px' }}>
              <DatePicker
                label="From"
                selected={filters.dateFrom}
                onChange={handleDateFromChange}
                maxDate={filters.dateTo}
                placeholderText="Start date"
              />
              <DatePicker
                label="To"
                selected={filters.dateTo}
                onChange={handleDateToChange}
                minDate={filters.dateFrom}
                placeholderText="End date"
              />
            </div>
          </FilterSection>
        </>
      )}
    </FilterContainer>
  );
}; 