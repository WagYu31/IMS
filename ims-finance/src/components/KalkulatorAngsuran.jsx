import React, { useState } from 'react';
import {
  formatRupiah, formatTanggal,
  hitungAngsuran, generateJadwal,
} from '../utils/kalkulasi';
import './KalkulatorAngsuran.css';

const EMPTY = {
  kontrakNo: '', clientName: '',
  otr: '', dpPersen: 20, tenorBulan: 18,
  bungaPerTahun: 14, tglMulai: '2024-01-25',
};

const NUM_FIELDS = ['tenorBulan'];
const PERCENT_FIELDS = ['dpPersen', 'bungaPerTahun'];

/** Format angka ke "Rp 240.000.000" untuk tampilan di input */
const formatInputRupiah = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return 'Rp ' + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/** Kembalikan ke angka murni dari string "Rp 240.000.000" → 240000000 */
const parseInputRupiah = (str) => {
  const digits = str.replace(/\D/g, '');
  return digits ? parseFloat(digits) : '';
};

/** Format angka ke "20%" untuk tampilan di input */
const formatInputPercent = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  return val + '%';
};

/** Parse "20%" → 20 */
const parseInputPercent = (str) => {
  const cleaned = str.replace(/%/g, '').trim();
  return cleaned ? parseFloat(cleaned) : '';
};

