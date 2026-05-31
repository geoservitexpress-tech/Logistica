// src/screens/auth/Register/RegisterScreen.types.ts

export interface RegisterScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
}