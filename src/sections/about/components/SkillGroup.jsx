import SkillBadge from './SkillBadge';
import './skillGroup.css';

export default function SkillGroup({ name, skills }) {
  return (
    <div className="skill-group">
      <h4 className="skill-group-name">{name}</h4>
      <div className="skill-group-list">
        {skills.map((skill) => (
          <SkillBadge key={skill.name} {...skill} />
        ))}
      </div>
    </div>
  );
}
