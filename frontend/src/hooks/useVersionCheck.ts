import { useEffect } from 'react';
import { VERSION } from 'src/config';

// ----------------------------------------------------------------------

const useVersionCheck = () => {
    useEffect(() => {
          const storedVersion = localStorage.getItem('appVersion');
  
        if (storedVersion !== VERSION) {
            localStorage.setItem('appVersion', VERSION);
            localStorage.clear();
            sessionStorage.clear();
        }
    }, []);
};

export default useVersionCheck;