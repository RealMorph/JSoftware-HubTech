/**
 * Demo Landing Page
 * 
 * A central hub for accessing all component demos in the application.
 * Provides category-based navigation, search, and filtering for demos.
 */

import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { useTheme } from '../core/theme/ThemeContext';
import { createThemeStyles } from '../core/theme/utils/themeUtils';
import { filterTransientProps } from '../core/styled-components/transient-props';
import { ThemeStyles, StyledComponentProps } from '../core/theme/types';
import demoRegistry, { 
  DemoCategory, 
  DemoComponent, 
  DemoStatus,
  categories
} from '../core/demos/demoRegistry';

// Create filtered components for transient props
const FilteredDiv = filterTransientProps(styled.div``);
const FilteredLink = filterTransientProps(styled(Link)``);
const FilteredInput = filterTransientProps(styled.input``);

// Styled components
const Container = styled(FilteredDiv)<StyledComponentProps>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
  font-family: ${props => props.$themeStyles.typography.fontSize.md};
`;

const Header = styled(FilteredDiv)<StyledComponentProps>`
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
  
  h1 {
    font-size: 32px;
    margin: 0 0 16px;
    font-weight: ${props => props.$themeStyles.typography.fontWeight.bold};
    color: ${props => props.$themeStyles.colors.text.primary};
  }
  
  p {
    font-size: 18px;
    margin: 0;
    color: ${props => props.$themeStyles.colors.text.secondary};
    max-width: 800px;
  }
`;

const SearchBar = styled(FilteredInput)<StyledComponentProps>`
  width: 100%;
  padding: 12px 16px;
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  border: 1px solid ${props => props.$themeStyles.colors.border.main};
  font-size: 16px;
  margin-bottom: 32px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &:focus {
    outline: none;
    border-color: ${props => props.$themeStyles.colors.primary.main};
    box-shadow: 0 0 0 2px ${props => props.$themeStyles.colors.primary.main}30;
  }
`;

const CategoryContainer = styled(FilteredDiv)<StyledComponentProps>`
  margin-bottom: 48px;
  
  h2 {
    font-size: 24px;
    margin: 0 0 16px;
    font-weight: ${props => props.$themeStyles.typography.fontWeight.semibold};
    color: ${props => props.$themeStyles.colors.text.primary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 24px;
`;

interface DemoCardProps extends StyledComponentProps {
  $status: DemoStatus;
}

const DemoCard = styled(FilteredLink)<DemoCardProps>`
  display: flex;
  flex-direction: column;
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  box-shadow: ${props => props.$themeStyles.shadows.md};
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: ${props => props.$themeStyles.colors.background.paper};
  text-decoration: none;
  height: 100%;
  position: relative;
  padding: 20px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.$themeStyles.shadows.lg};
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background-color: ${props => {
      switch (props.$status) {
        case DemoStatus.COMPLETE:
          return props.$themeStyles.colors.primary.main;
        case DemoStatus.IN_PROGRESS:
          return 'orange';
        case DemoStatus.PLANNED:
          return 'gray';
        default:
          return props.$themeStyles.colors.primary.main;
      }
    }};
  }
`;

const CardTitle = styled.h3<StyledComponentProps>`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$themeStyles.colors.text.primary};
`;

const CardDescription = styled.p<StyledComponentProps>`
  margin: 0 0 16px;
  font-size: 14px;
  color: ${props => props.$themeStyles.colors.text.secondary};
  flex-grow: 1;
  line-height: 1.5;
`;

interface StatusLabelProps extends StyledComponentProps {
  $status: DemoStatus;
}

const StatusLabel = styled.span<StatusLabelProps>`
  display: inline-block;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: ${props => {
    switch (props.$status) {
      case DemoStatus.COMPLETE:
        return props.$themeStyles.colors.primary.main + '20'; // 20% opacity
      case DemoStatus.IN_PROGRESS:
        return 'rgba(255, 165, 0, 0.2)';
      case DemoStatus.PLANNED:
        return 'rgba(128, 128, 128, 0.2)';
      default:
        return props.$themeStyles.colors.primary.main + '20';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case DemoStatus.COMPLETE:
        return props.$themeStyles.colors.primary.main;
      case DemoStatus.IN_PROGRESS:
        return 'rgb(200, 120, 0)';
      case DemoStatus.PLANNED:
        return 'rgb(100, 100, 100)';
      default:
        return props.$themeStyles.colors.primary.main;
    }
  }};
  font-weight: 500;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`;

const Tag = styled.span<StyledComponentProps>`
  font-size: 12px;
  background-color: ${props => props.$themeStyles.colors.background.subtle};
  color: ${props => props.$themeStyles.colors.text.secondary};
  padding: 2px 6px;
  border-radius: 4px;
