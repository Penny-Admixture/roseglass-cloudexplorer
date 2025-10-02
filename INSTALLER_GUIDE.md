# RoseGlass CloudExplorer - MSI Installer Guide

## 🎉 **Complete MSI Installer Solution**

I've created a **professional MSI installer** that handles everything automatically - no user configuration required!

### **What the Installer Does Automatically:**

✅ **Downloads and installs Rclone** - No manual setup needed  
✅ **Creates native Windows application** - Electron-based desktop app  
✅ **Sets up Google Drive configuration** - Guided setup during first run  
✅ **Adds to Start Menu and Desktop** - Professional installation experience  
✅ **Handles all dependencies** - Everything bundled and ready to go  
✅ **Uninstaller included** - Clean removal when needed  

---

## **Installation Process**

### **For End Users (Simple):**

1. **Download** `RoseGlassCloudExplorer-Setup.msi`
2. **Double-click** to run the installer
3. **Follow the wizard** - it handles everything automatically
4. **Launch** from Start Menu or Desktop shortcut
5. **Configure Google Drive** when prompted (one-time setup)

**That's it!** No technical knowledge required.

---

## **For Developers (Building the Installer):**

### **Prerequisites:**
- Node.js 16+
- Windows 10/11
- Administrator access

### **Build Commands:**

```bash
# Install all dependencies
npm install

# Build the complete installer
npm run build-installer

# Or build specific components
npm run dist-win-msi    # MSI installer only
npm run dist-win        # NSIS installer only
```

### **Output Files:**
- `dist/RoseGlassCloudExplorer-Setup.msi` - Windows MSI installer
- `dist/RoseGlassCloudExplorer-Setup.exe` - NSIS installer
- `dist/win-unpacked/` - Portable application folder

---

## **Technical Architecture**

### **Electron Application:**
- **Main Process:** `electron/main.js` - Handles Rclone installation and app lifecycle
- **Renderer Process:** React app - The user interface
- **Preload Script:** `electron/preload.js` - Secure IPC communication

### **Installer Components:**
- **WiX Toolset:** Professional MSI installer with proper Windows integration
- **NSIS:** Alternative installer with custom UI
- **Electron Builder:** Automated build and packaging

### **Rclone Integration:**
- **Auto-download:** Downloads latest Rclone during build
- **Auto-install:** Installs Rclone to application directory
- **Auto-configure:** Guides user through Google Drive setup
- **Auto-update:** Can update Rclone when new versions are available

---

## **Installer Features**

### **MSI Installer (WiX):**
- ✅ **Windows Installer standard** - Professional installation experience
- ✅ **Proper uninstaller** - Clean removal from Add/Remove Programs
- ✅ **Registry integration** - Proper Windows integration
- ✅ **File associations** - Custom protocol support
- ✅ **Elevated installation** - Handles admin requirements
- ✅ **Rollback support** - Can undo failed installations

### **NSIS Installer:**
- ✅ **Custom UI** - Branded installation experience
- ✅ **Progress indicators** - Shows download and installation progress
- ✅ **User choice** - Optional components and installation directory
- ✅ **Desktop shortcuts** - Easy access after installation
- ✅ **Start Menu integration** - Professional application placement

---

## **File Structure**

```
roseglass-cloudexplorer/
├── electron/                    # Electron application
│   ├── main.js                 # Main process
│   └── preload.js              # Preload script
├── installer/                   # Installer scripts
│   ├── nsis-installer.nsh      # NSIS installer script
│   └── msi-installer.wxs       # WiX MSI installer script
├── services/                    # Backend services
│   ├── RcloneInstaller.js      # Automated Rclone setup
│   ├── RcloneService.js        # Rclone operations
│   └── ...
├── assets/                      # Installer assets
│   ├── icon.ico                # Application icon
│   └── ...
├── build-installer.js          # Build script
└── package.json                # Build configuration
```

---

## **Build Process**

### **Automated Build Steps:**

1. **Install Dependencies** - Node.js packages and Electron
2. **Build React App** - Compile frontend to static files
3. **Download Rclone** - Get latest Rclone binary
4. **Package Electron** - Create native Windows application
5. **Create Installers** - Generate MSI and NSIS installers
6. **Test Installation** - Verify installer works correctly

### **Build Configuration:**

The `package.json` contains all build settings:

```json
{
  "build": {
    "appId": "com.roseglass.cloudexplorer",
    "productName": "RoseGlass CloudExplorer",
    "win": {
      "target": ["nsis", "msi"],
      "icon": "assets/icon.ico",
      "requestedExecutionLevel": "requireAdministrator"
    }
  }
}
```

---

## **User Experience**

### **First Run:**
1. **Launch application** - Opens native Windows window
2. **Rclone check** - Automatically detects if Rclone is installed
3. **Auto-download** - Downloads Rclone if not present
4. **Google Drive setup** - Guided configuration wizard
5. **Ready to use** - Full functionality available

### **Subsequent Runs:**
1. **Instant launch** - No setup required
2. **Full functionality** - All features available immediately
3. **Auto-updates** - Can check for application updates
4. **Settings persistence** - Remembers user preferences

---

## **Distribution**

### **Single File Distribution:**
- **MSI file** - Professional Windows installer
- **Digital signature** - Can be code-signed for trust
- **Virus scanning** - Clean installation package
- **Corporate deployment** - Can be deployed via Group Policy

### **Portable Version:**
- **Unpacked folder** - Can be run without installation
- **USB portable** - Can be run from removable media
- **No admin required** - Runs with user permissions

---

## **Troubleshooting**

### **Build Issues:**
```bash
# Clear all caches
npm cache clean --force
rm -rf node_modules
npm install

# Rebuild everything
npm run build-installer
```

### **Installation Issues:**
- **Run as Administrator** - Installer requires admin rights
- **Antivirus** - May need to whitelist the installer
- **Windows Defender** - May need to allow the application

### **Runtime Issues:**
- **Rclone not found** - Application will auto-download
- **Google Drive auth** - Follow the guided setup
- **Permissions** - Ensure application has file access

---

## **Advanced Configuration**

### **Custom Installer:**
Edit `installer/msi-installer.wxs` or `installer/nsis-installer.nsh` to customize:
- Installation directory
- Shortcut placement
- Registry entries
- File associations
- Custom actions

### **Build Customization:**
Edit `build-installer.js` to modify:
- Rclone version
- Download URLs
- Build process
- Output configuration

---

## **Summary**

This MSI installer solution provides:

🎯 **Zero-configuration installation** - Users just run the installer  
🎯 **Professional Windows integration** - Proper Start Menu, Desktop, Registry  
🎯 **Automatic Rclone setup** - No manual configuration required  
🎯 **Native desktop experience** - Electron-based Windows application  
🎯 **Easy distribution** - Single MSI file contains everything  
🎯 **Clean uninstallation** - Proper removal from Windows  

**The result:** A professional, enterprise-ready Google Drive client that installs and works immediately, with the same robust functionality as AirCluster but completely free and open source.

---

**Ready to build?** Run `npm run build-installer` and you'll have a complete MSI installer ready for distribution!
