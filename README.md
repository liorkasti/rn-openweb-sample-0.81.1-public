# OpenWeb RN Sample 0.81.1

React Native 0.81.1 sample app for testing OpenWeb SDK integration. Supports both Old (Paper/Bridge) and New (Fabric/TurboModules) architectures.

## Purpose

This POC validates:

- Minimum RN version compatibility for OpenWeb SDK (RN 0.81.1)
- Old Architecture (Paper/Bridge) support
- New Architecture (Fabric/TurboModules) support
- Published npm package integration

## Branches

- **`main`**: Uses published npm package `react-native-openweb-sdk`
- **`local/yalc-openweb-sdk`**: Uses yalc for local SDK development

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/liorkasti/rn-openweb-sample-0.81.1-public.git
cd rn-openweb-sample-0.81.1-public
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Install iOS dependencies

```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

## Architecture Switching

This project supports both React Native architectures. Use the built-in script to switch:

### Check current architecture

```bash
yarn arch status
```

### Switch to Old Architecture (Paper)

```bash
yarn arch old
```

### Switch to New Architecture (Fabric)

```bash
yarn arch new
```

**Note**: After switching architectures, you need to rebuild the app.

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

## Local SDK Development (yalc)

For local SDK development, switch to the `local/yalc-openweb-sdk` branch:

```bash
git checkout local/yalc-openweb-sdk
```

### Setup yalc

1. Install yalc globally:

```bash
npm install -g yalc
```

2. In the SDK repository, publish locally:

```bash
cd /path/to/react-native-openweb-sdk
yalc publish
```

3. In this project, link the local SDK:

```bash
yalc add react-native-openweb-sdk
yarn install
```

4. Update SDK after changes:

```bash
yarn update-sdk
```

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
