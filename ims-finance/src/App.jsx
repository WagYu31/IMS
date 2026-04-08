import React, { useState, useCallback, useEffect } from 'react';
import KalkulatorAngsuran from './components/KalkulatorAngsuran';
import JatuhTempo from './components/JatuhTempo';
import DendaKeterlambatan from './components/DendaKeterlambatan';
import './App.css';

const TABS = [
  { id: 'kalkulator', emoji: '🧮', label: 'Kalkulator Angsuran', sub: 'Soal 1' },
  { id: 'jatuh-tempo', emoji: '📅', label: 'Jatuh Tempo',        sub: 'Soal 2' },
  { id: 'denda',      emoji: '⚠️', label: 'Denda Keterlambatan', sub: 'Soal 3' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('kalkulator');

  // ── State — loaded from localStorage so data survives refresh ──
  const [contracts, setContracts] = useState(() => {
    try {
      const saved = localStorage.getItem('ims-contracts');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [selectedIdx, setSelectedIdx] = useState(() => {
    try {
      const saved = localStorage.getItem('ims-selected');
      return saved !== null ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Auto-save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('ims-contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('ims-selected', JSON.stringify(selectedIdx));
  }, [selectedIdx]);

  const handleSaveContract = useCallback((data) => {
    setContracts((prev) => {
      const existing = prev.findIndex(c => c.kontrakNo === data.kontrakNo);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = data;
        setSelectedIdx(existing);
        return updated;
      }
      setSelectedIdx(prev.length);
      return [...prev, data];
    });
  }, []);

  const handleDeleteContract = useCallback((idx) => {
    setContracts((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setSelectedIdx(next.length > 0 ? 0 : null);
      return next;
    });
  }, []);

  return (
    <div className="app">
      {/* ── Navbar ── */}
      <nav className="navbar" role="navigation" aria-label="Navigasi utama">
        <div className="navbar-brand">
          <img
            src="/ims-logo.png"
            alt="IMS Finance Logo"
            className="brand-logo-img"
          />
          <div className="brand-tag">Sistem Kredit Kendaraan</div>
        </div>

        <div className="navbar-tabs" role="tablist">
          <div className="tabs-inner">
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-tab-label">{tab.emoji} {tab.label}</span>
                <span className="nav-tab-badge">{tab.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="navbar-right">
          <span className="nav-company">PT. Inovasi Mitra Sejati</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="hero-strip" role="banner">
        <div className="hero-content">
          <div className="hero-badge">IMS Finance System</div>
          <h1 className="hero-title">Sistem Kredit Kendaraan</h1>
          <p className="hero-sub">
            Kalkulator angsuran kredit · Monitoring jatuh tempo · Kalkulasi denda keterlambatan
          </p>
        </div>
        <div className="hero-orbs" aria-hidden="true">
          <div className="orb orb1" />
          <div className="orb orb2" />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main-content" role="main">
        {activeTab === 'kalkulator' && (
          <KalkulatorAngsuran
            contracts={contracts}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
            onSave={handleSaveContract}
            onDelete={handleDeleteContract}
          />
        )}
        {activeTab === 'jatuh-tempo' && (
          <JatuhTempo
            contracts={contracts}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
          />
        )}
        {activeTab === 'denda' && (
          <DendaKeterlambatan
            contracts={contracts}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer" role="contentinfo">
        <div className="footer-inner">
          <span>© 2024 PT. Inovasi Mitra Sejati &mdash; Developer Assessment</span>
          <div className="footer-badges">
            <span className="badge badge-blue">React</span>
            <span className="badge badge-green">Vite</span>
            <span className="badge badge-amber">IMS Finance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
