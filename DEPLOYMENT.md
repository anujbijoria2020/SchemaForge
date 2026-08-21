# SchemaForge: AWS EC2 Free Tier Deployment Guide

This guide details the step-by-step process of deploying the SchemaForge production environment to **Amazon Web Services (AWS)** using the **12-Month Free Tier**.

Our setup runs the complete containerized stack (PostgreSQL database, Redis cache, Express API, React/Vite frontend, and Nginx reverse proxy) on a single, secure, cost-free virtual machine instance.

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph Public Internet
        Client([Client Browser])
    end

    subgraph AWS EC2 Instance (t2.micro / 1GB RAM)
        direction TB
        Nginx[Nginx Ingress Container\nPort 80 / 443]
        
        subgraph Docker Bridge Network (schemaforge_net)
            Frontend[Vite SPA Container\nPort 80]
            Backend[Express API Container\nPort 4000]
            Postgres[(PostgreSQL Container\nPort 5432)]
            Redis[(Redis Cache Container\nPort 6379)]
        end
        
        Swap[Host SWAP Memory\n2GB - 4GB]
    end

    Client -->|HTTP/HTTPS| Nginx
    Nginx -->|Route /| Frontend
    Nginx -->|Route /api/*| Backend
    Backend -->|Queries| Postgres
    Backend -->|Cache / Sessions| Redis
    Backend -.->|Uses SWAP when physical RAM is low| Swap
    Frontend -.->|Uses SWAP during build stage| Swap
```

---

## Prerequisites

Before starting, ensure you have:
1. An **AWS Account** (Sign up at [aws.amazon.com](https://aws.amazon.com/) - Free Tier is active for 12 months).
2. A **Domain Name** (required for SSL/HTTPS configuration. You can use free subdomain providers like DuckDNS, or register a custom domain on Namecheap, Cloudflare, etc.).
3. A SSH client installed (standard Terminal on macOS/Linux, or PowerShell/Command Prompt/PuTTY on Windows).

---

## Phase 1: AWS Console Setup

### 1. Launch an EC2 Instance
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Select your preferred AWS Region in the top-right corner (e.g., **Asia Pacific (Mumbai)**, **US East (N. Virginia)**).
3. Navigate to the **EC2 Dashboard** and click **Launch instance**.
4. Configure the instance with the following settings:
   - **Name**: `schemaforge-production`
   - **Application and OS Image (AMI)**: Select **Ubuntu** -> **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (Make sure it is labeled *Free tier eligible*).
   - **Architecture**: `64-bit (x86)`
   - **Instance Type**: Select `t2.micro` (or `t3.micro` if in a region where t3.micro is the designated free tier instance).
   - **Key Pair (login)**: Click **Create new key pair**.
     - Key pair name: `schemaforge-key`
     - Private key file format: `.pem` (OpenSSH compatible).
     - Click **Create key pair** and save the downloaded file securely (e.g., `~/.ssh/schemaforge-key.pem`).
   - **Network Settings (Security Group)**:
     - Select **Create security group**.
     - Check **Allow SSH traffic from** -> Select **My IP** (recommended for security) or **Anywhere (0.0.0.0/0)** if your IP changes frequently.
     - Check **Allow HTTPS traffic from the internet** (Port 443).
     - Check **Allow HTTP traffic from the internet** (Port 80).
   - **Configure Storage**:
     - Change the size of the root volume from `8 GiB` to **`30 GiB`** (30 GiB is the maximum Free Tier limit for GP3/GP2 SSD storage).
5. Click **Launch instance**.

### 2. Allocate and Associate an Elastic IP
By default, EC2 public IP addresses change whenever the instance is stopped or restarted. An Elastic IP provides a static public IP address.
1. In the EC2 console left sidebar, under **Network & Security**, click **Elastic IPs**.
2. Click **Allocate Elastic IP address**.
3. Keep default settings and click **Allocate**.
4. Select the newly allocated Elastic IP from the list, click **Actions**, and select **Associate Elastic IP address**.
5. Select **Instance**, choose your `schemaforge-production` instance, and click **Associate**.

*Note: Elastic IPs are 100% free as long as they are associated with a running EC2 instance.*

---

## Phase 2: Host Operating System Setup

### 1. Connect via SSH
Open your terminal/command prompt and run the following commands (replace `<ELASTIC_IP>` with your static IP):

```bash
# 1. Set secure permissions on your private key (Linux/macOS only)
chmod 400 /path/to/schemaforge-key.pem

# 2. Connect to the EC2 instance
ssh -i /path/to/schemaforge-key.pem ubuntu@<ELASTIC_IP>
```

### 2. Configure SWAP Memory (CRITICAL)
An EC2 `t2.micro` instance has only 1 GB of physical RAM. To run our full stack without crashing, we must configure a SWAP file to act as extra virtual memory.

Run the following commands on the server:

```bash
# 1. Create a 2 GB swap file
sudo fallocate -l 2G /swapfile

# 2. Secure file permissions
sudo chmod 600 /swapfile

# 3. Designate the file as swap space
sudo mkswap /swapfile

# 4. Enable the swap space
sudo swapon /swapfile

# 5. Verify swap is active
sudo swapon --show
free -h

# 6. Make the swap file persistent on system reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. Update Server Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Install Docker & Docker Compose
Install the official Docker Engine and Compose plugin:

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

# Install Docker packages
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to the docker group so you don't need 'sudo' for Docker commands
sudo usermod -aG docker $USER

# Apply the group changes without logging out
newgrp docker
```

---

## Phase 3: Project Deployment

### 1. Clone the Codebase
Clone the SchemaForge repository into your user home directory:

```bash
git clone <YOUR_GIT_REPOSITORY_URL> schemaforge
cd schemaforge
```

### 2. Configure Production Environment Variables
The Docker Compose setup loads production configurations from the `.env.production` file. We need to create a secure clone of this file on the server.

```bash
# 1. Copy the production environment file
cp .env.production .env.local
```

Edit the file to use secure, unique credentials. **Never deploy with the default repository keys!**

```bash
nano .env.local
```

Update the following keys inside the editor:
- `POSTGRES_PASSWORD`: Change to a secure, long random string (e.g. `s7#a!m9x2&d9`).
- `REDIS_PASSWORD`: Change to a secure, long random string.
- `JWT_SECRET`: Generate a secure 256-bit string (e.g., `openssl rand -hex 32` on your local terminal).
- `JWT_REFRESH_SECRET`: Generate another secure 256-bit string.
- `FRONTEND_URL`: Set this to your custom domain name (e.g., `https://yourdomain.com`).

Save and close the file (`Ctrl + O`, `Enter`, `Ctrl + X`).

### 3. Link environmental file to production
Move the configured values into the active `.env.production` location which Docker reads:
```bash
mv .env.local .env.production
```

### 4. Build and Start the Application
Execute Docker Compose to build production images and start the services in the background:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 5. Verify the Deployments
Check that all five containers are up and running:

```bash
docker compose -f docker-compose.prod.yml ps
```

You should see:
- `schemaforge-postgres-prod` (Up, healthy)
- `schemaforge-redis-prod` (Up, healthy)
- `schemaforge-backend-prod` (Up, healthy) - *Automatically runs database migrations during initialization*
- `schemaforge-frontend-prod` (Up, healthy)
- `schemaforge-nginx-prod` (Up)

To check the logs for database migrations or server status, run:
```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Phase 4: Domain Name & SSL Configuration (HTTPS)

Deploying a SaaS visual schema designer requires HTTPS for cookies and secure API requests. We will obtain a free SSL certificate from **Let's Encrypt** using **Certbot** on the host machine.

### 1. Configure Domain DNS
Log in to your DNS provider (e.g., Cloudflare, Namecheap, Route 53) and add the following:
- **Type**: `A` record
- **Name**: `@` (root)
- **Value**: Your AWS EC2 Elastic IP
- **TTL**: `Automatic` or `3600`

- (Optional) Add a CNAME/A record for `www` pointing to the root domain.

### 2. Temporarily Stop Ingress Nginx
Certbot needs to listen on port 80 to verify your domain ownership. We must stop our Nginx container temporarily:

```bash
docker compose -f docker-compose.prod.yml stop nginx
```

### 3. Install Certbot and Generate SSL Certificate
Run these commands on the host EC2 server:

```bash
# Install Certbot
sudo apt install -y certbot

# Generate standalone SSL Certificate (Replace domains with yours)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

This will save your certificate files to:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

### 4. Update Ingress Nginx for SSL
We will now configure the ingress Nginx proxy to listen on port 443, use these SSL certificates, and automatically redirect port 80 (HTTP) to port 443 (HTTPS).

#### A. Mount Certificates into the Container
Edit `docker-compose.prod.yml` to share the host's SSL directories with the `nginx` container:

```bash
nano docker-compose.prod.yml
```

Locate the `nginx` service and update it to match this structure (exposing `443:443` and mounting SSL volumes):

```yaml
  # ==========================================
  # 5. INGRESS NGINX REVERSE PROXY
  # ==========================================
  nginx:
    image: nginx:alpine
    container_name: schemaforge-nginx-prod
    restart: always
    ports:
      - "80:80"
      - "443:443" # Expose HTTPS port
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      # Mount Let's Encrypt certificates from host into Nginx container
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      backend:
        condition: service_healthy
      frontend:
        condition: service_healthy
    networks:
      - schemaforge_net
```

#### B. Update Nginx Configuration
Edit the main `nginx/nginx.conf` file to handle HTTPS and direct HTTP redirection:

```bash
nano nginx/nginx.conf
```

Replace the contents of the `server` block with the following SSL configuration:

```nginx
    # HTTP server - Redirect all traffic to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Certificates (mounted from host Let's Encrypt path)
        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        # Secure SSL Protocols and Ciphers
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Global Security Headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";

        client_max_body_size 10M;

        # API Routing
        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 60s;
            proxy_connect_timeout 10s;
        }

        # WebSocket Routing
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400s;
        }

        # Frontend Static Site
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /nginx-health {
            return 200 'nginx ok';
            add_header Content-Type text/plain;
        }
    }
```

### 5. Restart Nginx Container
Now build and start the nginx service again:

```bash
docker compose -f docker-compose.prod.yml up -d --build nginx
```

Your site is now securely accessible at `https://yourdomain.com` with a valid SSL padlock!

---

## Phase 5: Automated SSL Renewal

Let's Encrypt certificates expire every 90 days. To automate renewal, we can write a simple cron job on the host machine to renew the certificate and reload Nginx.

```bash
# 1. Open the crontab editor
sudo crontab -e
```

Select your preferred editor (nano is default) and append the following line at the very bottom:

```text
0 0 1 * * certbot renew --pre-hook "docker compose -f /home/ubuntu/schemaforge/docker-compose.prod.yml stop nginx" --post-hook "docker compose -f /home/ubuntu/schemaforge/docker-compose.prod.yml start nginx"
```

*This cron job will run at midnight on the first day of every month, temporarily stop the Nginx container, renew the SSL certificates using Certbot standalone mode, and restart Nginx.*

---

## Maintenance & Troubleshooting Commands

### View Logs
- All logs: `docker compose -f docker-compose.prod.yml logs -f`
- Backend API logs: `docker compose -f docker-compose.prod.yml logs -f backend`
- Database logs: `docker compose -f docker-compose.prod.yml logs -f postgres`

### Stop / Restart services
- Stop application: `docker compose -f docker-compose.prod.yml down`
- Restart application: `docker compose -f docker-compose.prod.yml restart`

### Database Backups
To take a database snapshot inside the running container:
```bash
docker exec -t schemaforge-postgres-prod pg_dumpall -U schemaforge > backup.sql
```
