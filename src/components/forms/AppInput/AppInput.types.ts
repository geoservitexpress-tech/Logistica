import { TextInputProps } from 'react-native';

export interface AppInputProps
  extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
}