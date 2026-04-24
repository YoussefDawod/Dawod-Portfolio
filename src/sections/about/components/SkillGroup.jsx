import SkillBadge from './SkillBadge';
import './skillGroup.css';

export default function SkillGroup({ name, skills }) {
  return (
    <div className="skill-group glass-card">
      <h4 className="skill-group-name">{name}</h4>
      <div className="skill-group-list">
        {skills.map((skill, index) => (
          <div
            key={skill.name}
            className="skill-badge-row"
            style={{ '--badge-stagger': index }}
          >
            <SkillBadge {...skill} />
          </div>
        ))}
      </div>
    </div>
  );
}
