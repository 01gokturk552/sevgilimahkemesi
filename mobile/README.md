# Sevgili Mahkemesi Mobile

Expo / React Native app for Android and iOS. The browser app remains in the parent folder.

## Run on a device

```bash
cd mobile
npm install
npx expo start
```

Install Expo Go on a test phone and scan the development QR code. The app stores player names, completed cases, and the active case on that device.

## Android APK

Sign in to an Expo account and link this app to an EAS project once:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Then run:

```bash
npm run apk
```

This uses EAS Build's internal `preview` profile and produces an installable APK.

## Store builds

```bash
npm run build:stores
```

The production profile builds Android and iOS store artifacts. Publishing requires Google Play and Apple Developer accounts, store listing assets and privacy details, and signing credentials. iOS can be built in EAS cloud from Windows; local Xcode is not required.

## Engine tests

```bash
npm run test:engine
```