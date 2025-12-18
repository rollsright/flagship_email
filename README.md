# Koa Email Service

An email sending service based on the Koa framework that receives form information and sends it via Gmail to a specified email address.

## Features

- ✅ POST `/send` endpoint to receive form data
- ✅ Send emails via Gmail SMTP
- ✅ Supports name, email, phone, and remark fields
- ✅ Environment variable configuration

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Koa** - Web framework
- **Koa Router** - Routing middleware
- **Koa Bodyparser** - Request body parser
- **Nodemailer** - Email sending
- **dotenv** - Environment variable management

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `env.example` file and rename it to `.env`:

```bash
cp env.example .env
```

Then edit the `.env` file and fill in your configuration:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
RECEIVER_EMAIL=receiver@example.com
PORT=3000
```

### 3. Get Gmail App-Specific Password

Due to Gmail's security settings, you need to generate an app-specific password:

1. Log in to your Google account
2. Visit [Google Account Security Settings](https://myaccount.google.com/security)
3. Enable **2-Step Verification** (if not already enabled)
4. Find "App passwords" under "2-Step Verification"
5. Select "Mail" and your device
6. Generate the password and copy it to the `GMAIL_APP_PASSWORD` field in the `.env` file

### 4. Start the Service

Development mode (with hot reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The service will start at `http://localhost:3000`.

## API Endpoints

### POST /send

Send email endpoint

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|------|------|------|------|
| name | string | Yes | Name |
| email | string | Yes | Email |
| phone | string | Yes | Phone |
| remark | string | No | Remark |

**Request Example:**

```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "remark": "This is a test remark"
  }'
```

**Success Response:**

```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id@gmail.com>"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Email sending failed",
  "error": "Error message"
}
```

### GET /health

Health check endpoint

**Response Example:**

```json
{
  "status": "ok",
  "message": "Service is running"
}
```

## Project Structure

```
.
├── app.js              # Main application file
├── package.json        # Project dependencies configuration
├── env.example         # Environment variables example
├── .env                # Environment variables configuration (create yourself)
├── .gitignore          # Git ignore file
└── README.md           # Project documentation
```

## Important Notes

1. **Security**: Do not commit the `.env` file to the Git repository
2. **Gmail Limits**: Gmail has daily sending limits (approximately 500 emails/day for free accounts)
3. **App Password**: You must use an app-specific password, not your Gmail account password
4. **2-Step Verification**: You must enable 2-Step Verification on your Google account to generate an app password

## Server Deployment

### Prerequisites

Before deploying to a server, ensure you have the following:

1. **Server Access**: SSH access to your server (Linux/Ubuntu recommended)
2. **Domain Name** (Optional): For production use
3. **Gmail Account**: With 2-Step Verification enabled and app password generated

### Node.js Installation

#### Recommended Version

- **Node.js v18.x LTS** or **Node.js v20.x LTS** (Long Term Support)
- This project requires Node.js >= 14.x

#### Installation Methods

**Option 1: Using NVM (Recommended)**

NVM (Node Version Manager) allows you to install and manage multiple Node.js versions:

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc
# or for zsh users
source ~/.zshrc

# Install Node.js LTS version
nvm install --lts

# Use the installed version
nvm use --lts

# Set default version
nvm alias default node

# Verify installation
node -v
npm -v
```

**Option 2: Using Package Manager (Ubuntu/Debian)**

```bash
# Update package list
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

**Option 3: Using Package Manager (CentOS/RHEL)**

```bash
# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node -v
npm -v
```

### Deployment Steps

#### 1. Clone or Upload Your Project

```bash
# Clone from Git repository
git clone <your-repository-url>
cd koa-email-service

# Or upload files via SCP/FTP
scp -r /local/path/to/project user@server:/path/to/deploy
```

#### 2. Install Dependencies

```bash
npm install --production
```

#### 3. Configure Environment Variables

```bash
# Create .env file
nano .env

# Add your configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
RECEIVER_EMAIL=receiver@example.com
PORT=3000
```

#### 4. Install PM2 (Process Manager)

PM2 keeps your application running and restarts it automatically if it crashes:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start your application
pm2 start app.js --name "email-service"

# Set PM2 to start on system boot
pm2 startup
pm2 save

# View application status
pm2 status

# View logs
pm2 logs email-service

# Restart application
pm2 restart email-service

# Stop application
pm2 stop email-service
```

#### 5. Configure Firewall

```bash
# Allow Node.js port (if using default port 3000)
sudo ufw allow 3000/tcp

# For production, typically use port 80/443 with reverse proxy
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

#### 6. Set Up Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/email-service

# Add the following configuration:
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your server IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/email-service /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 7. Set Up SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically configure HTTPS
# Certificate will auto-renew
```

### Server Requirements

**Minimum Requirements:**
- **CPU**: 1 core
- **RAM**: 512 MB
- **Storage**: 1 GB
- **OS**: Ubuntu 20.04+ / Debian 10+ / CentOS 7+

**Recommended for Production:**
- **CPU**: 2 cores
- **RAM**: 2 GB
- **Storage**: 10 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Security Best Practices

1. **Use Environment Variables**: Never hardcode sensitive information
2. **Keep Node.js Updated**: Regularly update Node.js and dependencies
3. **Use HTTPS**: Always use SSL certificates in production
4. **Firewall Configuration**: Only open necessary ports
5. **Regular Backups**: Backup your `.env` file and application data
6. **Use Non-Root User**: Run the application as a non-root user
7. **Monitor Logs**: Regularly check PM2 logs for errors

### Monitoring

```bash
# Real-time logs
pm2 logs email-service --lines 100

# Monitor CPU and Memory usage
pm2 monit

# Show application information
pm2 show email-service
```

## Troubleshooting

### Email Sending Failed

1. Check if the `.env` file configuration is correct
2. Confirm that Google 2-Step Verification is enabled
3. Confirm that you are using an app-specific password, not your account password
4. Check if the network connection is working properly
5. Review the console error logs

### Server Deployment Issues

1. **Port Already in Use**: Change the PORT in `.env` file or stop the conflicting service
2. **Permission Denied**: Ensure the user has proper permissions to access files and ports
3. **Module Not Found**: Run `npm install` to install all dependencies
4. **PM2 Not Starting**: Check PM2 logs with `pm2 logs email-service`
5. **502 Bad Gateway (Nginx)**: Ensure the Node.js app is running on the correct port

## License

MIT

