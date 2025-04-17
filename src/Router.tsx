import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { UnifiedThemeProvider } from './core/theme/theme-wrapper';
import { FormDemo } from './components/base/FormDemo';
import { DataDisplayDemo } from './components/base/DataDisplayDemo';
import DatePickerDemoPage from './pages/DatePickerDemoPage';
import TimePickerDemoPage from './pages/TimePickerDemoPage';
import LayoutDemo from './components/layout/LayoutDemo';
import FeedbackDemoPage from './pages/FeedbackDemoPage';
import TabsDemoPage from './pages/TabsDemoPage';
import NavigationDemoPage from './pages/NavigationDemoPage';
import { DataVisualizationDemo } from './components/data-visualization';

// Component that displays a list of available demos with modern styling
const DemoHome = () => {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header with logo and navigation */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '36px',
          borderBottom: '1px solid #e6e9ef',
          paddingBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0073ea',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(to right, #0073ea, #00c2ff)',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              boxShadow: '0 4px 8px rgba(0, 115, 234, 0.2)',
            }}
          >
            M
          </span>
          Component Library
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: '#0073ea', textDecoration: 'none', fontWeight: 500 }}>
            Home
          </a>
          <a href="#" style={{ color: '#676879', textDecoration: 'none', fontWeight: 500 }}>
            Documentation
          </a>
          <a href="#" style={{ color: '#676879', textDecoration: 'none', fontWeight: 500 }}>
            Theme
          </a>
        </nav>
      </header>

      <h1
        style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#323338',
        }}
      >
        Component Demos
      </h1>
      <p
        style={{
          fontSize: '16px',
          color: '#676879',
          marginBottom: '40px',
        }}
      >
        Explore our component library - select a category to view interactive demos
      </p>

      {/* Component Categories in a modern card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Data Display Card */}
        <div
          style={{
            borderRadius: '8px',
            border: '1px solid #e6e9ef',
            boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            height: '100%',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
        >
          <div
            style={{
              height: '160px',
              background: 'linear-gradient(135deg, #0073ea, #00c2ff)',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '20px',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                color: '#0073ea',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              <span>📊</span>
            </div>
          </div>
          <div style={{ padding: '24px 20px 20px' }}>
            <h2
              style={{
                margin: '8px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#323338',
              }}
            >
              Data Display Components
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#676879',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              Tables, Lists, and Cards demonstrating data display patterns for modern interfaces.
            </p>
            <Link
              to="/demos/data-display"
              style={{
                display: 'inline-block',
                backgroundColor: '#0073ea',
                color: 'white',
                padding: '8px 16px',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 2px 6px rgba(0, 115, 234, 0.3)',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#0060c7';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = '#0073ea';
              }}
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Form Components Card */}
        <div
          style={{
            borderRadius: '8px',
            border: '1px solid #e6e9ef',
            boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            height: '100%',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
        >
          <div
            style={{
              height: '160px',
              background: 'linear-gradient(135deg, #579bfc, #9c5ffd)',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '20px',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                color: '#9c5ffd',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              <span>📝</span>
            </div>
          </div>
          <div style={{ padding: '24px 20px 20px' }}>
            <h2
              style={{
                margin: '8px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#323338',
              }}
            >
              Form Components
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#676879',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              Various form inputs with validation, styling and state management for user input.
            </p>
            <Link
              to="/demos/form"
              style={{
                display: 'inline-block',
                backgroundColor: '#9c5ffd',
                color: 'white',
                padding: '8px 16px',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 2px 6px rgba(156, 95, 253, 0.3)',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#8645e0';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = '#9c5ffd';
              }}
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Date/Time Components Card */}
        <div
          style={{
            borderRadius: '8px',
            border: '1px solid #e6e9ef',
            boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            height: '100%',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
        >
          <div
            style={{
              height: '160px',
              background: 'linear-gradient(135deg, #00c875, #00a98c)',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '20px',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                color: '#00c875',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              <span>📅</span>
            </div>
          </div>
          <div style={{ padding: '24px 20px 20px' }}>
            <h2
              style={{
                margin: '8px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#323338',
              }}
            >
              Date & Time Components
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#676879',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              Calendar, date picker, and time picker components for date and time selection.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                to="/demos/date-picker"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#00c875',
                  color: 'white',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0, 200, 117, 0.3)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#00a65b';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#00c875';
                }}
              >
                Date Picker
              </Link>
              <Link
                to="/demos/time-picker"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#00c875',
                  color: 'white',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0, 200, 117, 0.3)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#00a65b';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#00c875';
                }}
              >
                Time Picker
              </Link>
            </div>
          </div>
        </div>

        {/* Layout Components Card */}
        <div
          style={{
            borderRadius: '8px',
            border: '1px solid #e6e9ef',
            boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            height: '100%',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
        >
          <div
            style={{
              height: '160px',
              background: 'linear-gradient(135deg, #00b884, #00d68f)',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '20px',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                color: '#00b884',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              <span>📐</span>
            </div>
          </div>
          <div style={{ padding: '24px 20px 20px' }}>
            <h2
              style={{
                margin: '8px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#323338',
              }}
            >
              Layout Components
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#676879',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              Grid, Flex, and Spacing components for building responsive layouts and interfaces.
            </p>
            <Link
              to="/demos/layout"
              style={{
                display: 'inline-block',
                backgroundColor: '#00b884',
                color: 'white',
                padding: '8px 16px',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 2px 6px rgba(0, 184, 132, 0.3)',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#00a376';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = '#00b884';
              }}
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Feedback Components Card */}
        <div
          style={{
            borderRadius: '8px',
            border: '1px solid #e6e9ef',
            boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            height: '100%',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
        >
          <div
            style={{
              height: '160px',
              background: 'linear-gradient(135deg, #ff642e, #ff8c42)',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '20px',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                color: '#ff642e',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              <span>🔔</span>
            </div>
          </div>
          <div style={{ padding: '24px 20px 20px' }}>
            <h2
              style={{
                margin: '8px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#323338',
              }}
            >
              Feedback Components
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#676879',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              Toast notifications, progress indicators, and modal dialogs for user feedback.
            </p>
            <Link
              to="/demos/feedback"
              style={{
                display: 'inline-block',
                backgroundColor: '#ff642e',
                color: 'white',
                padding: '8px 16px',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 2px 6px rgba(255, 100, 46, 0.3)',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#e55a29';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = '#ff642e';
              }}
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Navigation Components Card */}
        <div
          style={{
            borderRadius: '8px',
            border: '1px solid #e6e9ef',
            boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            height: '100%',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
        >
          <div
            style={{
              height: '160px',
              background: 'linear-gradient(135deg, #00c875, #00a98c)',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '20px',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                color: '#00c875',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              <span>📋</span>
            </div>
          </div>
          <div style={{ padding: '24px 20px 20px' }}>
            <h2
              style={{
                margin: '8px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#323338',
              }}
            >
              Navigation Components
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#676879',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              Tabs, breadcrumbs, and other navigation elements for organizing content.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                to="/demos/tabs"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#00c875',
                  color: 'white',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0, 200, 117, 0.3)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#00a65b';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#00c875';
                }}
              >
                Tabs
              </Link>
              <Link
                to="/demos/navigation"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#00c875',
                  color: 'white',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0, 200, 117, 0.3)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#00a65b';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#00c875';
                }}
              >
                Breadcrumbs
              </Link>
            </div>
          </div>
        </div>

        {/* Data Visualization Card */}
        <div
          style={{
            borderRadius: '8px',
            border: '1px solid #e6e9ef',
            boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            height: '100%',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
        >
          <div
            style={{
              height: '160px',
              background: 'linear-gradient(135deg, #ff6b6b, #ff9e7d)',
              padding: '20px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '20px',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                color: '#ff6b6b',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              <span>📈</span>
            </div>
          </div>
          <div style={{ padding: '24px 20px 20px' }}>
            <h2
              style={{
                margin: '8px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#323338',
              }}
            >
              Data Visualization
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#676879',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              Charts, graphs, maps and other visualization components for displaying data-driven
              insights.
            </p>
            <Link
              to="/demos/visualization"
              style={{
                display: 'inline-block',
                backgroundColor: '#ff6b6b',
                color: 'white',
                padding: '8px 16px',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 2px 6px rgba(255, 107, 107, 0.3)',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#e05252';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = '#ff6b6b';
              }}
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div
        style={{
          marginTop: '60px',
          padding: '32px',
          backgroundColor: '#f5f6f8',
          borderRadius: '12px',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '16px',
            color: '#323338',
          }}
        >
          About the Component Library
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: '#676879',
            marginBottom: '16px',
            lineHeight: 1.6,
          }}
        >
          This component library is designed to provide a modern, consistent UI for building web
          applications. All components are built with React and follow best practices for
          accessibility and performance.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '24px',
          }}
        >
          <a
            href="#"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#0073ea',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '14px',
            }}
          >
            View Documentation →
          </a>
          <a
            href="#"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#0073ea',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '14px',
            }}
          >
            GitHub Repository →
          </a>
        </div>
      </div>
    </div>
  );
};

// Layout wrapper for all demo pages that includes a back button and a modern header
const DemoLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header with navigation */}
      <header
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e6e9ef',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#0073ea',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(to right, #0073ea, #00c2ff)',
                color: 'white',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '10px',
                boxShadow: '0 2px 4px rgba(0, 115, 234, 0.2)',
                fontSize: '14px',
              }}
            >
              M
            </span>
            Component Library
          </div>
          <Link
            to="/demos"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#0073ea',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '14px',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '18px' }}>←</span> Back to Demo List
          </Link>
        </div>
      </header>

      {/* Main content with proper spacing */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e6e9ef',
          padding: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#676879',
          marginTop: '40px',
        }}
      >
        © 2025 Component Library · Built with React
      </footer>
    </div>
  );
};

