# Financial Statement Analysis Platform

A comprehensive platform for junior accountants and CA professionals to analyze financial documents efficiently. The platform offers document processing, data extraction, financial analysis, and client management capabilities.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [API Documentation](#api-documentation)
10. [Deployment](#deployment)
11. [Contributing](#contributing)

## Overview

The Financial Statement Analysis Platform is designed to help accounting professionals analyze financial documents efficiently. It provides features such as document upload, OCR text extraction, financial data extraction, CIBIL score calculation, and AI-powered document analysis.

## Features

- **User Authentication**: Secure login for admin and CA users
- **Document Management**: Upload, process, and analyze financial documents
- **OCR Processing**: Extract text and structured data from documents
- **Financial Analysis**: Calculate financial metrics including CIBIL scores
- **Client Management**: Organize documents by client
- **AI-Powered Chat**: Ask questions about document content
- **Dashboard Analytics**: View statistics and performance metrics
- **Responsive UI**: Modern interface that works on desktop and mobile devices

## Technology Stack

### Frontend

- React.js
- Redux Toolkit for state management
- Material UI for component library
- Chart.js for data visualization
- Formik and Yup for form handling and validation

### Backend

- Python with FastAPI
- SQLAlchemy ORM
- JWT authentication
- Pydantic for data validation
- Alembic for database migrations

### Database

- SQLite (development)
- PostgreSQL (production)

## Project Structure

```
financial-analysis-platform/
├── frontend/                # React frontend application
│   ├── public/              # Public assets
│   └── src/                 # Source code
└── backend/                 # Python backend application
    ├── app/                 # Main application
    │   ├── api/             # API endpoints
    │   ├── core/            # Core modules
    │   ├── db/              # Database models
    │   ├── services/        # Business logic
    │   └── utils/           # Utility functions
    ├── tests/               # Test modules
    └── alembic/             # Database migrations
```

## Installation

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn
- PostgreSQL (for production)

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/financial-analysis-platform.git
   cd financial-analysis-platform
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install backend dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Create necessary directories:
   ```bash
   mkdir -p uploads
   ```

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   # or if using yarn
   yarn install
   ```

## Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory with the following variables:

```
# Environment
ENVIRONMENT=development

# Database
DATABASE_URL=sqlite:///./financial_platform.db
# For PostgreSQL, use:
# DATABASE_URL=postgresql://user:password@localhost/financial_platform

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# CORS
CORS_ORIGINS=http://localhost:3000

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760  # 10MB

# External APIs
OCR_API_URL=http://your-ocr-service.com/api
OCR_API_KEY=your-ocr-api-key
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-openai-api-key
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Running the Application

### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

Create the first migration
Now you can initialize your first migration:
Example

`alembic revision --autogenerate -m "Create initial tables"`

2. Run database migrations:

   ```bash
   alembic upgrade head
   ```

3. Start the backend server:

   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`.

### Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Start the development server:

   ```bash
   npm start
   # or if using yarn
   yarn start
   ```

   The application will be available at `http://localhost:3000`.

## Testing

### Backend Tests

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Run tests:

   ```bash
   pytest
   ```

   To run tests with coverage:

   ```bash
   pytest --cov=app tests/
   ```

   To run specific test files:

   ```bash
   pytest tests/test_api/test_auth.py
   ```

### Frontend Tests

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Run tests:
   ```bash
   npm test
   # or if using yarn
   yarn test
   ```

## API Documentation

Once the backend server is running, you can access the API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Deployment

### Docker Deployment

1. Build the Docker images:

   ```bash
   # Backend
   cd backend
   docker build -t financial-platform-backend .

   # Frontend
   cd ../frontend
   docker build -t financial-platform-frontend .
   ```

2. Run the containers:

   ```bash
   # Backend
   docker run -p 8000:8000 -d financial-platform-backend

   # Frontend
   docker run -p 3000:80 -d financial-platform-frontend
   ```

### Docker Compose

You can also use Docker Compose to run both the frontend and backend:

1. Create a `docker-compose.yml` file in the root directory:

   ```yaml
   version: "3"

   services:
     backend:
       build: ./backend
       ports:
         - "8000:8000"
       volumes:
         - ./backend/uploads:/app/uploads
       environment:
         - DATABASE_URL=postgresql://postgres:postgres@db/financial_platform
         - SECRET_KEY=your-secret-key
         - CORS_ORIGINS=http://localhost:3000
       depends_on:
         - db

     frontend:
       build: ./frontend
       ports:
         - "3000:80"
       depends_on:
         - backend

     db:
       image: postgres:13
       environment:
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=postgres
         - POSTGRES_DB=financial_platform
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Initial Setup for Development

To quickly set up the project for development, you can use the following script:

```bash
#!/bin/bash

# Create project directories
mkdir -p financial-analysis-platform
cd financial-analysis-platform

# Clone the repository (if using version control)
# git clone https://github.com/yourusername/financial-analysis-platform.git
# cd financial-analysis-platform

# Backend setup
mkdir -p backend/uploads
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOL
ENVIRONMENT=development
DATABASE_URL=sqlite:///./financial_platform.db
SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760
EOL

# Run migrations
alembic upgrade head

# Create initial admin user
python -c "
from app.db.session import SessionLocal
from app.db.models import User, UserRole
from app.core.security import get_password_hash
import datetime

db = SessionLocal()
admin = User(
    username='admin',
    email='admin@example.com',
    password_hash=get_password_hash('admin123'),
    role=UserRole.ADMIN,
    is_active=True,
    created_at=datetime.datetime.utcnow()
)
db.add(admin)
db.commit()
db.close()
print('Admin user created: admin@example.com / admin123')
"

cd ..

# Frontend setup
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

cd ..

echo "Setup completed successfully!"
echo "To start the backend server: cd backend && uvicorn main:app --reload"
echo "To start the frontend server: cd frontend && npm start"
```

Save this as `setup.sh`, make it executable with `chmod +x setup.sh`, and run it with `./setup.sh`.

## Troubleshooting

### Common Issues

1. **Database connection errors**:

   - Check if your database is running
   - Verify database credentials in `.env` file
   - For PostgreSQL, ensure the database exists

2. **CORS errors**:

   - Verify that `CORS_ORIGINS` in the backend `.env` file includes your frontend URL
   - Check for any network issues between frontend and backend

3. **File upload issues**:

   - Ensure the `uploads` directory exists and has proper permissions
   - Check the file size limits in the backend configuration

4. **Authentication issues**:
   - Verify that the JWT token is being properly sent in the Authorization header
   - Check if the token has expired

For more help, please open an issue on the GitHub repository.
