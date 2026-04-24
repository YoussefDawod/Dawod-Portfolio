import './skillBadge.css';

export default function SkillBadge({ name, icon: Icon, color }) {
  return (
    <div className="skill-badge" style={{ '--skill-color': color }}>
      {Icon && <Icon className="skill-badge-icon" />}
      <span className="skill-badge-name">{name}</span>
    </div>
  );
}
