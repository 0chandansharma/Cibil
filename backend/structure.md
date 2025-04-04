backend/
├── app/
│ ├── **init**.py
│ ├── api/
│ │ ├── **init**.py
│ │ ├── auth.py
│ │ ├── admin.py
│ │ ├── documents.py
│ │ ├── clients.py
│ │ ├── analysis.py
│ │ └── deps.py
│ ├── core/
│ │ ├── **init**.py
│ │ ├── config.py
│ │ ├── security.py
│ │ └── exceptions.py
│ ├── db/
│ │ ├── **init**.py
│ │ ├── models.py
│ │ ├── crud.py
│ │ └── session.py
│ ├── services/
│ │ ├── **init**.py
│ │ ├── document_service.py
│ │ ├── ocr_service.py
│ │ ├── analysis_service.py
│ │ ├── ai_service.py
│ │ └── client_service.py
│ └── utils/
│ ├── **init**.py
│ ├── file_handlers.py
│ └── validators.py
├── tests/
│ ├── **init**.py
│ ├── conftest.py
│ ├── test_api/
│ │ ├── **init**.py
│ │ ├── test_auth.py
│ │ ├── test_admin.py
│ │ ├── test_documents.py
│ │ ├── test_clients.py
│ │ └── test_analysis.py
│ ├── test_services/
│ │ ├── **init**.py
│ │ ├── test_document_service.py
│ │ ├── test_ocr_service.py
│ │ └── test_analysis_service.py
│ └── test_db/
│ ├── **init**.py
│ └── test_models.py
├── alembic/
│ ├── env.py
│ ├── README
│ ├── script.py.mako
│ └── versions/
├── main.py
├── requirements.txt
└── Dockerfile
