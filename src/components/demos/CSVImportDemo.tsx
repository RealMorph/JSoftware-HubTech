import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FileUpload } from '../base/FileUpload';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import * as XLSX from 'xlsx';
import { filterTransientProps } from '../../core/styled-components/transient-props';

// Interface for theme styles
interface ThemeStyles {
  colors: {
    background: string;
    text: string;
    border: string;
    secondary: string;
    success: string;
    error: string;
    info: string;
    primary: string;
  };
  spacing: {
    page: string;
    section: string;
    item: string;
    inner: string;
    sm: string;
    xs: string;
    md: string;
  };
  typography: {
    title: {
      fontSize: string;
      fontWeight: string;
    };
    heading: {
      fontSize: string;
      fontWeight: string;
    };
    subheading: {
      fontSize: string;
      fontWeight: string;
    };
    code: {
      fontSize: string;
    };
    fontWeight: {
      medium: number;
    };
  };
  borderRadius: string;
  shadows: {
    card: string;
  };
}

// Create filtered base components
const FilteredDiv = filterTransientProps(styled.div``);
const FilteredButton = filterTransientProps(styled.button``);
const FilteredTable = filterTransientProps(styled.table``);
const FilteredTHead = filterTransientProps(styled.thead``);
const FilteredTr = filterTransientProps(styled.tr``);
const FilteredTh = filterTransientProps(styled.th``);
const FilteredTd = filterTransientProps(styled.td``);
const FilteredH1 = filterTransientProps(styled.h1``);
const FilteredH2 = filterTransientProps(styled.h2``);
const FilteredP = filterTransientProps(styled.p``);

// Styled components
const DemoContainer = styled(FilteredDiv)<{ $themeStyles: ThemeStyles }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacing.page};
  color: ${props => props.$themeStyles.colors.text};
  background-color: ${props => props.$themeStyles.colors.background};
`;

const Title = styled(FilteredH1)<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  font-size: ${props => props.$themeStyles.typography.title.fontSize};
  font-weight: ${props => props.$themeStyles.typography.title.fontWeight};
`;

const Description = styled(FilteredP)<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  line-height: 1.5;
`;

const Section = styled(FilteredDiv)<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border};
  padding-bottom: ${props => props.$themeStyles.spacing.section};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled(FilteredH2)<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  font-size: ${props => props.$themeStyles.typography.heading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.heading.fontWeight};
`;

const TableContainer = styled(FilteredDiv)<{ $themeStyles: ThemeStyles }>`
  overflow-x: auto;
  margin-top: ${props => props.$themeStyles.spacing.md};
  border: 1px solid ${props => props.$themeStyles.colors.border};
  border-radius: ${props => props.$themeStyles.borderRadius};
`;

const StyledTable = styled(FilteredTable)<{ $themeStyles: ThemeStyles }>`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHead = styled(FilteredTHead)<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.colors.secondary};
`;

const TableRow = styled(FilteredTr)<{ $themeStyles: ThemeStyles; $isEven?: boolean }>`
  &:nth-of-type(even) {
    background-color: ${props => props.$themeStyles.colors.secondary}20;
  }
`;

const TableHeader = styled(FilteredTh)<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.sm};
  text-align: left;
  border-bottom: 2px solid ${props => props.$themeStyles.colors.border};
  position: sticky;
  top: 0;
  background-color: ${props => props.$themeStyles.colors.secondary};
`;

const TableCell = styled(FilteredTd)<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.sm};
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border};
`;

const InfoBox = styled(FilteredDiv)<{ $themeStyles: ThemeStyles; $type?: 'info' | 'success' | 'error' }>`
  padding: ${props => props.$themeStyles.spacing.sm};
  margin: ${props => props.$themeStyles.spacing.sm} 0;
  background-color: ${props => {
    switch (props.$type) {
      case 'success':
        return `${props.$themeStyles.colors.success}20`;
      case 'error':
        return `${props.$themeStyles.colors.error}20`;
      default:
        return `${props.$themeStyles.colors.info}20`;
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success':
        return props.$themeStyles.colors.success;
      case 'error':
        return props.$themeStyles.colors.error;
      default:
        return props.$themeStyles.colors.info;
    }
  }};
  border-radius: ${props => props.$themeStyles.borderRadius};
`;

const MetadataGrid = styled(FilteredDiv)<{ $themeStyles: ThemeStyles }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.$themeStyles.spacing.sm};
  margin: ${props => props.$themeStyles.spacing.md} 0;
`;

const MetadataItem = styled(FilteredDiv)<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.sm};
  background-color: ${props => props.$themeStyles.colors.secondary}30;
  border-radius: ${props => props.$themeStyles.borderRadius};
`;

