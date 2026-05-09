function Plan(props) {

  const handleClick = () => {
    console.log(`Selected plan: ${props.name}`);
    
  };

  return (
    <div className={`plan-card ${props.popular ? "popular" : ""}`}>

      {props.popular && <div className="badge">Most Popular</div>}

      <h2 className="plan-title">{props.name}</h2>

      <h1 className="plan-price">
        ${props.price}
        <span className="duration">/{props.duration}</span>
      </h1>

      <ul className="features">
        {props.features.map((feature, index) => (
          <li key={index}>✔ {feature}</li>
        ))}
      </ul>

      <button onClick={handleClick} className="plan-btn">
        Choose Plan
      </button>
    </div>
  );
}

Plan.defaultProps = {
  name: "Plan Name",
  price: 0,
  duration: "month",
  features: [],
  popular: false,
};

export default Plan;