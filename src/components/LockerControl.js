import React, { useState } from 'react';
import axios from 'axios';
import './LockerControl.css';

// Helper: Haversine formula for meters
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

// Your kiosk location (static)
const kioskLat = 19.25164;
const kioskLon = 72.86574; 

function LockerControl() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [distance, setDistance] = useState(null);

  const handleOpen = async (id) => {
    setError('');
    setStatus('');
    setLoading(id);

    if (!navigator.geolocation) {
      setError('❌ Geolocation not supported by your browser.');
      setLoading(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const dist = getDistanceFromLatLonInMeters(userLat, userLon, kioskLat, kioskLon);
        setDistance(dist.toFixed(2));

        if (dist <= 2) {
          try {
            // Replace with your actual API endpoint
            const response = await axios.post('/api/open-locker', {
              lockerNumber: id,
              otp: 'abc123' // You can replace or remove OTP if not needed
            });

            if (response.data.status === 'opened') {
              setStatus(`✅ Locker ${id} opened successfully.`);
            } else {
              setStatus(`❌ Locker ${id} failed to open: ${response.data.status}`);
            }
          } catch (err) {
            console.error(err);
            setError(`❌ Error while opening locker ${id}.`);
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
      }
    );
  };

  return (
    <div className="locker-control-container">
      <h1 className="title">Smart Locker Control</h1>
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
