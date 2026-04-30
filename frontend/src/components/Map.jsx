import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getLatestLocations, simulateMovement } from '../api/requests';
import './Map.css';

const TEACHER_COLOR = '#f1c40f';

const savedClassColors = {};

const getClassColor = (className) => {
  if (savedClassColors[className]) {
    return savedClassColors[className];
  }

  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

  savedClassColors[className] = randomColor;

  return randomColor;
};

const getMarkerIcon = (color) => {
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="44" 
         fill="white" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
      <circle cx="12" cy="10" r="3" fill="${color}" stroke="none" />
    </svg>`;

  return L.divIcon({className: 'custom-pin-icon', html: pinSvg, iconSize: [28, 42], iconAnchor: [14, 42], popupAnchor: [0, -40]});
};

function Map({ onSimulationEnd }) {
  const mapCenter = [31.770, 35.220];
  const [locations, setLocations] = useState([]);

  const loadLocations = async () => {
    try {
      const res = await getLatestLocations();
      setLocations(res.data);
    } catch (err) { console.error("Error fetching locations:", err); }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleSimulate = async () => {
    try {
      await simulateMovement();

      await loadLocations();

      if (onSimulationEnd) {
        onSimulationEnd();
      }
    } catch (err) {
      console.error("Error during simulation:", err);
    }
  };

  const uniqueClasses = [...new Set(locations
    .filter(loc => loc.person_type === 'student' && loc.class_name && loc.class_name !== 'Unknown')
    .map(loc => loc.class_name)
  )];

  return (
    <div className="map-wrapper">
      <div className="map-header">
        <h3>Map</h3>

        <div className="legend-group">
          <span className="legend-item">
            <div className="legend-color" style={{ backgroundColor: TEACHER_COLOR }}></div> Teacher
          </span>
          {uniqueClasses.map(cls => (
            <span key={cls} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getClassColor(cls) }}></div> {cls}
            </span>
          ))}
        </div>

        <div className="action-buttons">
          <button onClick={handleSimulate} className="btn-simulate">Simulate</button>
          <button onClick={loadLocations} className="btn-refresh">Refresh</button>
        </div>
      </div>

      <div className="map-container-box">
        <MapContainer center={mapCenter} zoom={15} style={{height: '100%', width: '100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {locations.map((loc, index) => {
            const lat = loc.lat;
            const lng = loc.lng;
            if (!lat || !lng) return null;
            if (loc.person_type === 'student' && (!loc.class_name || loc.class_name === 'Unknown')) {
              return null;
            }
            const markerColor = loc.person_type === 'teacher' ? TEACHER_COLOR : getClassColor(loc.class_name);

            return (
              <Marker key={`${loc.person_id}-${index}`} position={[lat, lng]} icon={getMarkerIcon(markerColor)}>
                <Popup>
                  <div className="popup-content">
                    <strong>{loc.name || "Unknown"}</strong><br/>
                    <span style={{color: '#888', fontSize: '11px'}}>
                      {loc.person_type === 'teacher' ? `Teacher, Class: ${loc.class_name}` : `Class: ${loc.class_name}`}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default Map;