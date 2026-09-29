const appConfig = require('../app.json') as {
  expo: {
    ios: { bundleIdentifier: string };
    android: { package: string };
  };
};

describe('Expo app identifiers', () => {
  test('defines native identifiers for both platforms', () => {
    expect(appConfig.expo.android.package).toBe('com.sarawillers.ejtutorial2');
    expect(appConfig.expo.ios.bundleIdentifier).toBe('com.sarawillers.ejtutorial2');
  });
});
