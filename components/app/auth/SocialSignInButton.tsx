import { Button } from '@/components/ui/button';
import { GoogleLogo } from '@/components/ui/icons/google-logo';
import React from 'react';

interface SocialSignInButtonProps {
  isLoading: boolean;
  onClick: (provider: 'google') => void;
  provider: 'google';
  size?: 'sm' | 'lg' | 'default' | 'icon' | null | undefined;
}

const SocialSignInButton: React.FC<SocialSignInButtonProps> = ({
  isLoading,
  onClick,
  provider,
  size = 'lg',
}) => {
  const renderLogo = () => {
    switch (provider) {
      case 'google':
        return <GoogleLogo />;
      default:
        return null;
    }
  };

  const getProviderLabel = () => {
    switch (provider) {
      case 'google':
        return 'Continue with Google';
      default:
        return 'Continue';
    }
  };

  return (
    <Button
      className="flex items-center w-full whitespace-nowrap"
      disabled={isLoading}
      innerClassName="flex items-center whitespace-nowrap"
      onClick={() => onClick(provider)}
      size={size}
      variant="outline"
    >
      {renderLogo()}
      <span>{getProviderLabel()}</span>
    </Button>
  );
};

export default SocialSignInButton;
