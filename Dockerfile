# Multi-stage Docker build for MangaDex Downloader GUI
# Build: docker build -f Dockerfile -t mangadex-builder .
# Run:   docker run --rm -v $(pwd)/output:/app/output mangadex-builder

FROM ubuntu:22.04

LABEL maintainer="MangaDex Downloader"

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libglib2.0-dev \
    libgtk-3-dev \
    libsoup-3.0-dev \
    libjavascriptcoregtk-4.1-dev \
    libwebkit2gtk-4.1-dev \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (v20)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm@9.15.0

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    rustc --version && \
    cargo --version

# Copy project files
COPY . .

# Create output directory
RUN mkdir -p /app/output

# Build steps
RUN echo "📦 Installing dependencies..." && \
    pnpm install

RUN echo "🔨 Building frontend..." && \
    pnpm build

RUN echo "🎁 Building Tauri app..." && \
    pnpm tauri build

# Copy output to mounted volume
RUN echo "📁 Copying build artifacts..." && \
    cp -r src-tauri/target/release/bundle/deb/* /app/output/ 2>/dev/null || true && \
    cp -r src-tauri/target/release/bundle/appimage/* /app/output/ 2>/dev/null || true && \
    cp src-tauri/target/release/mangadex-downloader-gui /app/output/ 2>/dev/null || true

RUN echo "✅ Build complete!"

# Health check
CMD ["ls", "-lah", "/app/output"]
