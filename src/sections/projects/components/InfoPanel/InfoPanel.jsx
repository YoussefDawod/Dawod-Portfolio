import { IoOpenOutline } from 'react-icons/io5';
import { FiGithub } from 'react-icons/fi';
import './infoPanel.css';

function InfoPanel({ project, index, total, isLeaving }) {
  const counter = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <div className={`info-panel${isLeaving ? ' is-leaving' : ''}`}>
      <span className="info-counter">{counter}</span>

      <h2 className="info-title">{project.title}</h2>

      <div className="info-badges">
        {project.tech.map((t) => {
          const Icon = t.icon;
          return (
            <span
              key={t.name}
              className="info-badge"
              style={{ '--badge-color': t.color }}
            >
              {Icon && <Icon className="info-badge-icon" />}
              {t.name}
            </span>
          );
        })}
      </div>

      <p className="info-desc">{project.description}</p>

      <div className="info-links">
        <a
          href={project.liveUrl || '#'}
          className={`info-link info-link--primary${!project.liveUrl ? ' info-link--disabled' : ''}`}
          target={project.liveUrl ? '_blank' : undefined}
          rel="noopener noreferrer"
          aria-disabled={!project.liveUrl}
        >
          Live Demo öffnen&nbsp;<IoOpenOutline />
        </a>
        <a
          href={project.githubUrl || '#'}
          className={`info-link info-link--secondary${!project.githubUrl ? ' info-link--disabled' : ''}`}
          target={project.githubUrl ? '_blank' : undefined}
          rel="noopener noreferrer"
          aria-disabled={!project.githubUrl}
        >
          <FiGithub />&nbsp;GitHub Repository
        </a>
      </div>
    </div>
  );
}

export default InfoPanel;