export default function KalkulatorAngsuran({ contracts, selectedIdx, onSelect, onSave, onDelete }) {
  const [form, setForm]       = useState(EMPTY);
  const [preview, setPreview] = useState(null);
  const [editIdx, setEditIdx] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'otr') {
      setForm(p => ({ ...p, otr: parseInputRupiah(value) }));
    } else if (PERCENT_FIELDS.includes(name)) {
      setForm(p => ({ ...p, [name]: parseInputPercent(value) }));
    } else if (NUM_FIELDS.includes(name)) {
      setForm(p => ({ ...p, [name]: parseFloat(value) || '' }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
    setPreview(null);
  };

  const handleHitung = () => {
    const k = hitungAngsuran(form.otr, form.dpPersen, form.tenorBulan, form.bungaPerTahun);
    const j = generateJadwal(form.kontrakNo, k.angsuranPerBulan, form.tenorBulan, form.tglMulai);
    setPreview({ hasil: k, jadwal: j });
  };

  const handleSimpan = () => {
    if (!preview) return;
    onSave({ kontrakNo: form.kontrakNo, clientName: form.clientName, form: { ...form }, hasil: preview.hasil, jadwal: preview.jadwal });
    setForm(EMPTY); setPreview(null); setEditIdx(null);
  };

  const handleEdit = (idx) => {
    const c = contracts[idx];
    setForm(c.form); setPreview({ hasil: c.hasil, jadwal: c.jadwal });
    setEditIdx(idx); onSelect(idx);
  };

  const handleReset = () => { setForm(EMPTY); setPreview(null); setEditIdx(null); };

  const sel = selectedIdx !== null ? contracts[selectedIdx] : null;

  return (
    <div className="kalk-page fade-in">
      {/* Page Header */}
      <div className="kalk-page-header">
        <div>
          <h2 className="kalk-page-title">🧮 Kalkulator Angsuran Kredit</h2>
          <p className="kalk-page-desc">Hitung jadwal cicilan kendaraan bermotor dengan metode flat rate</p>
        </div>
        <span className="badge badge-blue">Soal 1</span>
      </div>

      <div className="kalk-body">
        {/* ═══ LEFT — Form + Preview ═══ */}
        <div className="kalk-left">

          {/* Form Card */}
          <div className="card card--accent-top card--accent-blue">
            <div className="section-heading">
              {editIdx !== null ? '✏️ Edit Kontrak' : '➕ Tambah Kontrak Baru'}
            </div>
            <p className="section-sub">Masukkan data kredit untuk menghitung angsuran</p>

            <div className="kalk-grid">
              <div className="form-group">
                <label className="form-label">Nomor Kontrak</label>
                <input className="form-control" type="text" name="kontrakNo"
                  value={form.kontrakNo} onChange={handleChange} placeholder="AGR00001" />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Client</label>
                <input className="form-control" type="text" name="clientName"
                  value={form.clientName} onChange={handleChange} placeholder="Nama lengkap" />
              </div>
              <div className="form-group">
                <label className="form-label">Harga OTR</label>
                <input
                  className="form-control"
                  type="text"
                  name="otr"
                  inputMode="numeric"
                  value={formatInputRupiah(form.otr)}
                  onChange={handleChange}
                  placeholder="Rp 240.000.000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Down Payment</label>
                <input
                  className="form-control"
                  type="text"
                  name="dpPersen"
                  inputMode="decimal"
                  value={formatInputPercent(form.dpPersen)}
                  onChange={handleChange}
                  placeholder="20%"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tenor (Bulan)</label>
                <input className="form-control" type="number" name="tenorBulan"
                  value={form.tenorBulan} onChange={handleChange} min="1" placeholder="18" />
              </div>
              <div className="form-group">
                <label className="form-label">Bunga Flat / Tahun</label>
                <input
                  className="form-control"
                  type="text"
                  name="bungaPerTahun"
                  inputMode="decimal"
                  value={formatInputPercent(form.bungaPerTahun)}
                  onChange={handleChange}
                  placeholder="14%"
                />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Tanggal Angsuran Pertama</label>
                <input className="form-control" type="date" name="tglMulai"
                  value={form.tglMulai} onChange={handleChange} />
              </div>
            </div>

            <div className="kalk-actions">
              <button className="btn btn-primary"
                onClick={handleHitung}
                disabled={!form.kontrakNo || !form.clientName || !form.otr}>
                ✨ Hitung Angsuran
              </button>
              {preview && (
                <button className="btn btn-save" onClick={handleSimpan}>
                  💾 Simpan Kontrak
                </button>
              )}
              <button className="btn btn-outlined" onClick={handleReset}>🔄 Reset</button>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="card card--accent-top card--accent-amber fade-in">
              <div className="preview-header">
                <div>
                  <div className="section-heading">📊 Preview Hasil</div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    {form.kontrakNo} &middot; {form.clientName}
                  </p>
                </div>
                <span className="badge badge-amber">Belum Disimpan</span>
              </div>

              <div className="preview-stats">
                <div className="ps-item">
                  <span className="ps-label">Down Payment</span>
                  <span className="ps-val ps-val--dp">{formatRupiah(preview.hasil.dp)}</span>
                </div>
                <div className="ps-item">
                  <span className="ps-label">Pokok Pinjaman</span>
                  <span className="ps-val ps-val--pokok">{formatRupiah(preview.hasil.pokok)}</span>
                </div>
                <div className="ps-item">
                  <span className="ps-label">Total Bunga</span>
                  <span className="ps-val ps-val--bunga">{formatRupiah(preview.hasil.bungaTotal)}</span>
                </div>
                <div className="ps-item">
                  <span className="ps-label">Total Bayar</span>
                  <span className="ps-val">{formatRupiah(preview.hasil.totalBayar)}</span>
                </div>
                <div className="ps-item ps-item--highlight">
                  <span className="ps-label">💳 Angsuran / Bulan</span>
                  <span className="ps-val ps-val--amount">{formatRupiah(preview.hasil.angsuranPerBulan)}</span>
                </div>
              </div>

              {/* Jadwal mini-table */}
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>KE</th>
                      <th>ANGSURAN/BLN</th>
                      <th>JATUH TEMPO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.jadwal.map(row => (
                      <tr key={row.angsuran_ke}>
                        <td><span className="ke-chip">{row.angsuran_ke}</span></td>
                        <td className="td-amount">{formatRupiah(row.angsuran_per_bulan)}</td>
                        <td className="td-mono">{formatTanggal(row.tanggal_jatuh_tempo)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</td>
                      <td className="td-amount" style={{ color: 'var(--primary-light)', fontSize: 'var(--text-base)' }}>
                        {formatRupiah(preview.jadwal.reduce((s, r) => s + r.angsuran_per_bulan, 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="alert alert-info" style={{ marginTop: 'var(--space-4)' }}>
                💾 Klik <strong>Simpan Kontrak</strong> untuk menyimpan data ini ke daftar kontrak.
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT — Contract List + Detail ═══ */}
        <div className="kalk-right">

          {/* Daftar Kontrak */}
          <div className="card card--accent-top card--accent-violet contracts-panel">
            <div className="cp-header">
              <div>
                <div className="section-heading">📋 Daftar Kontrak</div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  {contracts.length} kontrak tersimpan
                </p>
              </div>
              {contracts.length > 0 && (
                <span className="badge badge-green">{contracts.length} Data</span>
              )}
            </div>

            {contracts.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon">📭</div>
                <div className="cp-empty-title">Belum ada kontrak</div>
                <div className="cp-empty-desc">Hitung dan simpan kontrak baru di form sebelah kiri</div>
              </div>
            ) : (
              <div className="cp-list">
                {contracts.map((c, idx) => (
                  <div
                    key={c.kontrakNo}
                    className={`cp-item ${selectedIdx === idx ? 'cp-item--active' : ''}`}
                    onClick={() => onSelect(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && onSelect(idx)}
                    aria-pressed={selectedIdx === idx}
                  >
                    <div className="cp-item-body">
                      <div className="cp-item-top">
                        <span className="cp-kontrak-no">{c.kontrakNo}</span>
                        <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                          {c.form.tenorBulan} bln
                        </span>
                      </div>
                      <div className="cp-client-name">{c.clientName}</div>
                      <div className="cp-meta">
                        <span className="cp-meta-row">OTR: <strong>{formatRupiah(c.form.otr)}</strong></span>
                        <span className="cp-meta-row">DP: <strong>{c.form.dpPersen}%</strong> &middot; Bunga: <strong>{c.form.bungaPerTahun}%/thn</strong></span>
                        <span className="cp-meta-row">
                          Cicilan: <strong style={{ color: 'var(--success)' }}>{formatRupiah(c.hasil.angsuranPerBulan)}/bln</strong>
                        </span>
                      </div>
                    </div>
                    <div className="cp-item-actions">
                      <button className="cp-btn cp-btn--edit"
                        onClick={e => { e.stopPropagation(); handleEdit(idx); }}
                        title="Edit kontrak" aria-label="Edit kontrak">✏️</button>
                      <button className="cp-btn cp-btn--del"
                        onClick={e => { e.stopPropagation(); onDelete(idx); }}
                        title="Hapus kontrak" aria-label="Hapus kontrak">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Detail — single-column inside narrow sidebar */}
          {sel && (
            <div className="card card--accent-top card--accent-green selected-detail fade-in">
              <div className="section-heading">🔍 Detail: {sel.kontrakNo}</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                Client: <strong style={{ color: 'var(--text-secondary)' }}>{sel.clientName}</strong>
              </p>

              {/* Single-column stat list — no overflow */}
              <div className="sidebar-stats">
                <div className="sidebar-stat">
                  <div className="sidebar-stat-label">Harga OTR</div>
                  <div className="sidebar-stat-value">{formatRupiah(sel.form.otr)}</div>
                </div>
                <div className="sidebar-stat">
                  <div className="sidebar-stat-label">Down Payment ({sel.form.dpPersen}%)</div>
                  <div className="sidebar-stat-value sidebar-stat-value--dp">{formatRupiah(sel.hasil.dp)}</div>
                </div>
                <div className="sidebar-stat">
                  <div className="sidebar-stat-label">Pokok Pinjaman</div>
                  <div className="sidebar-stat-value sidebar-stat-value--pokok">{formatRupiah(sel.hasil.pokok)}</div>
                </div>
                <div className="sidebar-stat">
                  <div className="sidebar-stat-label">Total Bunga ({sel.form.bungaPerTahun}%/thn)</div>
                  <div className="sidebar-stat-value" style={{ color: 'var(--danger-light)' }}>
                    {formatRupiah(sel.hasil.bungaTotal)}
                  </div>
                </div>
                <div className="sidebar-stat sidebar-stat--highlight">
                  <div className="sidebar-stat-label">💳 Angsuran / Bulan</div>
                  <div className="sidebar-stat-value sidebar-stat-value--main">
                    {formatRupiah(sel.hasil.angsuranPerBulan)}
                  </div>
                  <div className="sidebar-stat-sub">
                    {sel.form.tenorBulan} bulan &middot; flat {sel.form.bungaPerTahun}%/thn
                  </div>
                </div>
              </div>

              <div className="alert alert-success" style={{ marginTop: 'var(--space-4)' }}>
                ✅ Kontrak aktif &mdash; buka tab <strong>Jatuh Tempo</strong> atau <strong>Denda</strong> untuk analisa.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
