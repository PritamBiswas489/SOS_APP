import React from 'react';
import { GoogleFitProvider } from './GoogleFitContext';
import { BleProvider } from './BleContext';
import { StressProvider } from './StressContext';

export default function HealthProvider({
  children,
  userAge = 30,
  criticalThreshold = 80,
  gfRefreshMs = 30_000, //
  onSos = null,
}) {
  return (
    <GoogleFitProvider refreshIntervalMs={gfRefreshMs}>
      <BleProvider>
        <StressProvider
          userAge={userAge}
          criticalThreshold={criticalThreshold}
          onSos={onSos}
        >
          {children}
        </StressProvider>
      </BleProvider>
    </GoogleFitProvider>
  );
}
