# 🚀 **RoseGlass CloudExplorer - Quick Start**

## **Download and Run (No Installation Required!)**

### **Option 1: Portable Version (Recommended)**
1. **Download** `RoseGlassCloudExplorer-Portable.zip` from the releases
2. **Extract** the zip file anywhere on your computer
3. **Double-click** `start.bat` in the extracted folder
4. **Open** http://localhost:3000 in your browser
5. **Configure Google Drive** when prompted (one-time setup)

**That's it!** No installation, no configuration, just download and run.

---

## **What You Get**

✅ **Robust Google Drive client** - Built on Rclone for reliability  
✅ **True cut-paste operations** - Files are actually moved, not just copied  
✅ **Real-time progress tracking** - Live progress bars and speed indicators  
✅ **Dual-pane file browser** - Browse local and Google Drive simultaneously  
✅ **Task queue management** - Handle multiple operations with retry logic  
✅ **Modern web interface** - Clean, responsive UI  
✅ **No paywall** - Completely free and open source  

---

## **Features That Match AirCluster**

- **Reliable large file transfers** - No more failed uploads
- **True file operations** - Cut-paste works like a real file manager
- **Batch operations** - Select multiple files and operate on them
- **Progress tracking** - Real-time progress bars and ETA
- **Error handling** - Clear error messages and automatic retries
- **No subscription fees** - Completely free

---

## **System Requirements**

- **Windows 10/11** (64-bit)
- **Node.js 16+** (included in portable version)
- **Google account** with Drive access
- **Internet connection** for Google Drive access

---

## **First Time Setup**

1. **Run the application** - Double-click `start.bat`
2. **Open browser** - Go to http://localhost:3000
3. **Configure Google Drive** - Follow the guided setup
4. **Start using** - Full functionality available immediately

---

## **Usage**

### **File Browser:**
- **Left Panel**: Select "Local Filesystem" or Google Drive remote
- **Right Panel**: Select destination (local or remote)
- **Navigate**: Click folders or use path bar
- **Select Files**: Click files (Ctrl+Click for multiple)
- **Operations**: Use operation panel for move/copy

### **Task Manager:**
- **View all operations** in real-time
- **Monitor progress** with live updates
- **Cancel running operations** if needed
- **View error messages** and retry failed tasks

---

## **Troubleshooting**

### **Application won't start:**
- Ensure Node.js is installed (included in portable version)
- Check that port 3000 is not in use
- Run as Administrator if needed

### **Google Drive not working:**
- Follow the configuration wizard
- Ensure you have proper Google account permissions
- Check internet connection

### **Files not transferring:**
- Check Google Drive API quota limits
- Ensure sufficient disk space
- Monitor task manager for specific errors

---

## **Advanced Users**

### **Build from Source:**
```bash
git clone https://github.com/yourusername/roseglass-cloudexplorer
cd roseglass-cloudexplorer
npm install
cd client && npm install && cd ..
npm run build
node server.js
```

### **Development Mode:**
```bash
npm run dev
```

---

## **Why RoseGlass CloudExplorer?**

Unlike the official Google Drive client:
- **Actually reliable** - No mysterious sync failures
- **True file operations** - Cut-paste works like expected
- **Better error handling** - Clear messages and automatic retries
- **No subscription fees** - Completely free
- **Customizable** - Open source and modifiable

---

## **Support**

- **Issues**: Report bugs on GitHub Issues
- **Documentation**: Check the README.md for detailed docs
- **Source Code**: Available on GitHub for inspection/modification

---

**Ready to try it?** Download the portable version and start using it immediately!
