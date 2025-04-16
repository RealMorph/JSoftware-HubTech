import React from 'react';
import { List, ListItem } from './List';

/**
 * ListDemo component showcasing different variations of the List component
 */
export const ListDemo: React.FC = () => {
  const handleItemClick = (text: string) => {
    alert(`Clicked on item: ${text}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h2>Basic List</h2>
        <List>
          <List.Item>Item 1</List.Item>
          <List.Item>Item 2</List.Item>
          <List.Item>Item 3</List.Item>
          <List.Item>Item 4</List.Item>
        </List>
      </section>

      <section>
        <h2>Bordered List</h2>
        <List bordered>
          <List.Item>Item 1</List.Item>
          <List.Item>Item 2</List.Item>
          <List.Item>Item 3</List.Item>
          <List.Item>Item 4</List.Item>
        </List>
      </section>

      <section>
        <h2>List with Different Marker Types</h2>
        <List markerType="disc">
          <List.Item>Disc item 1</List.Item>
          <List.Item>Disc item 2</List.Item>
          <List.Item>Disc item 3</List.Item>
        </List>
        <br />
        <List markerType="circle">
          <List.Item>Circle item 1</List.Item>
          <List.Item>Circle item 2</List.Item>
          <List.Item>Circle item 3</List.Item>
        </List>
        <br />
        <List markerType="square">
          <List.Item>Square item 1</List.Item>
          <List.Item>Square item 2</List.Item>
          <List.Item>Square item 3</List.Item>
        </List>
      </section>

      <section>
        <h2>Ordered List</h2>
        <List ordered markerType="decimal">
          <List.Item>First item</List.Item>
          <List.Item>Second item</List.Item>
          <List.Item>Third item</List.Item>
        </List>
        <br />
        <List ordered markerType="lower-alpha">
          <List.Item>Alpha item</List.Item>
          <List.Item>Beta item</List.Item>
          <List.Item>Gamma item</List.Item>
        </List>
        <br />
        <List ordered markerType="upper-roman">
          <List.Item>Roman item I</List.Item>
          <List.Item>Roman item II</List.Item>
          <List.Item>Roman item III</List.Item>
        </List>
      </section>

      <section>
        <h2>List with Different Spacing</h2>
        <h3>Small Spacing</h3>
        <List spacing="small" bordered>
          <List.Item>Item 1</List.Item>
          <List.Item>Item 2</List.Item>
          <List.Item>Item 3</List.Item>
        </List>
        <h3>Medium Spacing (Default)</h3>
        <List spacing="medium" bordered>
          <List.Item>Item 1</List.Item>
          <List.Item>Item 2</List.Item>
          <List.Item>Item 3</List.Item>
        </List>
        <h3>Large Spacing</h3>
        <List spacing="large" bordered>
          <List.Item>Item 1</List.Item>
          <List.Item>Item 2</List.Item>
          <List.Item>Item 3</List.Item>
        </List>
      </section>

      <section>
        <h2>List with Secondary Text</h2>
        <List bordered>
          <List.Item secondaryText="This is additional information for item 1">
            Item with secondary text
          </List.Item>
          <List.Item secondaryText="More details about this item">
            Another item with details
          </List.Item>
          <List.Item secondaryText="Created on April 8, 2023">
            Item with timestamp
          </List.Item>
        </List>
      </section>

      <section>
        <h2>Clickable List</h2>
        <List bordered>
          <List.Item clickable onClick={() => handleItemClick("Clickable item 1")}>
            Clickable item 1
          </List.Item>
          <List.Item clickable onClick={() => handleItemClick("Clickable item 2")}>
            Clickable item 2
          </List.Item>
          <List.Item clickable onClick={() => handleItemClick("Clickable item 3")}>
            Clickable item 3
          </List.Item>
        </List>
      </section>

      <section>
        <h2>List with Icons</h2>
        <List bordered>
          <List.Item icon={<span role="img" aria-label="check">✅</span>}>
            Completed task
          </List.Item>
          <List.Item icon={<span role="img" aria-label="pending">⏳</span>}>
            Pending task
          </List.Item>
          <List.Item icon={<span role="img" aria-label="warning">⚠️</span>}>
            Task with warning
          </List.Item>
          <List.Item icon={<span role="img" aria-label="error">❌</span>}>
            Failed task
          </List.Item>
        </List>
      </section>
    </div>
  );
}; 