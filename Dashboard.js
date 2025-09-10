import React from 'react';
import NeonButton from '../components/ui/NeonButton';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="vhs-overlay"></div>
      <div className="dashboard-content">
        <h1 className="main-title">Dungeon Master Toolbox</h1>
        <nav className="dashboard-nav">
          <NeonButton to="/campaign">Campaign</NeonButton>
          <NeonButton to="/maps">Maps</NeonButton>
          <NeonButton to="/encounters">Encounters</NeonButton>
          <NeonButton to="/characters">Characters</NeonButton>
          <NeonButton to="/notes">Notes</NeonButton>
          <NeonButton to="/quick-reference">Quick Reference</NeonButton>
        </nav>
      </div>
    </div>
  );
};

export default Dashboard;