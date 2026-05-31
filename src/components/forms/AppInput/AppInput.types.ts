import { TextInputProps } from 'react-native';

export interface AppInputProps
  extends TextInputProps {
  label?: string;

  error?: string;
}