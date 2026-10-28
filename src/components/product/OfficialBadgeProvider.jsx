import { createContext, useContext, useEffect, useState } from 'react';
import { storeSettingsAPI } from '@/lib/api';
import { OFFICIAL_BADGE, officialBadgeStyle } from '@/lib/officialBadge';

const OfficialBadgeContext = createContext(OFFICIAL_BADGE);

export function OfficialBadgeProvider({ children }) {
  const [style, setStyle] = useState(OFFICIAL_BADGE);

  useEffect(() => {
    let active = true;
    storeSettingsAPI.getPublicSettings()
      .then((response) => {
        if (active) setStyle(officialBadgeStyle(response.data));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <OfficialBadgeContext.Provider value={style}>
      {children}
    </OfficialBadgeContext.Provider>
  );
}

export function useOfficialBadgeStyle() {
  return useContext(OfficialBadgeContext);
}
