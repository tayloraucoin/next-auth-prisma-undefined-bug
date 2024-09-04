import React from 'react';
import { cn } from '@/lib/utils';

interface AuthFormWrapperProps {
  title: string;
  children: React.ReactNode;
}

const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({
  title,
  children,
}) => {
  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen">
      <div
        className={cn(
          'bg-white max-w-[90%] p-6 rounded-md shadow-md w-full',
          'md:max-w-md',
        )}
      >
        <h2 className="pb-8 text-center text-2xl">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default AuthFormWrapper;
