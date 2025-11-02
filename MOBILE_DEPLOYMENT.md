# 📱 GoGig Mobile App Deployment Guide

Your GoGig app is now configured as a native mobile application using Capacitor! This guide will help you build and deploy it to iOS and Android devices.

## ✅ What's Been Set Up

- **Capacitor Core**: Native runtime for iOS and Android
- **Native Geolocation**: High-accuracy GPS tracking with background support
- **Push Notifications**: Real-time job alerts and notifications
- **Status Bar**: Customized status bar styling for iOS/Android
- **Haptics**: Vibration feedback for better UX
- **Keyboard Management**: Smart keyboard handling
- **Mobile-Optimized UI**: Touch-friendly interface with safe area support

## 🚀 Deployment Steps

### Prerequisites

**For iOS Development:**
- Mac computer with macOS 13+
- Xcode 15+ installed ([Download from Mac App Store](https://apps.apple.com/app/xcode/id497799835))
- Apple Developer Account ($99/year for App Store)

**For Android Development:**
- Android Studio installed ([Download here](https://developer.android.com/studio))
- JDK 17+ installed
- No Mac required!

### Step-by-Step Instructions

#### 1. **Export Your Project to GitHub**
   - Click the **GitHub** button in the top-right corner of Lovable
   - Click **"Connect to GitHub"** if not already connected
   - Create or connect to your repository
   - Wait for the code to sync

#### 2. **Clone Your Repository Locally**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

#### 3. **Install Dependencies**
   ```bash
   npm install
   ```

#### 4. **Build the Web App**
   ```bash
   npm run build
   ```

#### 5. **Add Native Platforms**

   **For iOS:**
   ```bash
   npx cap add ios
   npx cap update ios
   ```

   **For Android:**
   ```bash
   npx cap add android
   npx cap update android
   ```

#### 6. **Sync Your Code to Native Projects**
   ```bash
   npx cap sync
   ```
   > **Note:** Run this command every time you pull changes from GitHub!

#### 7. **Open in Native IDE**

   **For iOS:**
   ```bash
   npx cap open ios
   ```
   This opens Xcode. Press the **Play** button to run on simulator or connected device.

   **For Android:**
   ```bash
   npx cap open android
   ```
   This opens Android Studio. Press the **Run** button to launch on emulator or device.

## 🔧 Development Workflow

### Hot Reload During Development
The app is configured to connect to your Lovable sandbox for live preview:
```
https://64b9200b-3298-4144-8084-2497ab9942ce.lovableproject.com
```

### After Making Changes in Lovable:
1. Push code to GitHub (automatic in Lovable)
2. Pull changes locally: `git pull`
3. Sync to native: `npx cap sync`
4. Reload the app in your IDE

### For Production Builds:
1. Remove the server configuration from `capacitor.config.ts`:
   ```typescript
   // Comment out or remove the server section
   // server: {
   //   url: '...',
   //   cleartext: true
   // },
   ```
2. Build the app: `npm run build`
3. Sync: `npx cap sync`
4. Archive for App Store (iOS) or Generate Signed APK (Android)

## 📦 Publishing to App Stores

### iOS App Store
1. **Configure App in Xcode:**
   - Set Bundle Identifier (e.g., `com.yourcompany.gogig`)
   - Configure signing with your Apple Developer account
   - Add app icons and splash screens

2. **Archive & Upload:**
   - Product → Archive
   - Distribute App → App Store Connect
   - Follow Apple's review process

### Google Play Store
1. **Configure App in Android Studio:**
   - Set Application ID in `build.gradle`
   - Generate signing key for release builds
   - Add app icons and splash screens

2. **Build Release APK/AAB:**
   - Build → Generate Signed Bundle/APK
   - Upload to Google Play Console
   - Follow Google's review process

## 🔐 Required Permissions

The app requests these permissions:

**iOS (Info.plist):**
- Location access: `NSLocationWhenInUseUsageDescription`
- Background location: `NSLocationAlwaysAndWhenInUseUsageDescription`
- Push notifications: Automatic

**Android (AndroidManifest.xml):**
- Location: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- Background location: `ACCESS_BACKGROUND_LOCATION`
- Push notifications: `POST_NOTIFICATIONS` (Android 13+)

These are already configured in the native projects after running `npx cap add`.

## 🐛 Troubleshooting

**Issue:** "Command not found: cap"
- **Solution:** Make sure you ran `npm install` first

**Issue:** iOS build fails in Xcode
- **Solution:** Update CocoaPods: `cd ios/App && pod install`

**Issue:** Android build fails
- **Solution:** Invalidate caches in Android Studio: File → Invalidate Caches / Restart

**Issue:** App shows blank screen
- **Solution:** Make sure you ran `npm run build` before `npx cap sync`

**Issue:** Location not working
- **Solution:** Check that permissions are granted in device Settings

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Lovable Documentation](https://docs.lovable.dev/)

## 🎉 What's Next?

Your app is ready for mobile! Key features now available:
- ✅ Real-time worker GPS tracking (foreground + background)
- ✅ Push notifications for job updates
- ✅ Native maps integration
- ✅ Camera access for profile photos
- ✅ Offline support
- ✅ Professional app store presence

Need help? Check the [Capacitor troubleshooting docs](https://capacitorjs.com/docs/getting-started/troubleshooting) or ask in the Lovable Discord community!
