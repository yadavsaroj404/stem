# FastAPI REST API

This project is a simple REST API built using FastAPI. It provides endpoints for managing items with CRUD operations.

## Project Structure

```
fastapi-rest-api
├── app
│   ├── __init__.py
│   ├── main.py
│   ├── api
│   │   ├── __init__.py
│   │   └── endpoints
│   │       ├── __init__.py
│   │       └── items.py
│   ├── core
│   │   ├── __init__.py
│   │   └── config.py
│   ├── models
│   │   ├── __init__.py
│   │   └── item.py
│   └── schemas
│       ├── __init__.py
│       └── item.py
├── requirements.txt
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd fastapi-rest-api
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

To run the FastAPI application, execute the following command:

```
uvicorn app.main:app --reload
```

You can access the API documentation at `http://127.0.0.1:8000/docs`.

## Endpoints

- **GET /items/**: Retrieve a list of items.
- **POST /items/**: Create a new item.
- **GET /items/{item_id}**: Retrieve an item by ID.
- **PUT /items/{item_id}**: Update an item by ID.
- **DELETE /items/{item_id}**: Delete an item by ID.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.