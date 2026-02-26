#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXAMPLE_DIR = path.resolve(__dirname, '..');
const PODFILE_PATH = path.join(EXAMPLE_DIR, 'ios', 'Podfile');
const GRADLE_PROPS_PATH = path.join(
  EXAMPLE_DIR,
  'android',
  'gradle.properties'
);

const ARCHITECTURES = {
  old: { ios: '0', android: 'false', label: 'Old Architecture (Bridge)' },
  new: {
    ios: '1',
    android: 'true',
    label: 'New Architecture (Fabric + TurboModules)',
  },
};

function getCurrentArchitecture() {
  const podfile = fs.readFileSync(PODFILE_PATH, 'utf8');
  const gradleProps = fs.readFileSync(GRADLE_PROPS_PATH, 'utf8');

  const iosMatch = podfile.match(/ENV\['RCT_NEW_ARCH_ENABLED'\]\s*=\s*'(\d)'/);
  const androidMatch = gradleProps.match(/newArchEnabled=(true|false)/);

  const iosArch = iosMatch?.[1] === '1' ? 'new' : 'old';
  const androidArch = androidMatch?.[1] === 'true' ? 'new' : 'old';

  return { ios: iosArch, android: androidArch };
}

function updatePodfile(arch) {
  let content = fs.readFileSync(PODFILE_PATH, 'utf8');
  content = content.replace(
    /ENV\['RCT_NEW_ARCH_ENABLED'\]\s*=\s*'\d'/,
    `ENV['RCT_NEW_ARCH_ENABLED'] = '${ARCHITECTURES[arch].ios}'`
  );
  fs.writeFileSync(PODFILE_PATH, content);
}

function updateGradleProperties(arch) {
  let content = fs.readFileSync(GRADLE_PROPS_PATH, 'utf8');
  content = content.replace(
    /newArchEnabled=(true|false)/,
    `newArchEnabled=${ARCHITECTURES[arch].android}`
  );
  fs.writeFileSync(GRADLE_PROPS_PATH, content);
}

function runPodInstall() {
  console.log('\n📦 Running pod install...');
  try {
    execSync('pod install', {
      cwd: path.join(EXAMPLE_DIR, 'ios'),
      stdio: 'inherit',
    });
    console.log('✅ Pod install completed');
  } catch {
    console.error('❌ Pod install failed. You may need to run it manually.');
  }
}

function cleanAndroid() {
  console.log('\n🧹 Cleaning Android build...');
  try {
    execSync('./gradlew clean', {
      cwd: path.join(EXAMPLE_DIR, 'android'),
      stdio: 'inherit',
    });
    console.log('✅ Android clean completed');
  } catch {
    console.error('❌ Android clean failed. You may need to run it manually.');
  }
}

function printUsage() {
  console.log(`
Usage: yarn arch <command>

Commands:
  old      Switch to old architecture (Bridge)
  new      Switch to new architecture (Fabric + TurboModules)
  status   Show current architecture status

Options:
  --skip-ios       Skip iOS pod install
  --skip-android   Skip Android clean
  --skip-install   Skip both pod install and Android clean
`);
}

function printStatus() {
  const current = getCurrentArchitecture();
  console.log('\n📊 Current Architecture Status:');
  console.log(
    `   iOS:     ${current.ios === 'new' ? 'New Architecture' : '🔧 Old Architecture'}`
  );
  console.log(
    `   Android: ${current.android === 'new' ? 'New Architecture' : '🔧 Old Architecture'}`
  );

  if (current.ios !== current.android) {
    console.log(
      '\n⚠️  Warning: iOS and Android are on different architectures!'
    );
  }
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const skipIos =
    args.includes('--skip-ios') || args.includes('--skip-install');
  const skipAndroid =
    args.includes('--skip-android') || args.includes('--skip-install');

  if (!command || !['old', 'new', 'status'].includes(command)) {
    printUsage();
    process.exit(command ? 1 : 0);
  }

  if (command === 'status') {
    printStatus();
    return;
  }

  const targetArch = command;
  const current = getCurrentArchitecture();

  console.log(`\n🔄 Switching to ${ARCHITECTURES[targetArch].label}...\n`);

  // Update iOS
  if (current.ios !== targetArch) {
    console.log(`📱 iOS: ${current.ios} → ${targetArch}`);
    updatePodfile(targetArch);
    console.log('   ✅ Updated Podfile');
  } else {
    console.log(`📱 iOS: Already on ${targetArch} architecture`);
  }

  // Update Android
  if (current.android !== targetArch) {
    console.log(`🤖 Android: ${current.android} → ${targetArch}`);
    updateGradleProperties(targetArch);
    console.log('   ✅ Updated gradle.properties');
  } else {
    console.log(`🤖 Android: Already on ${targetArch} architecture`);
  }

  // Run pod install if needed
  if (!skipIos && current.ios !== targetArch) {
    runPodInstall();
  } else if (skipIos) {
    console.log(
      '\n⏭️  Skipping pod install (run manually: cd ios && pod install)'
    );
  }

  // Clean Android if needed
  if (!skipAndroid && current.android !== targetArch) {
    cleanAndroid();
  } else if (skipAndroid) {
    console.log(
      '\n⏭️  Skipping Android clean (run manually: cd android && ./gradlew clean)'
    );
  }

  console.log(
    `\n✨ Done! App is now configured for ${ARCHITECTURES[targetArch].label}\n`
  );
}

main();
