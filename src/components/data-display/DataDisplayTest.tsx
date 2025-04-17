import React from 'react';
import { TableDemo } from './TableDemo';
import { ListDemo } from './ListDemo';
import { CardDemo } from './CardDemo';

/**
 * Test component that renders all data display component demos
 */
export const DataDisplayTest: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Data Display Components Test</h1>

      <section style={{ marginBottom: '3rem' }}>
        <h1>Card Components</h1>
        <CardDemo />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h1>List Components</h1>
        <ListDemo />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h1>Table Components</h1>
        <TableDemo />
      </section>
    </div>
  );
};
