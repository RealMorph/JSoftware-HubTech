import { DataPoint } from '../Charts';
import { ScatterPoint } from '../ScatterChart';

/**
 * Utility functions for exporting charts in different formats
 */

// Format to export in
export type ExportFormat = 'png' | 'svg' | 'csv';

/**
 * Export chart as PNG
 * @param svgElement - The SVG element to export
 * @param fileName - The file name for the downloaded image
 * @param scale - Scale factor for the output image (default: 2)
 */
export const exportAsPng = (svgElement: SVGElement, fileName = 'chart', scale = 2): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG element to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      
      // Get dimensions of the SVG
      const bbox = svgElement.getBoundingClientRect();
      const width = bbox.width * scale;
      const height = bbox.height * scale;
      
      // Create a canvas element to draw the SVG
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Get the canvas context and configure it
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Unable to get canvas context');
      }
      
      // White background for the canvas
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      
      // Scale the canvas
      context.scale(scale, scale);
      
      // Create an image from the SVG
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0);
        URL.revokeObjectURL(svgUrl);
        
        // Convert the canvas to a data URL and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.png`;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      };
      
      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG as image'));
      };
      
      image.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export chart as SVG
 * @param svgElement - The SVG element to export
 * @param fileName - The file name for the downloaded SVG
 */
export const exportAsSvg = (svgElement: SVGElement, fileName = 'chart'): void => {
  // Clone the SVG to avoid modifying the original
  const svgClone = svgElement.cloneNode(true) as SVGElement;
  
  // Add inline styles and ensure SVG is self-contained
  const styleSheets = document.styleSheets;
  let cssText = '';
  
  // Extract CSS that might apply to the SVG
  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const rules = styleSheets[i].cssRules;
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        cssText += rule.cssText;
      }
    } catch (e) {
      console.warn('Could not access stylesheet rules', e);
    }
  }
  
  // Add the styles to the SVG
  const styleElement = document.createElement('style');
  styleElement.textContent = cssText;
  svgClone.insertBefore(styleElement, svgClone.firstChild);
  
  // Convert SVG to a string
  const svgData = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  
  // Download the SVG
  const link = document.createElement('a');
  link.href = svgUrl;
  link.download = `${fileName}.svg`;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(svgUrl);
};

/**
 * Export chart data as CSV
 * @param data - The data to export
 * @param fileName - The file name for the downloaded CSV
 * @param options - Options for customizing the CSV output
 */
export const exportAsCsv = (
  data: DataPoint[] | ScatterPoint[],
  fileName = 'chart-data',
  options?: {
    delimiter?: string;
    includeHeaders?: boolean;
    additionalColumns?: string[];
  }
): void => {
  const delimiter = options?.delimiter || ',';
  const includeHeaders = options?.includeHeaders !== false;
  
  let csvContent = '';
  
  // Determine if we're dealing with scatter data or regular data points
  const isScatterData = data.length > 0 && 'x' in data[0];
  
  // Add headers
  if (includeHeaders) {
    if (isScatterData) {
      csvContent += ['ID', 'Label', 'X Value', 'Y Value', 'Category', 'Size']
        .concat(options?.additionalColumns || [])
        .join(delimiter);
    } else {
      csvContent += ['ID', 'Label', 'Value']
        .concat(options?.additionalColumns || [])
        .join(delimiter);
    }
    csvContent += '\n';
  }
  
  // Add data rows
  data.forEach(item => {
    if (isScatterData) {
      const scatterPoint = item as ScatterPoint;
      csvContent += [
        scatterPoint.id,
        `"${scatterPoint.label.replace(/"/g, '""')}"`,
        scatterPoint.x,
        scatterPoint.y,
        scatterPoint.category || '',
        scatterPoint.size || ''
      ].join(delimiter);
    } else {
      const dataPoint = item as DataPoint;
      csvContent += [
        dataPoint.id,
        `"${dataPoint.label.replace(/"/g, '""')}"`,
        dataPoint.value
      ].join(delimiter);
    }
    csvContent += '\n';
  });
  
  // Create a blob and download the CSV
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(csvBlob);
  
  const link = document.createElement('a');
  link.href = csvUrl;
  link.download = `${fileName}.csv`;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(csvUrl);
};

/**
 * Export chart in the specified format
 * @param chartRef - Ref to the chart container
 * @param data - The chart data 
 * @param format - Format to export as (png, svg, csv)
 * @param fileName - Name for the exported file
 */
export const exportChart = (
  chartRef: React.RefObject<HTMLDivElement>,
  data: DataPoint[] | ScatterPoint[],
  format: ExportFormat,
  fileName = 'chart'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!chartRef.current) {
      reject(new Error('Chart reference is not available'));
      return;
    }
    
    try {
      // Find the SVG element in the chart container
      const svgElement = chartRef.current.querySelector('svg');
      
      if (!svgElement && format !== 'csv') {
        reject(new Error('SVG element not found in chart'));
        return;
      }
      
      switch (format) {
        case 'png':
          if (svgElement) {
            exportAsPng(svgElement, fileName)
              .then(resolve)
              .catch(reject);
          }
          break;
        case 'svg':
          if (svgElement) {
            exportAsSvg(svgElement, fileName);
            resolve();
          }
          break;
        case 'csv':
          exportAsCsv(data, fileName);
          resolve();
          break;
        default:
          reject(new Error(`Unsupported export format: ${format}`));
      }
    } catch (error) {
      reject(error);
    }
  });
}; 