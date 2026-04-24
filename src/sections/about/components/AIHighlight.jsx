import './aiHighlight.css';

export default function AIHighlight({ icon: Icon, title, text }) {
  return (
    <div className="ai-highlight glass-card">
      {Icon && <Icon className="ai-highlight-icon" />}
      <h3 className="ai-highlight-title">{title}</h3>
      <p className="ai-highlight-text">{text}</p>
    </div>
  );
}
