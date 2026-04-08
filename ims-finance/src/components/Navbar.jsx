import React from 'react';
import './Navbar.css';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'kalkulator', label: '🧮 Kalkulator Angsuran', desc: 'Soal 1' },
    { id: 'jatuh-tempo', label: '📅 Jatuh Tempo', desc: 'Soal 2' },
    { id: 'denda', label: '⚠️ Denda Keterlambatan', desc: 'Soal 3' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-logo">
          <span className="logo-icon">💰</span>
        </div>
        <div>
          <div className="brand-name">IMS Finance</div>
          <div className="brand-tagline">Sistem Kredit Kendaraan</div>
        </div>
      </div>
      <div className="navbar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-tab-label">{tab.label}</span>
            <span className="nav-tab-badge">{tab.desc}</span>
          </button>
        ))}
      </div>
      <div className="navbar-right">
        <span className="nav-company">PT. Inovasi Mitra Sejati</span>
      </div>
    </nav>
  );
}
