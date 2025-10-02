# RoseGlass CloudExplorer

A robust Google Drive client built on Rclone with AirCluster-like functionality. This application provides a modern web-based interface for managing files between your local system and Google Drive, with reliable cut-paste operations and real-time progress tracking.

## Features

- **Dual-pane file browser** - Browse local files and Google Drive simultaneously
- **Cut-paste operations** - True move operations that delete source files after successful transfer
- **Real-time progress tracking** - Live progress bars, speed indicators, and ETA
- **Task queue management** - Handle multiple operations with automatic retry logic
- **Robust error handling** - Comprehensive error reporting and recovery
- **Modern web interface** - Clean, responsive UI built with React
- **Rclone backend** - Leverages the battle-tested Rclone for reliable cloud operations

## Why RoseGlass CloudExplorer?

Unlike the official Google Drive client, this application provides:

- **Reliable large file transfers** - No more failed uploads or mysterious sync issues
- **True cut-paste operations** - Files are actually moved, not just copied
- **Better error handling** - Clear error messages and automatic retry logic
- **No paywall** - Completely free and open source
- **Customizable** - Built on open source tools you can modify

## Prerequisites

- Windows 10/11 (PowerShell 5.1 or later)
- Node.js 16+ 
- Google account with Drive access

## Quick Setup

### 1. Install Rclone (Automated)

Run the provided PowerShell script as Administrator:

```powershell
# Right-click PowerShell and "Run as Administrator"
.\setup-rclone.ps1
```

This script will:
- Download the latest Rclone version
- Install it to `C:\Tools\rclone\`
- Add it to your system PATH
- Optionally configure Google Drive access

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Start the Application

```bash
# Start both backend and frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Manual Rclone Setup

If you prefer to set up Rclone manually:

1. Download Rclone from https://rclone.org/downloads/
2. Extract to `C:\Tools\rclone\`
3. Add `C:\Tools\rclone\` to your system PATH
4. Run `rclone config` to set up Google Drive

## Usage

### First Time Setup

1. Open the application in your browser
2. If Rclone isn't configured, you'll see a warning in the status bar
3. Run `rclone config` in a terminal to set up Google Drive access
4. Refresh the application

### Using the File Browser

1. **Left Panel**: Select "Local Filesystem" or a Google Drive remote
2. **Right Panel**: Select the destination (local or remote)
3. **Navigate**: Click folders to browse, or use the path bar to jump to specific locations
4. **Select Files**: Click files to select them (Ctrl+Click for multiple selection)
5. **Operations**: Use the operation panel to move or copy selected files

### Task Management

- View all operations in the Task Manager tab
- Monitor progress in real-time
- Cancel running operations
- View detailed error messages
- Delete completed tasks

## Configuration

### Rclone Configuration

The application uses Rclone's standard configuration file located at:
- Windows: `%APPDATA%\rclone\rclone.conf`

### Application Settings

Settings are stored in a local SQLite database (`cloud_explorer.db`).

## Troubleshooting

### Rclone Not Found

If you see "Rclone not found" in the status bar:

1. Ensure Rclone is installed and in your PATH
2. Restart the application
3. Check that `rclone version` works in a terminal

### Google Drive Authentication Issues

1. Run `rclone config` and reconfigure your Google Drive remote
2. Ensure you have proper permissions in your Google account
3. Check that 2FA is properly configured if enabled

### Large File Transfer Issues

1. Check your internet connection stability
2. Ensure sufficient disk space
3. Monitor the Task Manager for specific error messages
4. Try reducing the number of concurrent transfers in the settings

### Performance Issues

1. Close other applications using network bandwidth
2. Reduce the number of concurrent transfers
3. Check your Google Drive API quota limits

## Development

### Project Structure

```
roseglass-cloudexplorer/
├── server.js              # Express server
├── services/              # Backend services
│   ├── RcloneService.js   # Rclone wrapper
│   ├── FileManager.js     # File operations
│   ├── TaskQueue.js       # Task management
│   └── Database.js        # SQLite database
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── types.ts       # TypeScript types
└── setup-rclone.ps1      # Rclone setup script
```

### Adding New Features

1. Backend: Add new routes in `server.js` and services in `services/`
2. Frontend: Create components in `client/src/components/`
3. Types: Update `client/src/types.ts` for new data structures

### Building for Production

```bash
# Build the React app
cd client
npm run build
cd ..

# Start production server
npm start
```

## API Reference

### Backend Endpoints

- `GET /api/rclone/status` - Get Rclone status and remotes
- `POST /api/files/list` - List files in a directory
- `POST /api/operations/move` - Queue a move operation
- `POST /api/operations/copy` - Queue a copy operation
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks/:id/cancel` - Cancel a task

### WebSocket Events

- `task_progress` - Task progress update
- `task_complete` - Task completed
- `task_error` - Task failed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built on [Rclone](https://rclone.org/) - The Swiss Army knife of cloud storage
- Inspired by AirCluster's robust file management capabilities
- Powered by React and Node.js

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

**RoseGlass CloudExplorer** - Making cloud storage management actually work.
