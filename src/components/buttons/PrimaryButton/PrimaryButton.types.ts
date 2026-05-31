export interface PrimaryButtonProps {
  title: string;

  onPress: () => void;

  loading?: boolean;

  disabled?: boolean;
}