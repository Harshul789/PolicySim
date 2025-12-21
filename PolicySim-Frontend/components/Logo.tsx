import React from 'react';

export const Logo = ({ className = "size-16" }: { className?: string }) => (
  <img src="/logo1.png" alt="PolicySim Logo" className={`${className} aspect-square object-contain`} />
);