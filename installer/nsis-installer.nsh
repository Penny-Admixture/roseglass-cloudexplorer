; RoseGlass CloudExplorer NSIS Installer Script
; This script handles the installation process including Rclone setup

!include "MUI2.nsh"
!include "FileFunc.nsh"

; Installer Information
Name "RoseGlass CloudExplorer"
OutFile "RoseGlassCloudExplorer-Setup.exe"
InstallDir "$PROGRAMFILES64\RoseGlass\CloudExplorer"
InstallDirRegKey HKLM "Software\RoseGlass\CloudExplorer" "InstallDir"
RequestExecutionLevel admin

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "..\assets\icon.ico"
!define MUI_UNICON "..\assets\icon.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "..\assets\header.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "..\assets\welcome.bmp"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

; Installer Sections
Section "Main Application" SecMain
    SetOutPath "$INSTDIR"
    
    ; Copy application files
    File /r "..\dist\win-unpacked\*"
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\RoseGlass CloudExplorer"
    CreateShortCut "$SMPROGRAMS\RoseGlass CloudExplorer\RoseGlass CloudExplorer.lnk" "$INSTDIR\RoseGlass CloudExplorer.exe"
    CreateShortCut "$SMPROGRAMS\RoseGlass CloudExplorer\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
    CreateShortCut "$DESKTOP\RoseGlass CloudExplorer.lnk" "$INSTDIR\RoseGlass CloudExplorer.exe"
    
    ; Write registry keys
    WriteRegStr HKLM "Software\RoseGlass\CloudExplorer" "InstallDir" "$INSTDIR"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RoseGlassCloudExplorer" "DisplayName" "RoseGlass CloudExplorer"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RoseGlassCloudExplorer" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RoseGlassCloudExplorer" "DisplayIcon" "$INSTDIR\RoseGlass CloudExplorer.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RoseGlassCloudExplorer" "Publisher" "RoseGlass"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RoseGlassCloudExplorer" "DisplayVersion" "1.0.0"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RoseGlassCloudExplorer" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RoseGlassCloudExplorer" "NoRepair" 1
    
    ; Create uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    
    ; Set file associations
    WriteRegStr HKCR "roseglass-cloudexplorer" "" "URL:RoseGlass CloudExplorer Protocol"
    WriteRegStr HKCR "roseglass-cloudexplorer" "URL Protocol" ""
    WriteRegStr HKCR "roseglass-cloudexplorer\DefaultIcon" "" "$INSTDIR\RoseGlass CloudExplorer.exe"
    WriteRegStr HKCR "roseglass-cloudexplorer\shell\open\command" "" '"$INSTDIR\RoseGlass CloudExplorer.exe" "%1"'
SectionEnd

Section "Rclone Setup" SecRclone
    SetOutPath "$INSTDIR\rclone"
    
    ; Download and install Rclone
    DetailPrint "Downloading Rclone..."
    inetc::get "https://github.com/rclone/rclone/releases/download/v1.65.2/rclone-v1.65.2-windows-amd64.zip" "$TEMP\rclone.zip"
    Pop $0
    StrCmp $0 "OK" +3
        MessageBox MB_OK "Failed to download Rclone: $0"
        Goto +2
    
    DetailPrint "Extracting Rclone..."
    nsisunz::UnzipToLog "$TEMP\rclone.zip" "$TEMP\rclone-extract"
    Pop $0
    StrCmp $0 "success" +3
        MessageBox MB_OK "Failed to extract Rclone: $0"
        Goto +2
    
    ; Copy rclone.exe to application directory
    CopyFiles "$TEMP\rclone-extract\rclone-v1.65.2-windows-amd64\rclone.exe" "$INSTDIR\rclone\rclone.exe"
    
    ; Clean up
    Delete "$TEMP\rclone.zip"
    RMDir /r "$TEMP\rclone-extract"
    
    ; Add to PATH
    EnVar::SetHKCU
    EnVar::AddValue "PATH" "$INSTDIR\rclone"
    Pop $0
    StrCmp $0 "success" +2
        DetailPrint "Note: Could not add Rclone to user PATH. You may need to add it manually."
    
    DetailPrint "Rclone setup completed successfully."
SectionEnd

Section "Desktop Shortcut" SecDesktop
    CreateShortCut "$DESKTOP\RoseGlass CloudExplorer.lnk" "$INSTDIR\RoseGlass CloudExplorer.exe"
SectionEnd

Section "Start Menu Shortcut" SecStartMenu
    CreateDirectory "$SMPROGRAMS\RoseGlass CloudExplorer"
    CreateShortCut "$SMPROGRAMS\RoseGlass CloudExplorer\RoseGlass CloudExplorer.lnk" "$INSTDIR\RoseGlass CloudExplorer.exe"
    CreateShortCut "$SMPROGRAMS\RoseGlass CloudExplorer\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
SectionEnd

; Uninstaller
Section "Uninstall"
    ; Remove shortcuts
    Delete "$DESKTOP\RoseGlass CloudExplorer.lnk"
    Delete "$SMPROGRAMS\RoseGlass CloudExplorer\RoseGlass CloudExplorer.lnk"
    Delete "$SMPROGRAMS\RoseGlass CloudExplorer\Uninstall.lnk"
    RMDir "$SMPROGRAMS\RoseGlass CloudExplorer"
    
    ; Remove registry keys
    DeleteRegKey HKLM "Software\RoseGlass\CloudExplorer"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RoseGlassCloudExplorer"
    DeleteRegKey HKCR "roseglass-cloudexplorer"
    
    ; Remove application files
    RMDir /r "$INSTDIR"
    
    ; Remove from PATH
    EnVar::SetHKCU
    EnVar::DeleteValue "PATH" "$INSTDIR\rclone"
    Pop $0
SectionEnd

; Section descriptions
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} "Core application files and components."
    !insertmacro MUI_DESCRIPTION_TEXT ${SecRclone} "Download and install Rclone for Google Drive access."
    !insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} "Create a desktop shortcut for easy access."
    !insertmacro MUI_DESCRIPTION_TEXT ${SecStartMenu} "Create Start Menu shortcuts."
!insertmacro MUI_FUNCTION_DESCRIPTION_END
