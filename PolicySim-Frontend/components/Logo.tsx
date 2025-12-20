import React from 'react';

export const Logo = ({ className = "size-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0L22.3923 6V18L12 24L1.6077 18V6L12 0Z" fill="#141414"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M9 7H13.5C15.9853 7 18 9.01472 18 11.5C18 13.9853 15.9853 16 13.5 16H11V19H9V7ZM11 9V14H13.5C14.8807 14 16 12.8807 16 11.5C16 10.1193 14.8807 9 13.5 9H11Z" fill="white"/>
  </svg>
);