import React, { useState, useEffect } from 'react';
import { useTheme } from '../theme/hooks/useTheme';
import { ThemeConfig } from '../theme/consolidated-types';
import styled from '@emotion/styled';

const ExplorerContainer = styled.div`
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;
  overflow: auto;
  max-height: 90vh;
`;

const Header = styled.header`
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0 0 10px 0;
  color: #212529;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin: 20px 0 10px 0;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 5px;
`;

const PropertyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${(props) => props.color};
  display: inline-block;
  margin-right: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const PropertyCard = styled.div`
  background-color: white;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PropertyName = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #495057;
`;

const PropertyValue = styled.div`
  font-family: monospace;
  background-color: #f1f3f5;
  padding: 5px;
  border-radius: 4px;
  overflow: auto;
  max-width: 100%;
  word-break: break-all;
`;

const ExpandableSection = styled.div`
  cursor: pointer;
`;

const ExpandIcon = styled.span`
  margin-right: 8px;
`;

/**
 * Theme property explorer component for testing and exploration
 * Visualizes the theme properties for easier testing and debugging
 */
export const ThemePropertyExplorer: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    colors: true,
    typography: true,
    spacing: true,
    breakpoints: true,
    shadows: true,
    animation: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const renderPropertyValue = (key: string, value: any) => {
    // For color values, show a color swatch
    if (typeof value === 'string' && (key.includes('color') || key.includes('background') || /^#[0-9A-F]{6}$/i.test(value))) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ColorSwatch color={value} />
          <code>{value}</code>
        </div>
      );
    }

    // For objects, show as a formatted JSON
    if (typeof value === 'object' && value !== null) {
      return <pre>{JSON.stringify(value, null, 2)}</pre>;
    }

    // For other values, just show as is
    return <code>{value?.toString()}</code>;
  };

  const renderProperties = (obj: any, path = '') => {
    if (!obj || typeof obj !== 'object') return null;

    return Object.entries(obj)
      .filter(([key, value]) => {
        if (searchTerm === '') return true;
        return (
          key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      })
      .map(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return (
            <div key={fullPath}>
              <ExpandableSection onClick={() => toggleSection(fullPath)}>
                <ExpandIcon>{expandedSections[fullPath] ? '▼' : '►'}</ExpandIcon>
                <strong>{key}</strong>
              </ExpandableSection>
              {expandedSections[fullPath] && (
                <div style={{ marginLeft: 20, marginTop: 10 }}>
                  {renderProperties(value, fullPath)}
                </div>
              )}
            </div>
          );
        }

        return (
          <PropertyCard key={fullPath}>
            <PropertyName>{fullPath}</PropertyName>
            <PropertyValue>{renderPropertyValue(key, value)}</PropertyValue>
          </PropertyCard>
        );
      });
  };

  return (
    <ExplorerContainer>
      <Header>
        <Title>Theme Property Explorer</Title>
        <p>Explore and search theme properties for testing and debugging</p>
      </Header>

      <SearchInput
        type="text"
        placeholder="Search properties..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <SectionTitle
        onClick={() => toggleSection('colors')}
        style={{ cursor: 'pointer' }}
      >
        {expandedSections.colors ? '▼' : '►'} Colors
      </SectionTitle>
      {expandedSections.colors && (
        <PropertyGrid>
          {renderProperties(theme.colors)}
        </PropertyGrid>
      )}

      <SectionTitle
        onClick={() => toggleSection('typography')}
        style={{ cursor: 'pointer' }}
      >
        {expandedSections.typography ? '▼' : '►'} Typography
      </SectionTitle>
      {expandedSections.typography && (
        <PropertyGrid>
          {renderProperties(theme.typography)}
        </PropertyGrid>
      )}

      <SectionTitle
        onClick={() => toggleSection('spacing')}
        style={{ cursor: 'pointer' }}
      >
        {expandedSections.spacing ? '▼' : '►'} Spacing
      </SectionTitle>
      {expandedSections.spacing && (
        <PropertyGrid>
          {renderProperties(theme.spacing)}
        </PropertyGrid>
      )}

      <SectionTitle
        onClick={() => toggleSection('breakpoints')}
        style={{ cursor: 'pointer' }}
      >
        {expandedSections.breakpoints ? '▼' : '►'} Breakpoints
      </SectionTitle>
      {expandedSections.breakpoints && (
        <PropertyGrid>
          {renderProperties(theme.breakpoints)}
        </PropertyGrid>
      )}

      <SectionTitle
        onClick={() => toggleSection('shadows')}
        style={{ cursor: 'pointer' }}
      >
        {expandedSections.shadows ? '▼' : '►'} Shadows
      </SectionTitle>
      {expandedSections.shadows && (
        <PropertyGrid>
          {renderProperties(theme.shadows)}
        </PropertyGrid>
      )}

      <SectionTitle
        onClick={() => toggleSection('animation')}
        style={{ cursor: 'pointer' }}
      >
        {expandedSections.animation ? '▼' : '►'} Animation
      </SectionTitle>
      {expandedSections.animation && (
        <PropertyGrid>
          {renderProperties(theme.animation)}
        </PropertyGrid>
      )}
    </ExplorerContainer>
  );
}; 