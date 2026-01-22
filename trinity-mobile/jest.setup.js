jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  dismissBrowser: jest.fn(),
}));

jest.mock('expo-camera', () => ({
  Camera: jest.fn(({ children }) => children),
  CameraView: jest.fn(({ children }) => children),
  useCameraPermissions: jest.fn(() => [
    { status: 'granted', granted: true },
    jest.fn(() => Promise.resolve({ status: 'granted', granted: true })),
  ]),
}));

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

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