`;

const EmptyState = styled(FilteredDiv)<StyledComponentProps>`
  text-align: center;
  padding: 40px 0;
  color: ${props => props.$themeStyles.colors.text.secondary};
  
  h3 {
    margin: 0 0 8px;
    font-size: 18px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

const DemoLandingPage: React.FC = () => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter demos based on search query
  const filteredDemos = useMemo(() => {
    if (!searchQuery.trim()) {
      return demoRegistry.getAllDemos();
    }
    
    return demoRegistry.searchDemos(searchQuery);
  }, [searchQuery]);
  
  // Group demos by category
  const demosByCategory = useMemo(() => {
    const result: Record<DemoCategory, DemoComponent[]> = {
      [DemoCategory.BASE]: [],
      [DemoCategory.FEEDBACK]: [],
      [DemoCategory.DATA_VISUALIZATION]: [],
      [DemoCategory.NAVIGATION]: [],
      [DemoCategory.FORM]: [],
      [DemoCategory.LAYOUT]: [],
    };
    
    filteredDemos.forEach(demo => {
      if (result[demo.category]) {
        result[demo.category].push(demo);
      }
    });
    
    return result;
  }, [filteredDemos]);
  
  // Helper to get status label text
  const getStatusText = (status: DemoStatus): string => {
    switch (status) {
      case DemoStatus.COMPLETE:
        return 'Complete';
      case DemoStatus.IN_PROGRESS:
        return 'In Progress';
      case DemoStatus.PLANNED:
        return 'Planned';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <Container $themeStyles={themeStyles}>
      <Header $themeStyles={themeStyles}>
        <h1>Component Demos</h1>
        <p>
          Browse the component library and interactive demos. Use the search bar to find specific components by name, 
          description, or tags.
        </p>
      </Header>
      
      <SearchBar 
        $themeStyles={themeStyles}
        placeholder="Search components..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {Object.values(DemoCategory).map(categoryId => {
        const demos = demosByCategory[categoryId];
        
        // Skip empty categories
        if (demos.length === 0) return null;
        
        const categoryInfo = categories[categoryId];
        
        return (
          <CategoryContainer key={categoryId} $themeStyles={themeStyles}>
            <h2>
              {categoryInfo.icon && <span>{categoryInfo.icon}</span>}
              {categoryInfo.name}
            </h2>
            <DemoGrid>
              {demos.map(demo => (
                <DemoCard 
                  key={demo.id} 
                  to={demo.path} 
                  $themeStyles={themeStyles}
                  $status={demo.status}
                >
                  <CardTitle $themeStyles={themeStyles}>{demo.name}</CardTitle>
                  <CardDescription $themeStyles={themeStyles}>
                    {demo.description}
                  </CardDescription>
                  {demo.tags && (
                    <TagContainer>
                      {demo.tags.slice(0, 3).map((tag, index) => (
                        <Tag key={index} $themeStyles={themeStyles}>
                          {tag}
                        </Tag>
                      ))}
                    </TagContainer>
                  )}
                  <CardFooter>
                    <StatusLabel 
                      $themeStyles={themeStyles} 
                      $status={demo.status}
                    >
                      {getStatusText(demo.status)}
                    </StatusLabel>
                  </CardFooter>
                </DemoCard>
              ))}
            </DemoGrid>
          </CategoryContainer>
        );
      })}
      
      {filteredDemos.length === 0 && (
        <EmptyState $themeStyles={themeStyles}>
          <h3>No components found</h3>
          <p>Try adjusting your search query</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default DemoLandingPage; 