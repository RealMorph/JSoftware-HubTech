#!/usr/bin/env node

/**
 * Dependency Graph Visualization
 * 
 * This script analyzes project dependencies and creates visualizations
 * to help understand module relationships and optimize the build.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const config = {
  outputDir: path.resolve(__dirname, '../../dist'),
  outputHtml: path.resolve(__dirname, '../../dist/dependency-graph.html'),
  outputJson: path.resolve(__dirname, '../../dist/dependency-graph.json'),
  srcDir: path.resolve(__dirname, '../../src'),
  entryPoints: [
    path.resolve(__dirname, '../../src/index.ts'),
    path.resolve(__dirname, '../../src/index.tsx'),
  ].filter(p => fs.existsSync(p)),
};

/**
 * Parse source files to build dependency graph
 */
function buildDependencyGraph() {
  console.log(chalk.blue('Building dependency graph...'));
  
  try {
    const graph = {
      nodes: [],
      edges: [],
    };
    
    // Get all TS/TSX files
    const files = findAllFiles(config.srcDir);
    const nodeMap = {};
    
    // Create nodes
    files.forEach((file, index) => {
      const relativePath = path.relative(config.srcDir, file);
      const node = {
        id: index,
        path: relativePath,
        isEntryPoint: config.entryPoints.includes(file),
        dependencies: [],
        dependents: [],
      };
      
      nodeMap[file] = node;
      graph.nodes.push(node);
    });
    
    // Find dependencies between files
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const node = nodeMap[file];
      
      // Find import statements
      const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
      
      importMatches.forEach(importStmt => {
        // Extract import path
        const matches = importStmt.match(/from\s+['"]([^'"]+)['"]/);
        if (!matches) return;
        
        let importPath = matches[1];
        
        // Skip node_modules imports
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          return;
        }
        
        // Resolve relative imports
        let resolvedPath;
        try {
          if (importPath.startsWith('.')) {
            resolvedPath = path.resolve(path.dirname(file), importPath);
          } else if (importPath.startsWith('/')) {
            resolvedPath = path.resolve(config.srcDir, importPath.substring(1));
          }
          
          // Handle imports without extensions
          if (resolvedPath && !fs.existsSync(resolvedPath)) {
            const extensions = ['.ts', '.tsx', '.js', '.jsx'];
            for (const ext of extensions) {
              const pathWithExt = `${resolvedPath}${ext}`;
              if (fs.existsSync(pathWithExt)) {
                resolvedPath = pathWithExt;
                break;
              }
            }
            
            // Check for index files
            if (!fs.existsSync(resolvedPath)) {
              const indexExts = ['/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
              for (const ext of indexExts) {
                const indexPath = `${resolvedPath}${ext}`;
                if (fs.existsSync(indexPath)) {
                  resolvedPath = indexPath;
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Could not resolve import ${importPath} in ${file}`));
          return;
        }
        
        // Add dependency if resolved
        if (resolvedPath && nodeMap[resolvedPath]) {
          const dependency = nodeMap[resolvedPath];
          node.dependencies.push(dependency.id);
          dependency.dependents.push(node.id);
          
          graph.edges.push({
            source: node.id,
            target: dependency.id,
          });
        }
      });
    });
    
    return graph;
  } catch (error) {
    console.error(chalk.red('Error building dependency graph:'), error.message);
    return { nodes: [], edges: [] };
  }
}

/**
 * Find all TypeScript files recursively
 */
function findAllFiles(dir, result = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip test files and node_modules
    if (
      file.includes('node_modules') ||
      file.includes('.test.') ||
      file.includes('.spec.')
    ) {
      return;
    }
    
    if (stat.isDirectory()) {
      findAllFiles(filePath, result);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      result.push(filePath);
    }
  });
  
  return result;
}

/**
 * Analyze the dependency graph for insights
 */
function analyzeDependencyGraph(graph) {
  console.log(chalk.blue('Analyzing dependency graph...'));
  
  const analysis = {
    totalFiles: graph.nodes.length,
    totalDependencies: graph.edges.length,
    entryPoints: graph.nodes.filter(n => n.isEntryPoint).length,
    circularDependencies: [],
    highlyConnectedModules: [],
    isolatedModules: [],
  };
  
  // Find circular dependencies
  graph.nodes.forEach(node => {
    const stack = [];
    const visited = new Set();
    
    function detectCircular(currentNode, path = []) {
      if (stack.includes(currentNode.id)) {
        const cycle = path.slice(stack.indexOf(currentNode.id));
        cycle.push(currentNode.id);
        
        const cyclePaths = cycle.map(id => graph.nodes.find(n => n.id === id).path);
        analysis.circularDependencies.push(cyclePaths);
        return;
      }
      
      if (visited.has(currentNode.id)) {
        return;
      }
      
      visited.add(currentNode.id);
      stack.push(currentNode.id);
      
      currentNode.dependencies.forEach(depId => {
        const dep = graph.nodes.find(n => n.id === depId);
        detectCircular(dep, [...path, currentNode.id]);
      });
      
      stack.pop();
    }
    
    detectCircular(node);
  });
  
  // Deduplicate circular dependencies
  analysis.circularDependencies = analysis.circularDependencies.filter(
    (cycle, index, self) => 
      index === self.findIndex(c => JSON.stringify(c) === JSON.stringify(cycle))
  );
  
  // Find highly connected modules (many dependencies or dependents)
  graph.nodes.forEach(node => {
    if (node.dependencies.length > 10 || node.dependents.length > 10) {
      analysis.highlyConnectedModules.push({
        path: node.path,
        dependencies: node.dependencies.length,
        dependents: node.dependents.length,
      });
    }
  });
  
  // Find isolated modules (no dependencies and not imported)
  graph.nodes.forEach(node => {
    if (node.dependencies.length === 0 && node.dependents.length === 0 && !node.isEntryPoint) {
      analysis.isolatedModules.push(node.path);
    }
  });
  
  return analysis;
}

/**
 * Generate HTML visualization
 */
function generateVisualization(graph, analysis) {
  console.log(chalk.blue('Generating visualization...'));
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dependency Graph Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { 
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      display: flex;
      flex-direction: column;
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
    }
    h1, h2, h3 {
      color: #333;
    }
    #graph {
      border: 1px solid #ddd;
      border-radius: 4px;
      height: 600px;
      margin-bottom: 20px;
    }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .stats-card {
      background-color: #f9f9f9;
      border-radius: 4px;
      padding: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .node {
      cursor: pointer;
    }
    .link {
      stroke: #999;
      stroke-opacity: 0.6;
    }
    .entry-point {
      fill: #4caf50;
    }
    .normal-module {
      fill: #2196f3;
    }
    .highly-connected {
      fill: #f44336;
    }
    .isolated {
      fill: #9e9e9e;
    }
    .circular-module {
      fill: #ff9800;
    }
    .panel {
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Dependency Graph Visualization</h1>
    
    <div class="stats">
      <div class="stats-card">
        <h3>Summary</h3>
        <p>Total Files: <strong>${analysis.totalFiles}</strong></p>
        <p>Total Dependencies: <strong>${analysis.totalDependencies}</strong></p>
        <p>Entry Points: <strong>${analysis.entryPoints}</strong></p>
      </div>
      <div class="stats-card">
        <h3>Potential Issues</h3>
        <p>Circular Dependencies: <strong>${analysis.circularDependencies.length}</strong></p>
        <p>Highly Connected Modules: <strong>${analysis.highlyConnectedModules.length}</strong></p>
        <p>Isolated Modules: <strong>${analysis.isolatedModules.length}</strong></p>
      </div>
    </div>
    
    <div id="graph"></div>
    
    <div class="panel">
      <h2>Legend</h2>
      <div style="display: flex; gap: 20px;">
        <div><span style="color: #4caf50;">●</span> Entry Point</div>
        <div><span style="color: #2196f3;">●</span> Normal Module</div>
        <div><span style="color: #f44336;">●</span> Highly Connected Module</div>
        <div><span style="color: #ff9800;">●</span> Circular Dependency</div>
        <div><span style="color: #9e9e9e;">●</span> Isolated Module</div>
      </div>
    </div>
    
    <div class="panel">
      <h2>Circular Dependencies</h2>
      ${analysis.circularDependencies.length === 0 
        ? '<p>No circular dependencies found.</p>' 
        : `<table>
            <tr>
              <th>Cycle</th>
            </tr>
            ${analysis.circularDependencies.map(cycle => 
              `<tr><td>${cycle.join(' → ')} → ${cycle[0]}</td></tr>`
            ).join('')}
          </table>`}
    </div>
    
    <div class="panel">
      <h2>Highly Connected Modules</h2>
      ${analysis.highlyConnectedModules.length === 0 
        ? '<p>No highly connected modules found.</p>' 
        : `<table>
            <tr>
              <th>Module</th>
              <th>Dependencies</th>
              <th>Dependents</th>
            </tr>
            ${analysis.highlyConnectedModules.map(module => 
              `<tr>
                <td>${module.path}</td>
                <td>${module.dependencies}</td>
                <td>${module.dependents}</td>
              </tr>`
            ).join('')}
          </table>`}
    </div>
    
    <div class="panel">
      <h2>Isolated Modules</h2>
      ${analysis.isolatedModules.length === 0 
        ? '<p>No isolated modules found.</p>' 
        : `<table>
            <tr>
              <th>Module</th>
            </tr>
            ${analysis.isolatedModules.map(module => 
              `<tr><td>${module}</td></tr>`
            ).join('')}
          </table>`}
    </div>
  </div>

  <script>
    // Graph data
    const graphData = ${JSON.stringify(graph)};
    const analysisData = ${JSON.stringify(analysis)};
    
    // Set up the visualization
    const width = document.getElementById('graph').clientWidth;
    const height = 600;
    
    // Create SVG
    const svg = d3.select('#graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Create force simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));
    
    // Create the links
    const link = svg.append('g')
      .selectAll('line')
      .data(graphData.edges)
      .enter()
      .append('line')
      .attr('class', 'link');
    
    // Create the nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => getNodeSize(d))
      .attr('class', d => getNodeClass(d))
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip);
    
    // Add tooltips
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('padding', '10px')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('box-shadow', '0 2px 5px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('transition', 'opacity 0.3s');
    
    function showTooltip(event, d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      tooltip.html(\`
        <strong>Path:</strong> \${d.path}<br>
        <strong>Dependencies:</strong> \${d.dependencies.length}<br>
        <strong>Dependents:</strong> \${d.dependents.length}
      \`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    }
    
    function hideTooltip() {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    }
    
    // Helper functions for node visualization
    function getNodeClass(d) {
      const inCircular = analysisData.circularDependencies.some(cycle => 
        cycle.includes(d.path)
      );
      
      if (inCircular) return 'circular-module';
      if (d.isEntryPoint) return 'entry-point';
      if (d.dependencies.length === 0 && d.dependents.length === 0) return 'isolated';
      if (d.dependencies.length > 10 || d.dependents.length > 10) return 'highly-connected';
      return 'normal-module';
    }
    
    function getNodeSize(d) {
      if (d.isEntryPoint) return 10;
      const size = 4 + (d.dependencies.length + d.dependents.length) / 5;
      return Math.min(size, 12);
    }
    
    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
        
      node
        .attr('cx', d => d.x = Math.max(20, Math.min(width - 20, d.x)))
        .attr('cy', d => d.y = Math.max(20, Math.min(height - 20, d.y)));
    });
    
    // Drag functionality
    node.call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));
      
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  </script>
</body>
</html>
  `;
  
  // Save as HTML file
  fs.writeFileSync(config.outputHtml, html);
  
  // Save as JSON for reuse
  fs.writeFileSync(config.outputJson, JSON.stringify({ graph, analysis }, null, 2));
  
  console.log(chalk.green(`Visualization generated: ${config.outputHtml}`));
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(analysis) {
  console.log(chalk.blue('Generating recommendations...'));
  
  const recommendations = [];
  
  // Check for circular dependencies
  if (analysis.circularDependencies.length > 0) {
    recommendations.push({
      issue: 'Circular Dependencies',
      details: `Found ${analysis.circularDependencies.length} circular dependencies.`,
      recommendation: 'Refactor these modules to eliminate circular dependencies, which can cause maintenance issues and slow down build time.'
    });
  }
  
  // Check for highly connected modules
  if (analysis.highlyConnectedModules.length > 0) {
    recommendations.push({
      issue: 'Highly Connected Modules',
      details: `Found ${analysis.highlyConnectedModules.length} modules with many connections.`,
      recommendation: 'Consider breaking down these modules into smaller, more focused components to reduce coupling.'
    });
  }
  
  // Check for isolated modules
  if (analysis.isolatedModules.length > 0) {
    recommendations.push({
      issue: 'Isolated Modules',
      details: `Found ${analysis.isolatedModules.length} modules that are not imported anywhere.`,
      recommendation: 'These modules might be unused and could be candidates for removal.'
    });
  }
  
  return recommendations;
}

/**
 * Main function
 */
function main() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  // Build the dependency graph
  const graph = buildDependencyGraph();
  
  // Analyze the graph
  const analysis = analyzeDependencyGraph(graph);
  
  // Generate HTML visualization
  generateVisualization(graph, analysis);
  
  // Generate recommendations
  const recommendations = generateRecommendations(analysis);
  
  // Print summary
  console.log(chalk.cyan('\nDependency Graph Analysis Summary:'));
  console.log(`- Total Files: ${analysis.totalFiles}`);
  console.log(`- Total Dependencies: ${analysis.totalDependencies}`);
  console.log(`- Circular Dependencies: ${analysis.circularDependencies.length}`);
  console.log(`- Highly Connected Modules: ${analysis.highlyConnectedModules.length}`);
  console.log(`- Isolated Modules: ${analysis.isolatedModules.length}`);
  
  if (recommendations.length > 0) {
    console.log(chalk.yellow('\nRecommendations:'));
    recommendations.forEach((rec, i) => {
      console.log(`${i+1}. ${chalk.bold(rec.issue)}: ${rec.recommendation}`);
    });
  }
  
  console.log(chalk.green(`\nOpen ${config.outputHtml} in your browser to view the visualization.`));
}

// Run the analysis
main(); 