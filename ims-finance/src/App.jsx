import React, { useState, useCallback, useEffect } from 'react';
import KalkulatorAngsuran from './components/KalkulatorAngsuran';
import JatuhTempo from './components/JatuhTempo';
import DendaKeterlambatan from './components/DendaKeterlambatan';
import Panduan from './components/Panduan';
import { api } from './api.js';
import './App.css';

const TABS = [
  { id: 'kalkulator', emoji: '🧮', label: 'Kalkulator Angsuran', sub: 'Soal 1' },
  { id: 'jatuh-tempo', emoji: '📅', label: 'Jatuh Tempo',        sub: 'Soal 2' },
  { id: 'denda',      emoji: '⚠️', label: 'Denda Keterlambatan', sub: 'Soal 3' },
];

export default function App() {
  const [activeTab, setActiveTab]     = useState('kalkulator');
  const [contracts, setContracts]     = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [theme, setTheme]             = useState(() => localStorage.getItem('ims-theme') || 'dark');

  // ── Apply theme to body ───────────────────────────────────
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('ims-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // ── Load data saat pertama buka ───────────────────────────
  useEffect(() => {
    api.getAll()
      .then(data => { setContracts(data); setLoading(false); })
      .catch(()  => { setLoading(false); });
  }, []);

  // ── Toast ─────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Save / update kontrak ─────────────────────────────────
  const handleSaveContract = useCallback(async (data) => {
    try {
      await api.save(data);
      setContracts(prev => {
        const idx = prev.findIndex(c => c.kontrakNo === data.kontrakNo);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data;
          setSelectedIdx(idx);
          return updated;
        }
        setSelectedIdx(prev.length);
        return [...prev, data];
      });
      showToast('✅ Kontrak berhasil disimpan!');
    } catch {
      showToast('❌ Gagal menyimpan kontrak', 'error');
    }
  }, [showToast]);

  // ── Delete kontrak ────────────────────────────────────────
  const handleDeleteContract = useCallback(async (idx) => {
    const kontrakNo = contracts[idx]?.kontrakNo;
    try {
      await api.delete(kontrakNo);
      setContracts(prev => {
        const next = prev.filter((_, i) => i !== idx);
        setSelectedIdx(next.length > 0 ? 0 : null);
        return next;
      });
      showToast('🗑️ Kontrak dihapus');
    } catch {
      showToast('❌ Gagal menghapus kontrak', 'error');
    }
  }, [contracts, showToast]);

  return (
    <div className="app">

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`app-toast ${toast.type === 'error' ? 'app-toast--error' : ''}`}>
          {toast.msg}
        </div>
      )}

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
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
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
        {loading ? (
          <div className="app-loading">
            <div className="app-loading-spinner" />
            <span>Memuat data...</span>
          </div>
        ) : (
          <>
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
          </>
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

      {/* ── Floating ChatBot ── */}
      <Panduan contracts={contracts} />
    </div>
  );
}
