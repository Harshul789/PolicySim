# -------- Base Image --------
FROM python:3.11-slim

# -------- Environment Settings --------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# -------- Working Directory --------
WORKDIR /app

# -------- System Dependencies (minimal) --------
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# -------- Python Dependencies --------
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# -------- Application Code --------
COPY . .

# -------- Expose Port (Cloud Run uses 8080) --------
EXPOSE 8080

# -------- Start FastAPI --------
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
