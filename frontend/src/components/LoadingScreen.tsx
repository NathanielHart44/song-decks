import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => prevDots.length === 3 ? '' : prevDots + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ fontSize: '2rem' }}>Loading{dots}</div>
    </div>
  );
}
