import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';

export default function Loader({ height = 120 }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180
    }}>
      <Lottie animationData={loadingAnimation} loop={true} style={{ height }} />
    </div>
  );
}
