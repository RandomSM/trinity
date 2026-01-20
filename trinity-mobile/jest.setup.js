// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  dismissBrowser: jest.fn(),
}));

// Mock expo-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: {
    requestCameraPermission: jest.fn(() => Promise.resolve('granted')),
    getCameraPermissionStatus: jest.fn(() => 'granted'),
  },
  useCameraDevice: jest.fn(() => ({
    id: 'mock-camera',
    position: 'back',
  })),
  useCodeScanner: jest.fn(() => ({
    onCodeScanned: jest.fn(),
  })),
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `exp://127.0.0.1:8081/${path}`),
  addEventListener: jest.fn(() => ({
    remove: jest.fn()
  })),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  useURL: jest.fn(() => null),
}));

// Mock react-native Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  createURL: jest.fn((path) => `exp://127.0.0.1:8081/${path}`),
  addEventListener: jest.fn(() => ({
    remove: jest.fn()
  })),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
