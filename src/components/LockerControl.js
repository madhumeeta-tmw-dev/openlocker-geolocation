// src/components/LockerControl.js

import React, { useState } from 'react';
import { openLocker } from '../services/LockerService';
import './LockerControl.css';

// Helper: Haversine formula to calculate distance in meters
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Static kiosk location
const kioskLat = 19.25164;
const kioskLon = 72.86574;

function LockerControl() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [distance, setDistance] = useState(null);
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);

  const handleOpen = async (id) => {
    setError('');
    setStatus('');
    setLoading(id);

    if (!navigator.geolocation) {
      setError('❌ Geolocation is not supported by your browser.');
      setLoading(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLon = position.coords.longitude;
        setUserLat(currentLat);
        setUserLon(currentLon);

        const dist = getDistanceFromLatLonInMeters(currentLat, currentLon, kioskLat, kioskLon);
        setDistance(dist.toFixed(2));

        if (dist <= 5) {
          try {
            console.log("sending api")
            await openLocker(id); // Using service function
            setStatus(`✅ Locker ${id} opened successfully.`);
          } catch (err) {
            console.error(err);
            setError(`❌ Failed to open locker ${id}: ${err.message}`);
          }
        } else {
          setStatus(`📍 You are ${dist.toFixed(2)} meters away. Must be within 5 meters.`);
        }

        setLoading(null);
      },
      (err) => {
        console.error(err);
        setError('❌ Location access denied or error.');
        setLoading(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="locker-control-container">
      <h1 className="title">Smart Locker Control</h1>
      <div className="location-info">
        <p><strong>Kiosk Location:</strong> Latitude: {kioskLat}, Longitude: {kioskLon}</p>
        {userLat && userLon ? (
          <p><strong>Your Location:</strong> Latitude: {userLat.toFixed(6)}, Longitude: {userLon.toFixed(6)}</p>
        ) : (
          <p>📍 Click a locker button to fetch your location.</p>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      {status && <div className="status">{status}</div>}
      {distance && <div className="distance">📏 Distance: {distance} meters</div>}

      <div className="button-grid">
        {[1, 2, 3, 4].map((id) => (
          <button
            key={id}
            onClick={() => handleOpen(id)}
            className="locker-button"
            disabled={loading === id}
          >
            {loading === id ? 'Opening...' : `Open Locker ${id}`}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LockerControl;
