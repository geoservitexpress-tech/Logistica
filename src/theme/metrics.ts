import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const METRICS = {
  screenWidth: width,
  screenHeight: height,

  isSmallDevice: width < 375,
  isTablet: width >= 768,
};