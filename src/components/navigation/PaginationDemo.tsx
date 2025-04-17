import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Pagination } from './Pagination';

// Styled components for the demo
const DemoContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const DemoSection = styled.section`
  margin-bottom: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  background-color: white;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #323338;
`;

const Description = styled.p`
  margin-bottom: 20px;
  color: #676879;
`;

const ExampleContainer = styled.div`
  margin-bottom: 24px;
`;

const ExampleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #323338;
`;

const CodeBlock = styled.pre`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  overflow-x: auto;
  color: #1f2937;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  min-width: 120px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const ResultDisplay = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
`;

/**
 * Demo component for the Pagination
 */
const PaginationDemo: React.FC = () => {
  // Basic pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);

  // Configuration options
  const [shape, setShape] = useState<'rounded' | 'square' | 'circular'>('rounded');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [siblingCount, setSiblingCount] = useState(1);
  const [showFirstLast, setShowFirstLast] = useState(true);
  const [showPrevNext, setShowPrevNext] = useState(true);
  const [showPageNumbers, setShowPageNumbers] = useState(true);

  // Custom icons state
  const [customIcons, setCustomIcons] = useState(false);

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Custom icons if enabled
  const prevIcon = customIcons ? '◀' : '‹';
  const nextIcon = customIcons ? '▶' : '›';
  const firstIcon = customIcons ? '⏮' : '«';
  const lastIcon = customIcons ? '⏭' : '»';

  return (
    <DemoContainer>
      <h1>Pagination Component Demo</h1>
      <p>
        This demo showcases the various configurations and capabilities of the Pagination component.
      </p>

      <DemoSection>
        <Title>Configuration Demo</Title>
        <Description>
          Customize the pagination component with different options to see how it behaves.
        </Description>

        <Controls>
          <ControlGroup>
            <Label>Current Page</Label>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={e =>
                setCurrentPage(Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages))
              }
            />
          </ControlGroup>

          <ControlGroup>
            <Label>Total Pages</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={totalPages}
              onChange={e => {
                const newTotal = Math.max(1, parseInt(e.target.value) || 1);
                setTotalPages(newTotal);
                if (currentPage > newTotal) {
                  setCurrentPage(newTotal);
                }
              }}
            />
          </ControlGroup>

          <ControlGroup>
            <Label>Shape</Label>
            <Select value={shape} onChange={e => setShape(e.target.value as any)}>
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
              <option value="circular">Circular</option>
            </Select>
          </ControlGroup>

          <ControlGroup>
            <Label>Size</Label>
            <Select value={size} onChange={e => setSize(e.target.value as any)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Select>
          </ControlGroup>

          <ControlGroup>
            <Label>Siblings</Label>
            <Input
              type="number"
              min={0}
              max={5}
              value={siblingCount}
              onChange={e => setSiblingCount(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </ControlGroup>

          <ControlGroup>
            <Label>
              <Checkbox
                type="checkbox"
                checked={showFirstLast}
                onChange={() => setShowFirstLast(!showFirstLast)}
              />
              Show First/Last
            </Label>
          </ControlGroup>

          <ControlGroup>
            <Label>
              <Checkbox
                type="checkbox"
                checked={showPrevNext}
                onChange={() => setShowPrevNext(!showPrevNext)}
              />
              Show Prev/Next
            </Label>
          </ControlGroup>

          <ControlGroup>
            <Label>
              <Checkbox
                type="checkbox"
                checked={showPageNumbers}
                onChange={() => setShowPageNumbers(!showPageNumbers)}
              />
              Show Page Numbers
            </Label>
          </ControlGroup>

          <ControlGroup>
            <Label>
              <Checkbox
                type="checkbox"
                checked={customIcons}
                onChange={() => setCustomIcons(!customIcons)}
              />
              Custom Icons
            </Label>
          </ControlGroup>
        </Controls>

        <ExampleContainer>
          <ExampleTitle>Live Preview</ExampleTitle>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            shape={shape}
            size={size}
            siblingCount={siblingCount}
            showFirstLast={showFirstLast}
            showPrevNext={showPrevNext}
            showPageNumbers={showPageNumbers}
            prevLabel={prevIcon}
            nextLabel={nextIcon}
            firstLabel={firstIcon}
            lastLabel={lastIcon}
          />

          <ResultDisplay>
            <p>Current Page: {currentPage}</p>
            <CodeBlock>{`<Pagination
  currentPage={${currentPage}}
  totalPages={${totalPages}}
  onPageChange={handlePageChange}
  shape="${shape}"
  size="${size}"
  siblingCount={${siblingCount}}
  showFirstLast={${showFirstLast}}
  showPrevNext={${showPrevNext}}
  showPageNumbers={${showPageNumbers}}
  ${
    customIcons
      ? `prevLabel="${prevIcon}"
  nextLabel="${nextIcon}"
  firstLabel="${firstIcon}"
  lastLabel="${lastIcon}"`
      : ''
  }
/>`}</CodeBlock>
          </ResultDisplay>
        </ExampleContainer>
      </DemoSection>

      <DemoSection>
        <Title>Common Examples</Title>
        <Description>Here are some common examples of pagination configurations.</Description>

        <ExampleContainer>
          <ExampleTitle>Basic Pagination</ExampleTitle>
          <CodeBlock>{`<Pagination
  currentPage={5}
  totalPages={10}
  onPageChange={handlePageChange}
/>`}</CodeBlock>

          <Pagination
            currentPage={5}
            totalPages={10}
            onPageChange={page => console.log(`Go to page ${page}`)}
          />
        </ExampleContainer>

        <ExampleContainer>
          <ExampleTitle>Compact Pagination</ExampleTitle>
          <CodeBlock>{`<Pagination
  currentPage={5}
  totalPages={10}
  onPageChange={handlePageChange}
  size="small"
  showFirstLast={false}
/>`}</CodeBlock>

          <Pagination
            currentPage={5}
            totalPages={10}
            onPageChange={page => console.log(`Go to page ${page}`)}
            size="small"
            showFirstLast={false}
          />
        </ExampleContainer>

        <ExampleContainer>
          <ExampleTitle>Circular Buttons</ExampleTitle>
          <CodeBlock>{`<Pagination
  currentPage={5}
  totalPages={10}
  onPageChange={handlePageChange}
  shape="circular"
/>`}</CodeBlock>

          <Pagination
            currentPage={5}
            totalPages={10}
            onPageChange={page => console.log(`Go to page ${page}`)}
            shape="circular"
          />
        </ExampleContainer>

        <ExampleContainer>
          <ExampleTitle>Many Pages</ExampleTitle>
          <CodeBlock>{`<Pagination
  currentPage={50}
  totalPages={100}
  onPageChange={handlePageChange}
  siblingCount={1}
/>`}</CodeBlock>

          <Pagination
            currentPage={50}
            totalPages={100}
            onPageChange={page => console.log(`Go to page ${page}`)}
            siblingCount={1}
          />
        </ExampleContainer>

        <ExampleContainer>
          <ExampleTitle>Simple Previous/Next</ExampleTitle>
          <CodeBlock>{`<Pagination
  currentPage={5}
  totalPages={10}
  onPageChange={handlePageChange}
  showPageNumbers={false}
  prevLabel="Previous"
  nextLabel="Next"
/>`}</CodeBlock>

          <Pagination
            currentPage={5}
            totalPages={10}
            onPageChange={page => console.log(`Go to page ${page}`)}
            showPageNumbers={false}
            prevLabel="Previous"
            nextLabel="Next"
          />
        </ExampleContainer>
      </DemoSection>
    </DemoContainer>
  );
};

export { PaginationDemo };
