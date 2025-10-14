module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  clearMocks: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo|expo-.*|@expo-.*|@react-native-.*|dayjs)'
  ],
};
