import './Card.css';

function Card(props) {
  return (
    <div className="card-container" style={{ borderBottomColor: props.color }}>
      <h1 className="card-number">{props.number}</h1>
      <p className="card-title">{props.title}</p>

      <div
        className="card-link"
        style={{ color: props.color }}
        onClick={props.onClick}
      >
        View List
      </div>
    </div>
  );
}

export default Card;