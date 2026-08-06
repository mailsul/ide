FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Tools dasar
RUN apt-get update && apt-get install -y \
  curl wget git vim nano zip unzip \
  build-essential cmake make gcc g++ clang \
  ca-certificates gnupg lsb-release \
  sudo openssh-client htop tree jq \
  && rm -rf /var/lib/apt/lists/*

# Node.js 20 (via NodeSource)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && npm install -g yarn pnpm bun pm2 \
  && rm -rf /var/lib/apt/lists/*

# Python 3.11 + pip + poetry
RUN apt-get update && apt-get install -y \
  python3.11 python3-pip python3-venv python3.11-venv \
  && pip3 install poetry \
  && rm -rf /var/lib/apt/lists/*

# PHP 8.2 + Composer
RUN apt-get update && apt-get install -y \
  php8.2 php8.2-cli php8.2-curl php8.2-mbstring \
  php8.2-xml php8.2-mysql php8.2-pgsql php8.2-zip \
  && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
  && rm -rf /var/lib/apt/lists/*

# Go 1.21
RUN wget -q https://go.dev/dl/go1.21.6.linux-amd64.tar.gz -O /tmp/go.tar.gz \
  && tar -C /usr/local -xzf /tmp/go.tar.gz \
  && rm /tmp/go.tar.gz
ENV PATH=$PATH:/usr/local/go/bin

# Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH=$PATH:/root/.cargo/bin

# Java OpenJDK 21
RUN apt-get update && apt-get install -y openjdk-21-jdk maven \
  && rm -rf /var/lib/apt/lists/*

# Ruby
RUN apt-get update && apt-get install -y ruby-full \
  && gem install bundler \
  && rm -rf /var/lib/apt/lists/*

# Deno
RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH=$PATH:/root/.deno/bin

# MySQL Client
RUN apt-get update && apt-get install -y mysql-client \
  && rm -rf /var/lib/apt/lists/*

# PostgreSQL Client
RUN apt-get update && apt-get install -y postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /workspace

# Expose nothing by default — ports are mapped dynamically
CMD ["/bin/bash"]
