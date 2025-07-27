import { useEffect } from 'react';
import { router } from 'expo-router';

export default function ProfileTab() {
  useEffect(() => {
    // Redirect to the main profile screen
    router.replace('/profile');
  }, []);

  return null;
} 