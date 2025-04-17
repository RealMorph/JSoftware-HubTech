import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid, GridItem, Row, Col } from '../Grid';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { extendedMockTheme } from '../../../core/theme/__mocks__/mockTheme';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={extendedMockTheme}>{ui}</DirectThemeProvider>);
};

describe('Grid components', () => {
  test('Grid renders children correctly', () => {
    renderWithTheme(
      <Grid testId="grid">
        <div data-testid="grid-child">Grid Child</div>
      </Grid>
    );

    expect(screen.getByTestId('grid')).toBeInTheDocument();
    expect(screen.getByTestId('grid-child')).toBeInTheDocument();
    expect(screen.getByText('Grid Child')).toBeInTheDocument();
  });

  test('GridItem renders children correctly', () => {
    renderWithTheme(
      <Grid testId="grid">
        <GridItem testId="grid-item">
          <div data-testid="grid-item-child">Grid Item Child</div>
        </GridItem>
      </Grid>
    );

    expect(screen.getByTestId('grid-item')).toBeInTheDocument();
    expect(screen.getByTestId('grid-item-child')).toBeInTheDocument();
    expect(screen.getByText('Grid Item Child')).toBeInTheDocument();
  });

  test('Row renders children correctly', () => {
    renderWithTheme(
      <Row testId="row">
        <div data-testid="row-child">Row Child</div>
      </Row>
    );

    expect(screen.getByTestId('row')).toBeInTheDocument();
    expect(screen.getByTestId('row-child')).toBeInTheDocument();
    expect(screen.getByText('Row Child')).toBeInTheDocument();
  });

  test('Col renders children correctly', () => {
    renderWithTheme(
      <Row>
        <Col testId="col" span={6}>
          <div data-testid="col-child">Col Child</div>
        </Col>
      </Row>
    );

    expect(screen.getByTestId('col')).toBeInTheDocument();
    expect(screen.getByTestId('col-child')).toBeInTheDocument();
    expect(screen.getByText('Col Child')).toBeInTheDocument();
  });

  test('Grid applies columns and gap props correctly', () => {
    renderWithTheme(
      <Grid testId="grid" columns={3} gap={16}>
        <div />
      </Grid>
    );

    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toHaveStyle('display: grid');
    expect(gridElement).toHaveStyle('grid-template-columns: repeat(3, 1fr)');
  });

  test('Row applies flex props correctly', () => {
    renderWithTheme(
      <Row testId="row" fullWidth gap={16}>
        <div />
      </Row>
    );

    const rowElement = screen.getByTestId('row');
    expect(rowElement).toHaveStyle('display: flex');
    expect(rowElement).toHaveStyle('flex-direction: row');
    expect(rowElement).toHaveStyle('width: 100%');
  });

  test('Col applies span correctly', () => {
    renderWithTheme(
      <Row>
        <Col testId="col" span={6}>
          <div />
        </Col>
      </Row>
    );

    const colElement = screen.getByTestId('col');
    expect(colElement).toHaveStyle('display: flex');
    expect(colElement).toHaveStyle('flex-direction: column');
    // Width should be 50% (6/12 * 100%)
    expect(colElement).toHaveStyle('width: 50%');
  });
});
