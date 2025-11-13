# WeasyPrint Setup Guide

WeasyPrint is used for generating professional PDF resumes from HTML templates. It requires some system-level dependencies to work properly.

## Installation

### 1. Install Python Package

The Python package is already included in `requirements.txt`:

```bash
pip install weasyprint
```

### 2. Install System Dependencies

WeasyPrint requires GTK+ libraries (Pango, Cairo, GObject) to render PDFs.

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
sudo apt-get install python3-dev python3-pip python3-cffi libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info
```

#### macOS

```bash
brew install python3 cairo pango gdk-pixbuf libffi
```

## Verification

Test that WeasyPrint is working:

```bash
python -c "from weasyprint import HTML; html = HTML(string='<h1>Test</h1>'); pdf = html.write_pdf(); print('Success!')"
```

If you see "Success!", WeasyPrint is properly configured.

## Troubleshooting

### Error: "cannot load library 'libgobject-2.0-0'"

This means the GTK libraries are not installed or not in your PATH.

**Solutions:**
1. Install GTK using one of the methods above
2. Ensure GTK bin directory is in your system PATH
3. Restart your terminal/IDE after installation

### Error: "OSError: cannot load library"

Check that all required libraries are installed:
- libgobject-2.0
- libpango-1.0
- libcairo-2
- libgdk-pixbuf-2.0

### Alternative: Docker Deployment

If you have trouble with system dependencies, consider deploying the backend in a Docker container where dependencies are pre-installed:

```dockerfile
FROM python:3.11-slim

# Install WeasyPrint dependencies
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . /app
WORKDIR /app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Development Without WeasyPrint

If you cannot install WeasyPrint dependencies in your development environment, the auto-fix feature will still work for content optimization. PDF generation will fail gracefully with an error message.

For production deployment, ensure WeasyPrint dependencies are properly installed.

## Resources

- WeasyPrint Documentation: https://doc.courtbouillon.org/weasyprint/
- Installation Guide: https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#installation
- Troubleshooting: https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#troubleshooting
