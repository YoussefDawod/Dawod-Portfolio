import './locationBadge.css';

function LocationBadge({ label }) {
  return (
    <div className="location-badge" role="status" aria-label={`Standort: ${label}`}>
      <span className="location-badge__dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default LocationBadge;
