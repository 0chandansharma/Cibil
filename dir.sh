#!/bin/bash

# Create root project directory
mkdir -p financial-analysis-platform
cd financial-analysis-platform

# Create frontend structure
mkdir -p frontend/public
mkdir -p frontend/src/assets/images
mkdir -p frontend/src/assets/styles
mkdir -p frontend/src/components/common/{Button,Card,Input,Modal,Table}
mkdir -p frontend/src/components/layout/{Header,Sidebar,Footer,Layout}
mkdir -p frontend/src/components/dashboard/{StatCard,Chart,ActivityFeed}
mkdir -p frontend/src/components/analysis/{DocumentViewer,ResultTabs,CibilCalculator,Summary,TableView,ChatInterface}
mkdir -p frontend/src/components/client/{ClientForm,ClientList,ClientDetails}
mkdir -p frontend/src/pages/auth/{Login,Register,ForgotPassword}
mkdir -p frontend/src/pages/admin/{Dashboard,Users,Stats}
mkdir -p frontend/src/pages/ca/{Dashboard,Clients,Documents}
mkdir -p frontend/src/pages/workspace/{QuickAnalysis,ClientAnalysis}
mkdir -p frontend/src/services
mkdir -p frontend/src/store/slices
mkdir -p frontend/src/store/middleware
mkdir -p frontend/src/hooks
mkdir -p frontend/src/utils
mkdir -p frontend/src/theme

# Create basic frontend files
touch frontend/public/index.html
touch frontend/public/manifest.json
touch frontend/public/robots.txt
touch frontend/src/App.js
touch frontend/src/index.js
touch frontend/src/routes.js
touch frontend/src/assets/styles/global.css
touch frontend/src/theme/index.js
touch frontend/src/theme/palette.js
touch frontend/src/theme/typography.js
touch frontend/src/store/index.js
touch frontend/src/services/api.js
touch frontend/src/services/authService.js
touch frontend/src/services/documentService.js
touch frontend/src/services/analysisService.js
touch frontend/src/services/clientService.js
touch frontend/src/store/slices/authSlice.js
touch frontend/src/store/slices/documentSlice.js
touch frontend/src/store/slices/clientSlice.js
touch frontend/src/store/slices/uiSlice.js
touch frontend/src/utils/formatters.js
touch frontend/src/utils/validators.js
touch frontend/src/utils/helpers.js
touch frontend/src/hooks/useAuth.js
touch frontend/src/hooks/useDocuments.js
touch frontend/src/hooks/useClients.js

# Create package.json for frontend
cat > frontend/package.json << 'EOL'
{
  "name": "financial-analysis-platform",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.11.16",
    "@mui/lab": "^5.0.0-alpha.129",
    "@mui/material": "^5.13.0",
    "@reduxjs/toolkit": "^1.9.5",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.4.0",
    "chart.js": "^4.3.0",
    "formik": "^2.2.9",
    "jwt-decode": "^3.1.2",
    "moment": "^2.29.4",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.2.3",
    "react-pdf": "^6.2.2",
    "react-redux": "^8.0.5",
    "react-router-dom": "^6.11.1",
    "react-scripts": "5.0.1",
    "redux-persist": "^6.0.0",
    "web-vitals": "^2.1.4",
    "yup": "^1.1.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOL

# Create backend structure
mkdir -p backend/app/api
mkdir -p backend/app/core
mkdir -p backend/app/db
mkdir -p backend/app/services
mkdir -p backend/app/utils
mkdir -p backend/tests/test_api
mkdir -p backend/tests/test_services
mkdir -p backend/tests/test_db
mkdir -p backend/alembic/versions

# Create basic backend files
touch backend/app/__init__.py
touch backend/app/api/__init__.py
touch backend/app/api/auth.py
touch backend/app/api/admin.py
touch backend/app/api/documents.py
touch backend/app/api/clients.py
touch backend/app/api/analysis.py
touch backend/app/core/__init__.py
touch backend/app/core/config.py
touch backend/app/core/security.py
touch backend/app/core/dependencies.py
touch backend/app/db/__init__.py
touch backend/app/db/models.py
touch backend/app/db/crud.py
touch backend/app/db/session.py
touch backend/app/services/__init__.py
touch backend/app/services/document_service.py
touch backend/app/services/ocr_service.py
touch backend/app/services/analysis_service.py
touch backend/app/services/ai_service.py
touch backend/app/services/client_service.py
touch backend/app/utils/__init__.py
touch backend/app/utils/file_handlers.py
touch backend/app/utils/validators.py
touch backend/tests/__init__.py
touch backend/tests/conftest.py
touch backend/alembic/env.py
touch backend/main.py
touch backend/Dockerfile

# Create requirements.txt for backend
cat > backend/requirements.txt << 'EOL'
fastapi==0.95.1
uvicorn==0.22.0
sqlalchemy==2.0.12
pydantic==1.10.7
python-jose==3.3.0
passlib==1.7.4
python-multipart==0.0.6
alembic==1.10.4
pytest==7.3.1
httpx==0.24.0
python-dotenv==1.0.0
psycopg2-binary==2.9.6
bcrypt==4.0.1
Pillow==9.5.0
PyPDF2==3.0.1
pandas==2.0.1
numpy==1.24.3
EOL

echo "Directory structure created successfully!"