const MetadataLabel = styled(FilteredDiv)<{ $themeStyles: ThemeStyles }>`
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  font-size: 0.8rem;
  color: ${props => props.$themeStyles.colors.text}aa;
  margin-bottom: 4px;
`;

const MetadataValue = styled(FilteredDiv)<{ $themeStyles: ThemeStyles }>`
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
`;

// Button component
const Button = styled(FilteredButton)<{ $themeStyles: ThemeStyles; $variant?: 'primary' | 'success' | 'error' }>`
  padding: ${props => `${props.$themeStyles.spacing.xs} ${props.$themeStyles.spacing.sm}`};
  background-color: ${props => props.$themeStyles.colors[props.$variant || 'primary']};
  color: white;
  border: none;
  border-radius: ${props => props.$themeStyles.borderRadius};
  cursor: pointer;
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  margin-top: ${props => props.$themeStyles.spacing.sm};
  margin-right: ${props => props.$themeStyles.spacing.sm};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Tabs container
const Tabs = styled(FilteredDiv)<{ $themeStyles: ThemeStyles }>`
  display: flex;
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border};
  margin-bottom: ${props => props.$themeStyles.spacing.md};
`;

// Tab component
const Tab = styled(FilteredButton)<{ $themeStyles: ThemeStyles; $active: boolean }>`
  padding: ${props => `${props.$themeStyles.spacing.sm} ${props.$themeStyles.spacing.md}`};
  background-color: ${props => props.$active ? props.$themeStyles.colors.background : props.$themeStyles.colors.secondary}30;
  color: ${props => props.$themeStyles.colors.text};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? props.$themeStyles.colors.primary : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.$active ? props.$themeStyles.typography.fontWeight.medium : 'normal'};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.$themeStyles.colors.secondary}50;
  }
