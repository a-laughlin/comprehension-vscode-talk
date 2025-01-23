import { useEffect, useLayoutEffect, useState } from 'react';

export const useLightOrDarkMode = ()=>{
  const [visMode,setVisMode] = useState<'dark'|'light'>('light');
  useLayoutEffect(()=>{
    setVisMode(document.body.className.includes('light') ? 'light' : 'dark');
  },[]);
  return visMode;
}
