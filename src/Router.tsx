import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { DirectThemeProvider } from './core/theme/DirectThemeProvider';
import { ThemeServiceProvider } from './core/theme/ThemeServiceProvider';
import { inMemoryThemeService } from './core/theme/theme-context';
import { ProtectedRoute } from './core/router/ProtectedRoute';
import { FormDemo } from './components/base/FormDemo';
import { DataDisplayDemo } from './components/base/DataDisplayDemo';
import DatePickerDemoPage from './pages/DatePickerDemoPage';
import TimePickerDemoPage from './pages/TimePickerDemoPage';
import LayoutDemo from './components/layout/LayoutDemo';
import FeedbackDemoPage from './pages/FeedbackDemoPage';
import TabsDemoPage from './pages/TabsDemoPage';
import NavigationDemoPage from './pages/NavigationDemoPage';
import { DataVisualizationDemo } from './components/data-visualization';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThemeSwitch from './components/theme/ThemeSwitch';

// Styled Components
const Container = styled.div<{ $themeStyles?: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
`;

const Header = styled.header<{ $themeStyles?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.md};
`;

const Logo = styled.div<{ $themeStyles?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
`;

const LogoIcon = styled.span<{ $themeStyles?: boolean }>`
  background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: ${({ theme }) => theme.colors.background};
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Nav = styled.nav<{ $themeStyles?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const NavLink = styled.a<{ $active?: boolean; $themeStyles?: boolean }>`
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : typeof theme.colors.text === 'object' 
      ? theme.colors.text.secondary 
      : theme.colors.text};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all ${({ theme }) => theme.transitions.duration.normal} ${({ theme }) => theme.transitions.timing.easeInOut};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;

const Title = styled.h1<{ $themeStyles?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => 
    typeof theme.colors.text === 'object' 
      ? theme.colors.text.primary 
      : theme.colors.text};
`;

const Subtitle = styled.p<{ $themeStyles?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => 
    typeof theme.colors.text === 'object' 
      ? theme.colors.text.secondary 
      : theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Grid = styled.div<{ $themeStyles?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

// Component that displays a list of available demos with modern styling
const DemoHome = () => {
  return (
    <Container>
      <Header>
        <Logo>
          <LogoIcon>M</LogoIcon>
          Component Library
        </Logo>
        <Nav>
          <NavLink href="#" $active>Home</NavLink>
          <NavLink href="#">Documentation</NavLink>
          <NavLink href="#">Theme</NavLink>
        </Nav>
      </Header>

      <Title>Component Demos</Title>
      <Subtitle>
        Explore our component library - select a category to view interactive demos
      </Subtitle>

      <Grid>
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
      </Grid>

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
    </Container>
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
          <ThemeSwitch />
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
const Router = () => {
  return (
    <ThemeServiceProvider themeService={inMemoryThemeService}>
      <DirectThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DemoHome />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/demos/data-display" element={<DataDisplayDemo />} />
            <Route path="/demos/form" element={<FormDemo />} />
            <Route path="/demos/date-picker" element={<DatePickerDemoPage />} />
            <Route path="/demos/time-picker" element={<TimePickerDemoPage />} />
            <Route path="/demos/layout" element={<LayoutDemo />} />
            <Route path="/demos/feedback" element={<FeedbackDemoPage />} />
            <Route path="/demos/tabs" element={<TabsDemoPage />} />
            <Route path="/demos/navigation" element={<NavigationDemoPage />} />
            <Route path="/demos/data-visualization" element={<DataVisualizationDemo />} />
          </Routes>
        </BrowserRouter>
      </DirectThemeProvider>
    </ThemeServiceProvider>
  );
};

export default Router;
