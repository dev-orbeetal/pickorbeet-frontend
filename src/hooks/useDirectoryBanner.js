'use client';

import { useEffect, useState } from 'react';
import { storeSettingsAPI } from '@/lib/api';

/** Loads the store-wide default directory banner URL once. */
export default function useDirectoryBanner() {
  const [banner, setBanner] = useState('');

  useEffect(() => {
    let active = true;
    storeSettingsAPI
      .getPublicSettings()
      .then((response) => {
        if (!active) return;
        setBanner(response.data?.default_directory_banner || '');
      })
      .catch(() => {
        if (active) setBanner('');
      });
    return () => {
      active = false;
    };
  }, []);

  return banner;
}
