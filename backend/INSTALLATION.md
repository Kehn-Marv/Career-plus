# Backend Installation Guide

This guide covers the complete installation process for the Career+ backend, including all dependencies required for the Intelligent Auto-Fix Resume feature.

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd career-plus/backend
```

### 2. Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install System Dependencies for PDF Generation

The Auto-Fix Resume feature requires WeasyPrint, which needs system-level libraries (Pango, Cairo, GObject).

#### Windows

**Option A: Using GTK for Windows (Recommended)**

1. Download GTK3 Runtime from: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases
2. Run the installer and follow the installation wizard
3. Add GTK to your system PATH (the installer should do this automatically)
4. Restart your terminal/IDE

**Option B: Using MSYS2**

1. Download and install MSYS2 from: https://www.msys2.org/
2. Open MSYS2 terminal and run:
   ```bash
   pacman -S mingw-w64-x86_64-gtk3 mingw-w64-x86_64-pango mingw-w64-x86_64-gdk-pixbuf2
   ```
3. Add MSYS2 bin directory to your PATH: `C:\msys64\mingw64\bin`

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y \
    python3-dev \
    python3-pip \
    python3-cffi \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info
```

#### macOS

```bash
brew install python3 cairo pango gdk-pixbuf libffi
```

### 5. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the required values:

```env
# REQUIRED: Get your API key from https://ai.google.dev/
GEMINI_API_KEY=your_actual_api_key_here

# Optional: Adjust these as needed
GEMINI_MODEL=gemini-2.5-flash-lite
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_ENABLED=true
MAX_REQUESTS_PER_MINUTE=10

# PDF Generation Configuration
WEASYPRINT_CACHE_DIR=./cache/weasyprint
TEMPLATE_DIR=./app/templates
MAX_PDF_SIZE_MB=10
PDF_GENERATION_TIMEOUT=30
```

### 6. Verify Installation

Test that all dependencies are working:

```bash
# Test basic imports
python -c "import fastapi; import google.genai; print('✓ Core dependencies OK')"

# Test WeasyPrint
python -c "from weasyprint import HTML; HTML(string='<h1>Test</h1>').write_pdf(); print('✓ WeasyPrint OK')"

# Test Jinja2
python -c "from jinja2 import Environment; print('✓ Jinja2 OK')"
```

### 7. Run the Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend should now be running at `http://localhost:8000`

## Dependency Details

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | >=0.115.0 | Web framework |
| uvicorn | >=0.32.0 | ASGI server |
| pydantic | >=2.10.0 | Data validation |
| python-dotenv | >=1.0.0 | Environment configuration |

### Document Processing

| Package | Version | Purpose |
|---------|---------|---------|
| python-docx | >=1.1.0 | DOCX parsing |
| pymupdf | >=1.24.0 | PDF parsing |
| pdfminer.six | >=20221105 | PDF text extraction |

### PDF Generation (Auto-Fix Feature)

| Package | Version | Purpose |
|---------|---------|---------|
| weasyprint | >=60.0 | HTML to PDF conversion |
| jinja2 | >=3.1.2 | Template engine |

**System Dependencies for WeasyPrint:**
- Pango (text layout)
- Cairo (graphics rendering)
- GObject (object system)
- GdkPixbuf (image loading)

### AI and Machine Learning

| Package | Version | Purpose |
|---------|---------|---------|
| google-genai | >=1.0.0 | Gemini API client |
| sentence-transformers | >=2.2.2 | Text embeddings |
| numpy | >=1.26.0 | Numerical operations |

## Troubleshooting

### WeasyPrint Installation Issues

**Error: "cannot load library 'libgobject-2.0-0'"**

This means GTK libraries are not installed or not in your PATH.

**Solutions:**
1. Install GTK using one of the methods above
2. Ensure GTK bin directory is in your system PATH
3. Restart your terminal/IDE after installation

**Error: "OSError: cannot load library"**

Check that all required libraries are installed:
- libgobject-2.0
- libpango-1.0
- libcairo-2
- libgdk-pixbuf-2.0

### Gemini API Issues

**Error: "GEMINI_API_KEY is required but not set"**

Make sure you've:
1. Created a `.env` file from `.env.example`
2. Set a valid Gemini API key
3. Restarted the backend server

Get your API key from: https://ai.google.dev/

### Import Errors

**Error: "ModuleNotFoundError"**

Make sure you've:
1. Activated your virtual environment
2. Installed all requirements: `pip install -r requirements.txt`
3. Using the correct Python version (3.9+)

### Port Already in Use

**Error: "Address already in use"**

Change the port in the run command:
```bash
uvicorn app.main:app --reload --port 8001
```

## Docker Deployment (Alternative)

If you have trouble with system dependencies, use Docker:

```dockerfile
FROM python:3.11-slim

# Install WeasyPrint system dependencies
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create cache directory
RUN mkdir -p cache/weasyprint

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t career-plus-backend .
docker run -p 8000:8000 --env-file .env career-plus-backend
```

## Development Without WeasyPrint

If you cannot install WeasyPrint dependencies in your development environment:

1. The backend will still start and run
2. All features except PDF generation will work
3. PDF generation endpoints will return appropriate error messages
4. You can develop and test other features normally

For production deployment, ensure WeasyPrint dependencies are properly installed.

## Updating Dependencies

To update all dependencies to their latest compatible versions:

```bash
pip install --upgrade -r requirements.txt
```

To update a specific package:

```bash
pip install --upgrade package-name
```

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [WeasyPrint Documentation](https://doc.courtbouillon.org/weasyprint/)
- [Jinja2 Documentation](https://jinja.palletsprojects.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [WEASYPRINT_SETUP.md](./WEASYPRINT_SETUP.md) guide
3. Check existing GitHub issues
4. Create a new issue with detailed error messages

