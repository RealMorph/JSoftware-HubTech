import React, { useState } from 'react';
import styled from 'styled-components';
import { DataPoint } from './Charts';
import { ScatterPoint } from './ScatterChart';
import { exportChart, ExportFormat } from './utils/ChartExport';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Props interface
interface ChartExportMenuProps {
  chartRef: React.RefObject<HTMLDivElement>;
  data: DataPoint[] | ScatterPoint[];
  fileName?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  formats?: ExportFormat[];
  buttonSize?: 'small' | 'medium' | 'large';
  onExportStart?: () => void;
  onExportComplete?: (format: ExportFormat) => void;
  onExportError?: (error: Error) => void;
}

// Styled components
const ExportMenuContainer = styled.div<{ 
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  isOpen: boolean;
}>`
  position: absolute;
  z-index: 10;
  display: flex;
  flex-direction: column;
  
  ${props => {
    switch (props.position) {
      case 'top-right':
        return 'top: 8px; right: 8px;';
      case 'top-left':
        return 'top: 8px; left: 8px;';
      case 'bottom-right':
        return 'bottom: 8px; right: 8px;';
      case 'bottom-left':
        return 'bottom: 8px; left: 8px;';
      default:
        return 'top: 8px; right: 8px;';
    }
  }}
  
  ${props => props.isOpen ? `
    & > ${ExportButton} {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
  ` : ''}
`;

const MenuToggle = styled.button<{ 
  buttonSize: 'small' | 'medium' | 'large';
  $backgroundColor: string;
  $textColor: string;
}>`
  background-color: ${props => props.$backgroundColor};
  color: ${props => props.$textColor};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => {
    switch (props.buttonSize) {
      case 'small': return '0.75rem';
      case 'medium': return '0.875rem';
      case 'large': return '1rem';
      default: return '0.875rem';
    }
  }};
  padding: ${props => {
    switch (props.buttonSize) {
      case 'small': return '4px 8px';
      case 'medium': return '6px 10px';
      case 'large': return '8px 12px';
      default: return '6px 10px';
    }
  }};
  margin-bottom: 8px;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const ExportButton = styled(MenuToggle)`
  opacity: 0;
  pointer-events: none;
  transform: translateY(-8px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  margin-bottom: 4px;
`;

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

/**
 * ChartExportMenu component provides export functionality for charts
 */
const ChartExportMenu: React.FC<ChartExportMenuProps> = ({
  chartRef,
  data,
  fileName = 'chart',
  position = 'top-right',
  formats = ['png', 'svg', 'csv'],
  buttonSize = 'medium',
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const theme = useDirectTheme();
  
  const backgroundColor = theme.getColor('primary', '#3366cc');
  const textColor = theme.getColor('text.onPrimary', '#ffffff');
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      if (onExportStart) {
        onExportStart();
      }
      
      await exportChart(chartRef, data, format, fileName);
      
      if (onExportComplete) {
        onExportComplete(format);
      }
    } catch (error) {
      console.error('Export error:', error);
      if (onExportError && error instanceof Error) {
        onExportError(error);
      }
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };
  
  const formatLabels: Record<ExportFormat, string> = {
    png: 'PNG Image',
    svg: 'SVG Vector',
    csv: 'CSV Data',
  };
  
  return (
    <ExportMenuContainer position={position} isOpen={isOpen}>
      <MenuToggle 
        onClick={toggleMenu} 
        buttonSize={buttonSize}
        $backgroundColor={backgroundColor}
        $textColor={textColor}
        title="Export Options"
        aria-label="Export Options"
        aria-expanded={isOpen}
        disabled={isExporting}
      >
        <DownloadIcon /> {isExporting ? 'Exporting...' : 'Export'}
      </MenuToggle>
      
      {formats.map((format) => (
        <ExportButton
          key={format}
          onClick={() => handleExport(format)}
          buttonSize={buttonSize}
          $backgroundColor={backgroundColor}
          $textColor={textColor}
          disabled={isExporting}
          title={`Export as ${formatLabels[format]}`}
          aria-label={`Export as ${formatLabels[format]}`}
        >
          {formatLabels[format]}
        </ExportButton>
      ))}
    </ExportMenuContainer>
  );
};

export default ChartExportMenu; 