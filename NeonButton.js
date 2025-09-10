import React from 'react';
import { Link } from 'react-router-dom';
import './NeonButton.css';

const NeonButton = ({ to, children }) => {
  return (
    <Link to={to} className="neon-button-container">
      <div className="neon-button">{children}</div>
    </Link>
  );
};

export default NeonButton;