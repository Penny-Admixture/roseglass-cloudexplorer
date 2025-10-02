# Installation Guide

## Quick Start (Recommended)

### 1. Prerequisites
- Windows 10/11
- Node.js 16+ (download from https://nodejs.org/)
- Administrator access (for Rclone installation)

### 2. Download and Setup
1. Download or clone this repository
2. Open PowerShell as Administrator
3. Navigate to the project directory
4. Run the setup script:
   ```powershell
   .\setup-rclone.ps1
   ```
5. Follow the prompts to configure Google Drive

### 3. Install Dependencies
```bash
npm run setup
```

### 4. Start the Application
```bash
# For development (with hot reload)
npm run dev

# For production
npm start
```

The application will be available at `http://localhost:3000`

## Manual Installation

### 1. Install Rclone Manually
1. Download Rclone from https://rclone.org/downloads/
2. Extract to `C:\Tools\rclone\`
3. Add `C:\Tools\rclone\` to your system PATH
4. Run `rclone config` to set up Google Drive

### 2. Install Node.js Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Build the React app
npm run build
```

### 3. Start the Server
```bash
node server.js
```

## Troubleshooting

### Rclone Not Found
- Ensure Rclone is installed and in your PATH
- Restart your terminal/command prompt
- Check that `rclone version` works

### Google Drive Authentication
- Run `rclone config` to set up your Google Drive remote
- Ensure you have proper permissions in your Google account
- Check that 2FA is properly configured if enabled

### Build Errors
- Ensure Node.js 16+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Port Already in Use
- Change the port in `server.js` (line with `const PORT = process.env.PORT || 3000`)
- Or kill the process using port 3000

## Development Mode

For development with hot reload:

```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run client
```

This will start:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:3001 (with hot reload)

## Production Build

```bash
# Build the React app
npm run build

# Start production server
npm start
```

The production build serves the React app from the Express server on port 3000.

## File Structure

```
roseglass-cloudexplorer/
├── server.js              # Express server
├── services/              # Backend services
├── client/                # React frontend
├── setup-rclone.ps1      # Rclone setup script
├── start.bat             # Windows startup script
├── dev.bat               # Windows development script
└── README.md             # Main documentation
```

## Next Steps

1. Open http://localhost:3000 in your browser
2. Configure Google Drive if not already done
3. Start managing your files with reliable cut-paste operations!

For detailed usage instructions, see the main README.md file.
