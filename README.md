# ONLINE-APP-FRONTEND

# Universal Web Engine Platform

A comprehensive web engine platform that serves as a versatile foundation for various types of web applications, including e-commerce storefronts, collaborative web apps, and content management systems.

## Features

- **User Backend**: Complete user management system with authentication, profiles, and admin controls
- **Subscription & Payment**: Multi-gateway payment processing and subscription management
- **Collaboration**: Real-time multi-user collaboration with role-based permissions
- **Project Management**: Universal project boards with drag-and-drop interface
- **Multimedia Support**: Rich media handling with cloud storage integration
- **Performance**: Optimized for speed with SSR, PWA capabilities, and caching
- **Security**: Enterprise-grade security with encryption and compliance features

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT with 2FA support
- **Real-time**: WebSocket
- **Media Storage**: AWS S3/Cloudinary
- **Payment Processing**: Stripe/PayPal
- **Caching**: Redis
- **Search**: Elasticsearch

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd web-engine
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
```bash
# Frontend (.env.local)
cp frontend/.env.example frontend/.env.local

# Backend (.env)
cp backend/.env.example backend/.env
```

4. Start the development servers:
```bash
# Start frontend (from frontend directory)
npm run dev

# Start backend (from backend directory)
npm run dev
```

## Project Structure

```
web-engine/
├── frontend/           # Next.js frontend application
├── backend/           # Express backend server
├── shared/           # Shared types and utilities
├── docs/             # Documentation
└── docker/           # Docker configuration files
```

## Documentation

Detailed documentation is available in the `docs/` directory:
- [API Documentation](docs/api.md)
- [Architecture Overview](docs/architecture.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)
- [Form Components](docs/components/form-components.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Project File Upload System

## To-Do List

### AWS S3 Configuration
1. Replace placeholder AWS credentials in `.env` file with actual values:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   ```

2. Create an S3 bucket if not already created
   - Choose an appropriate region
   - Configure bucket name
   - Set up bucket policies for security

3. Configure CORS on S3 bucket
   - Add CORS configuration to allow uploads from frontend domain
   - Example CORS configuration:
   ```json
   {
     "CORSRules": [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedOrigins": ["http://localhost:3000"], // Add your frontend URL
         "ExposeHeaders": ["ETag"],
         "MaxAgeSeconds": 3000
       }
     ]
   }
   ```

### Backend Configuration
1. Update file type validation
   - Remove `FileType` enum import from `file.service.ts`
   - Ensure MIME type validation is working correctly

2. Test file upload endpoints
   - Test with various file types
   - Verify size limits
   - Check error handling

### Frontend Configuration
1. Test file upload component
   - Verify drag and drop functionality
   - Test file type restrictions
   - Check upload progress indicators
   - Verify error handling

2. Test file management features
   - File deletion
   - File download
   - File preview (for images)

### Security Considerations
1. Implement proper authentication checks
2. Set up proper file access controls
3. Configure secure file download URLs
4. Implement rate limiting for uploads

### Testing
1. Write unit tests for file upload service
2. Add integration tests for S3 operations
3. Test error scenarios
4. Verify file type validation
5. Test file size limits

### Documentation
1. Document API endpoints
2. Add usage examples
3. Document configuration requirements
4. Add troubleshooting guide

## Current Status
- Frontend file upload component implemented
- Backend file service implemented
- S3 integration code ready
- Basic file type validation in place
- File size limits configured

## Next Steps
1. Complete AWS S3 configuration
2. Test the complete upload flow
3. Add comprehensive error handling
4. Implement proper logging
5. Add monitoring and analytics

# File Management System Backend

A robust and secure file management system built with Node.js, TypeScript, and NestJS.

## Features

- File Operations
  - Upload files with size and type validation
  - Download files
  - Delete files
  - Move files between projects
  - File versioning support
  - File preview generation

- File Sharing
  - Share files with other users
  - Configurable share permissions (View/Edit)
  - Share link generation with expiration
  - Access control management

- File Organization
  - Project-based file organization
  - File tagging system
  - Advanced file search capabilities
  - Metadata management

- Security
  - User authentication and authorization
  - File access control
  - Secure file storage
  - Input validation and sanitization

## Technical Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Storage**: Local/Cloud storage support
- **Authentication**: JWT-based authentication
- **Real-time Updates**: WebSocket integration
- **Testing**: Jest

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Configure your database settings in `.env`

5. Run migrations:
   ```bash
   npm run migration:run
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:cov
```

## API Documentation

API documentation is available at `/api-docs` when running the server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Online App Platform

A full-stack application with advanced authentication features.

## Features

- **User Authentication**
  - Registration and Login
  - Password management (reset functionality)
  - Two-factor authentication (2FA)
  - Profile verification (email and phone)

## Tech Stack

- **Backend:** NestJS, TypeScript
- **Frontend:** React, TypeScript

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend (coming soon)

```bash
cd frontend
npm install
npm start
```

## Testing

```bash
cd backend
npm test
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login
- `POST /auth/password-reset-request` - Request a password reset
- `POST /auth/password-reset/:token` - Reset password with token

### Two-Factor Authentication

- `POST /auth/2fa/enable/:userId` - Enable 2FA
- `POST /auth/2fa/verify/:userId` - Verify and enable 2FA
- `POST /auth/2fa/authenticate` - Verify 2FA code during login
- `POST /auth/2fa/disable/:userId` - Disable 2FA

### Profile Verification

- `POST /auth/verify-email/request/:userId` - Request email verification
- `POST /auth/verify-email/:userId` - Verify email with code
- `POST /auth/phone/:userId` - Add phone number
- `POST /auth/verify-phone/request/:userId` - Request phone verification
- `POST /auth/verify-phone/:userId` - Verify phone with code

# BlueOrbMagic

A modular frontend component library with a focus on customizable, accessible, and consistent user interfaces.

## Features

- Comprehensive set of UI components
- Themeable design system
- Accessibility built-in
- Modular architecture
- Documentation and examples

## Getting Started

### Installation

```bash
npm install blue-orb-magic
```

### Basic Usage

```jsx
import { Button, TextField } from 'blue-orb-magic';
import { ThemeProvider } from 'blue-orb-magic/theme';

function App() {
  return (
    <ThemeProvider>
      <TextField label="Username" placeholder="Enter username" />
      <Button variant="primary">Submit</Button>
    </ThemeProvider>
  );
}
```

## Component Categories

- **Form Controls**: TextField, Select, Checkbox, Radio, etc.
- **Navigation**: Tabs, Breadcrumbs, Pagination, Menu
- **Feedback**: Toast, Progress indicators, Modal/Dialog
- **Data Display**: Card, List, Table
- **Data Entry**: Form with validation, DatePicker, TimePicker, FileUpload
- **Data Visualization**: Charts, Graphs, Maps
- **Layout Components**: Grid, Flex, Box

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/blue-orb-magic.git

# Navigate to the project directory
cd blue-orb-magic

# Install dependencies
npm install

# Start development server
npm run dev
```

## Contributing

Contributions are welcome! Please check out our [contributing guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 