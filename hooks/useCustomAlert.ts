import { useState } from 'react';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  buttons: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
}

export const useCustomAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [{ text: 'OK', onPress: () => {} }],
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    buttons: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [{ text: 'OK', onPress: () => {} }]
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      buttons,
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  return {
    alert,
    showAlert,
    hideAlert,
  };
};
