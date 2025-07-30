'use client';

import React from 'react';
import { MunicipalityOnboarding } from '@/components/onboarding/MunicipalityOnboarding';

export default function RegisterMunicipalityPage() {
  const handleOnboardingComplete = () => {
    // Redirect to dashboard or login page
    window.location.href = '/dashboard';
  };

  return (
    <MunicipalityOnboarding 
      onComplete={handleOnboardingComplete}
    />
  );
}