// Main Router component
const AppRouter = () => {
  return (
    <BrowserRouter>
      <UnifiedThemeProvider>
        <Routes>
          <Route path="/" element={<DemoHome />} />
          <Route path="/demos" element={<DemoHome />} />
          <Route
            path="/demos/form"
            element={
              <DemoLayout>
                <FormDemo />
              </DemoLayout>
            }
          />
          <Route
            path="/demos/data-display"
            element={
              <DemoLayout>
                <DataDisplayDemo />
              </DemoLayout>
            }
          />
          <Route
            path="/demos/date-picker"
            element={
              <DemoLayout>
                <DatePickerDemoPage />
              </DemoLayout>
            }
          />
          <Route
            path="/demos/time-picker"
            element={
              <DemoLayout>
                <TimePickerDemoPage />
              </DemoLayout>
            }
          />
          <Route
            path="/demos/layout"
            element={
              <DemoLayout>
                <LayoutDemo />
              </DemoLayout>
            }
          />
          <Route
            path="/demos/feedback"
            element={
              <DemoLayout>
                <FeedbackDemoPage />
              </DemoLayout>
            }
          />
          <Route
            path="/demos/tabs"
            element={
              <DemoLayout>
                <TabsDemoPage />
              </DemoLayout>
            }
          />
          <Route
            path="/demos/navigation"
            element={
              <DemoLayout>
                <NavigationDemoPage />
              </DemoLayout>
            }
          />
          <Route
            path="/demos/visualization"
            element={
              <DemoLayout>
                <DataVisualizationDemo />
              </DemoLayout>
            }
          />
        </Routes>
      </UnifiedThemeProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
