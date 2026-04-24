import './principlesCard.css';

export default function PrinciplesCard({ number, icon: Icon, title, description }) {
  return (
    <div className="principles-card glass-card">
      <span className="principles-number">{number}</span>
      {Icon && <Icon className="principles-icon" />}
      <h3 className="principles-title">{title}</h3>
      <p className="principles-description">{description}</p>
    </div>
  );
}
