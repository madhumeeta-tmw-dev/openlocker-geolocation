import React, { useState } from 'react';

// Haversine formula to calculate distance (meters) between two lat/lon points
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

  return R * c; // distance in meters
}

// Fixed Kiosk Location
const kioskLat = 19.25164;
const kioskLon = 72.86574;

function App() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [distance, setDistance] = useState(null);
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);

  const handleOpen = async (lockerId) => {
    setError('');
    setStatus('');
    setLoading(lockerId);

    if (!navigator.geolocation) {
      setError('❌ Geolocation not supported by your browser.');
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

        if (dist <= 2) {
          try {
            // Simulate an API call or any action to open locker
            await new Promise((resolve) => setTimeout(resolve, 1000)); // fake delay

            setStatus(`✅ Locker ${lockerId} opened successfully.`);
          } catch (err) {
            setError(`❌ Error while opening locker ${lockerId}.`);
          }
        } else {
          setStatus(`📍 You are ${dist.toFixed(2)} meters away. Must be within 2 meters to open.`);
        }
        setLoading(null);
      },
      (err) => {
        setError('❌ Location access denied or unavailable.');
        setLoading(null);
      },
      {
        enableHighAccuracy: true,  // Ask for more accurate position
        timeout: 10000,            // 10 seconds timeout
        maximumAge: 0,             // No cache, get fresh position
      }
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Smart Locker Control</h1>

      <div style={{ marginBottom: 20 }}>
        <strong>Kiosk Location:</strong><br />
        Latitude: {kioskLat}<br />
        Longitude: {kioskLon}
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Your Current Location:</strong><br />
        {userLat && userLon
          ? <>
              Latitude: {userLat.toFixed(6)}<br />
              Longitude: {userLon.toFixed(6)}
            </>
          : "Location not fetched yet. Click any locker button to get location."
        }
      </div>

      {error && <div style={{ color: 'red', marginBottom: 15 }}>{error}</div>}
      {status && <div style={{ color: 'green', marginBottom: 15 }}>{status}</div>}
      {distance !== null && <div style={{ marginBottom: 20 }}>📏 Distance: {distance} meters</div>}

      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {[1, 2, 3, 4].map((id) => (
          <button
            key={id}
            onClick={() => handleOpen(id)}
            disabled={loading === id}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '5px',
              border: 'none',
              cursor: loading === id ? 'not-allowed' : 'pointer',
              backgroundColor: loading === id ? '#ccc' : '#007bff',
              color: 'white',
              minWidth: 130,
            }}
          >
            {loading === id ? 'Opening...' : `Open Locker ${id}`}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