`;

// Create theme styles
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getSpacing, getTypography, getBorderRadius, getShadow } = themeContext;

  return {
    colors: {
      background: getColor('background', '#ffffff'),
      text: getColor('text.primary', '#333333'),
      border: getColor('border', '#e0e0e0'),
      secondary: getColor('background.secondary', '#f5f7fa'),
      success: getColor('success.main', '#4caf50'),
      error: getColor('error.main', '#f44336'),
      info: getColor('info.light', '#e3f2fd'),
      primary: getColor('primary.main', '#2196f3'),
    },
    spacing: {
      page: getSpacing('8', '2rem'),
      section: getSpacing('6', '1.5rem'),
      item: getSpacing('4', '1rem'),
      inner: getSpacing('3', '0.75rem'),
      sm: getSpacing('2', '0.5rem'),
      xs: getSpacing('1', '0.25rem'),
      md: getSpacing('4', '1rem'),
    },
    typography: {
      title: {
        fontSize: getTypography('fontSize.2xl', '1.5rem') as string,
        fontWeight: getTypography('fontWeight.bold', '700') as string,
      },
      heading: {
        fontSize: getTypography('fontSize.xl', '1.25rem') as string,
        fontWeight: getTypography('fontWeight.semibold', '600') as string,
      },
      subheading: {
        fontSize: getTypography('fontSize.lg', '1.125rem') as string,
        fontWeight: getTypography('fontWeight.medium', '500') as string,
      },
      code: {
        fontSize: getTypography('fontSize.sm', '0.875rem') as string,
      },
      fontWeight: {
        medium: Number(getTypography('fontWeight.medium', '500')),
      },
    },
    borderRadius: getBorderRadius('md', '0.375rem'),
    shadows: {
      card: getShadow(
        'md',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      ),
    },
  };
}

// Interface for parsed data
interface ParsedData {
  headers: string[];
  rows: any[][];
  metadata: {
    fileName: string;
    fileSize: string;
    fileType: string;
    rowCount: number;
    columnCount: number;
    sheets?: string[];
    currentSheet?: string;
  };
  rawData?: any;
}

const CSVImportDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // State for parsed data and UI
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'metadata'>('data');
  
  // Max number of rows to display in preview
  const MAX_PREVIEW_ROWS = 100;

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Parse CSV file
  const parseCSV = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        
        // Remove empty rows
        const filteredRows = rows.filter(row => row.some(cell => cell.trim() !== ''));
        
        const headers = filteredRows[0];
        const dataRows = filteredRows.slice(1);
        
        setParsedData({
          headers,
          rows: dataRows,
          metadata: {
            fileName: file.name,
            fileSize: formatBytes(file.size),
            fileType: 'CSV',
            rowCount: dataRows.length,
            columnCount: headers.length
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('Failed to parse CSV file. Please check the file format.');
        setParsedData(null);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setParsedData(null);
    };
    
    reader.readAsText(file);
  };

  // Parse Excel file (XLSX/XLS)
  const parseExcel = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get sheet names
        const sheetNames = workbook.SheetNames;
        
        if (sheetNames.length === 0) {
          setError('No sheets found in the Excel file.');
          setParsedData(null);
          return;
        }
        
        // Use the first sheet by default
        const firstSheetName = sheetNames[0];
        setSelectedSheet(firstSheetName);
        
        // Parse the first sheet
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Extract headers and rows
        const headers = jsonData[0] as string[];
        const dataRows = jsonData.slice(1) as any[][];
        
        setParsedData({
          headers,
          rows: dataRows,
          metadata: {
            fileName: file.name,
            fileSize: formatBytes(file.size),
            fileType: file.name.endsWith('.xlsx') ? 'XLSX' : 'XLS',
            rowCount: dataRows.length,
            columnCount: headers.length,
            sheets: sheetNames,
            currentSheet: firstSheetName
          },
          rawData: workbook
        });
        
        setError(null);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        setError('Failed to parse Excel file. Please check the file format.');
        setParsedData(null);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setParsedData(null);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Handle file upload
  const handleFilesAdded = (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      parseCSV(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      parseExcel(file);
    } else {
      setError('Unsupported file format. Please upload a CSV, XLSX, or XLS file.');
      setParsedData(null);
    }
  };

  // Handle file rejection
  const handleFileRejected = (file: File, reason: string) => {
    setError(`File rejected: ${reason}`);
    setParsedData(null);
  };

  // Change Excel sheet
  const changeSheet = (sheetName: string) => {
    if (!parsedData?.rawData) return;
    
    try {
      const workbook = parsedData.rawData;
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Extract headers and rows
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];
      
      setParsedData({
        ...parsedData,
        headers,
        rows: dataRows,
        metadata: {
          ...parsedData.metadata,
          rowCount: dataRows.length,
          columnCount: headers.length,
          currentSheet: sheetName
        }
      });
      
      setSelectedSheet(sheetName);
      setError(null);
    } catch (err) {
      console.error('Error changing sheet:', err);
      setError(`Failed to parse sheet "${sheetName}"`);
    }
  };

  // Export data to JSON
  const exportToJSON = () => {
    if (!parsedData) return;
    
    try {
      // Convert data to JSON structure
      const jsonData = parsedData.rows.map(row => {
        const obj: Record<string, any> = {};
        parsedData.headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      // Create a download link
      const dataStr = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${parsedData.metadata.fileName.split('.')[0]}.json`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting to JSON:', err);
      setError('Failed to export data to JSON');
    }
  };

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <Title $themeStyles={themeStyles}>CSV & Excel Import</Title>
      
      <Description $themeStyles={themeStyles}>
        This demo shows how to import and parse CSV and Excel files in your application
        using the FileUpload component. It includes data preview, metadata display,
        and export functionality.
      </Description>
      
      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Import File</SectionTitle>
        
        <FileUpload
          label="Upload CSV or Excel File"
          onFilesAdded={handleFilesAdded}
          onFileRejected={handleFileRejected}
          helperText="Select a CSV (.csv) or Excel (.xlsx, .xls) file to import"
          accept=".csv,.xlsx,.xls"
          maxSize={10 * 1024 * 1024} // 10MB
        />
        
        {error && (
          <InfoBox $themeStyles={themeStyles} $type="error">
            {error}
          </InfoBox>
        )}
      </Section>
      
      {parsedData && (
        <Section $themeStyles={themeStyles}>
          <SectionTitle $themeStyles={themeStyles}>
            Data Preview: {parsedData.metadata.fileName}
          </SectionTitle>
          
          {parsedData.metadata.sheets && parsedData.metadata.sheets.length > 1 && (
            <div style={{ marginBottom: themeStyles.spacing.md }}>
              <SectionTitle $themeStyles={themeStyles}>Sheet Selection</SectionTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {parsedData.metadata.sheets.map(sheetName => (
                  <Button
                    key={sheetName}
                    $themeStyles={themeStyles}
                    $variant={selectedSheet === sheetName ? 'primary' : undefined}
                    onClick={() => changeSheet(sheetName)}
                    style={{ opacity: selectedSheet === sheetName ? 1 : 0.7 }}
                  >
                    {sheetName}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <Tabs $themeStyles={themeStyles}>
            <Tab 
              $themeStyles={themeStyles} 
              $active={activeTab === 'data'} 
              onClick={() => setActiveTab('data')}
            >
              Data Preview
            </Tab>
            <Tab 
              $themeStyles={themeStyles} 
              $active={activeTab === 'metadata'} 
              onClick={() => setActiveTab('metadata')}
            >
              File Metadata
            </Tab>
          </Tabs>
          
          {activeTab === 'data' ? (
            <>
              {parsedData.rows.length > MAX_PREVIEW_ROWS && (
                <InfoBox $themeStyles={themeStyles} $type="info">
                  Showing first {MAX_PREVIEW_ROWS} rows of {parsedData.metadata.rowCount} total rows.
                </InfoBox>
              )}
              
              <TableContainer $themeStyles={themeStyles}>
                <StyledTable $themeStyles={themeStyles}>
                  <TableHead $themeStyles={themeStyles}>
                    <TableRow $themeStyles={themeStyles}>
                      {parsedData.headers.map((header, i) => (
                        <TableHeader key={i} $themeStyles={themeStyles}>
                          {header || `Column ${i + 1}`}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <tbody>
                    {parsedData.rows.slice(0, MAX_PREVIEW_ROWS).map((row, rowIndex) => (
                      <TableRow key={rowIndex} $themeStyles={themeStyles}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex} $themeStyles={themeStyles}>
                            {cell !== undefined && cell !== null ? String(cell) : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </tbody>
                </StyledTable>
              </TableContainer>
              
              <div style={{ marginTop: themeStyles.spacing.md }}>
                <Button 
                  $themeStyles={themeStyles} 
                  $variant="primary"
                  onClick={exportToJSON}
                >
                  Export to JSON
                </Button>
              </div>
            </>
          ) : (
            <MetadataGrid $themeStyles={themeStyles}>
              <MetadataItem $themeStyles={themeStyles}>
                <MetadataLabel $themeStyles={themeStyles}>File Name</MetadataLabel>
                <MetadataValue $themeStyles={themeStyles}>{parsedData.metadata.fileName}</MetadataValue>
              </MetadataItem>
              
              <MetadataItem $themeStyles={themeStyles}>
                <MetadataLabel $themeStyles={themeStyles}>File Type</MetadataLabel>
                <MetadataValue $themeStyles={themeStyles}>{parsedData.metadata.fileType}</MetadataValue>
              </MetadataItem>
              
              <MetadataItem $themeStyles={themeStyles}>
                <MetadataLabel $themeStyles={themeStyles}>File Size</MetadataLabel>
                <MetadataValue $themeStyles={themeStyles}>{parsedData.metadata.fileSize}</MetadataValue>
              </MetadataItem>
              
              <MetadataItem $themeStyles={themeStyles}>
                <MetadataLabel $themeStyles={themeStyles}>Total Rows</MetadataLabel>
                <MetadataValue $themeStyles={themeStyles}>{parsedData.metadata.rowCount}</MetadataValue>
              </MetadataItem>
              
              <MetadataItem $themeStyles={themeStyles}>
                <MetadataLabel $themeStyles={themeStyles}>Total Columns</MetadataLabel>
                <MetadataValue $themeStyles={themeStyles}>{parsedData.metadata.columnCount}</MetadataValue>
              </MetadataItem>
              
              {parsedData.metadata.currentSheet && (
                <MetadataItem $themeStyles={themeStyles}>
                  <MetadataLabel $themeStyles={themeStyles}>Current Sheet</MetadataLabel>
                  <MetadataValue $themeStyles={themeStyles}>{parsedData.metadata.currentSheet}</MetadataValue>
                </MetadataItem>
              )}
              
              {parsedData.metadata.sheets && (
                <MetadataItem $themeStyles={themeStyles}>
                  <MetadataLabel $themeStyles={themeStyles}>Number of Sheets</MetadataLabel>
                  <MetadataValue $themeStyles={themeStyles}>{parsedData.metadata.sheets.length}</MetadataValue>
                </MetadataItem>
              )}
            </MetadataGrid>
          )}
        </Section>
      )}
      
      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Implementation Notes</SectionTitle>
        
        <Description $themeStyles={themeStyles}>
          This implementation demonstrates:
          <ul>
            <li>CSV and Excel file parsing using the SheetJS library</li>
            <li>Multi-sheet Excel file support</li>
            <li>Data preview with pagination</li>
            <li>Metadata display and analysis</li>
            <li>Export to JSON functionality</li>
          </ul>
          
          In a real application, you would likely add more features:
          <ul>
            <li>Data validation and cleaning</li>
            <li>Schema mapping to your application data model</li>
            <li>Handling of large files with chunked processing</li>
            <li>More export options (CSV, Excel, etc.)</li>
            <li>Integration with a data processing API</li>
          </ul>
        </Description>
      </Section>
    </DemoContainer>
  );
};

export default CSVImportDemo; 