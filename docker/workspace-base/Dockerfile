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

# PHP 8.2 + Composer (pakai PPA ondrej/php karena tidak ada di repo default Ubuntu 22.04)
RUN apt-get update && apt-get install -y software-properties-common \
  && add-apt-repository -y ppa:ondrej/php \
  && apt-get update && apt-get install -y \
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

# Docker CLI — untuk Docker-in-Docker (DinD) template
# Hanya CLI, bukan daemon — daemon dari host di-mount via socket
RUN apt-get update \
  && install -m 0755 -d /etc/apt/keyrings \
  && curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc \
  && chmod a+r /etc/apt/keyrings/docker.asc \
  && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu jammy stable" \
     > /etc/apt/sources.list.d/docker.list \
  && apt-get update \
  && apt-get install -y docker-ce-cli docker-compose-plugin \
  && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /workspace

# Expose nothing by default — ports are mapped dynamically
CMD ["/bin/bash"]
