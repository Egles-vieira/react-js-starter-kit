import React from 'react';
import { LoadScript, GoogleMap } from '@react-google-maps/api';

export default function TesteMapa() {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100vh' }}
        center={{ lat: -23.55052, lng: -46.633308 }}
        zoom={12}
      />
    </LoadScript>
  );
}
