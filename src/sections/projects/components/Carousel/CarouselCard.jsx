import './carouselCard.css';

function CarouselCard({ project, isActive, onClick }) {
  return (
    <div
      className={`carousel-card${isActive ? ' is-active' : ''}`}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-label={project.title}
      style={{ '--project-primary': project.primaryColor }}
    >
      <div className="cc-top">
        <span className="cc-num">{project.num}</span>
        <span className="cc-tech">{project.tech[0]?.name ?? project.tech[0]}</span>
      </div>
      <div className="cc-thumb" />
      <div className="cc-title">{project.title}</div>
    </div>
  );
}

export default CarouselCard;
