import React, { useState, useEffect } from 'react';
import { formatRupiah, formatTanggal, hitungTotalJatuhTempo } from '../utils/kalkulasi';
import './JatuhTempo.css';

export default function JatuhTempo({ contracts, selectedIdx, onSelect }) {
  const [perTanggal, setPerTanggal] = useState('2024-08-14');
  const [hasil, setHasil]           = useState(null);
  const [detailRows, setDetailRows] = useState([]);

  useEffect(() => { setHasil(null); setDetailRows([]); }, [selectedIdx]);

  const sel        = selectedIdx !== null ? contracts[selectedIdx] : null;
  const jadwal     = sel?.jadwal       || [];
  const clientName = sel?.clientName   || '-';

  const handleHitung = () => {
    if (!jadwal.length) return;
    setHasil(hitungTotalJatuhTempo(jadwal, clientName, perTanggal));
    setDetailRows(jadwal.filter(a => new Date(a.tanggal_jatuh_tempo) <= new Date(perTanggal)));
  };

  return (
    <div className="jt-page fade-in">
      {/* Header */}
      <div className="jt-page-header">
        <div>
          <h2 className="jt-page-title">📅 Total Angsuran Jatuh Tempo</h2>
          <p className="jt-page-desc">Query total angsuran yang sudah jatuh tempo per tanggal tertentu</p>
        </div>
        <span className="badge badge-amber">Soal 2</span>
      </div>

      <div className="alert alert-info">
        <span>💡</span>
        <div>
          <strong>Logika Query:</strong> JOIN <code>KONTRAK</code> + <code>JADWAL_ANGSURAN</code>{' '}
          WHERE <code>TANGGAL_JATUH_TEMPO &lt;= [tanggal]</code> GROUP BY kontrak.
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="alert alert-warning">
          ⚠️ Belum ada kontrak. Tambahkan di tab <strong>Kalkulator Angsuran</strong> terlebih dahulu.
        </div>
      ) : (
        <div className="jt-body">
          {/* LEFT */}
          <div className="jt-left">

            {/* Params */}
            <div className="card card--accent-top card--accent-amber">
              <div className="section-heading">Parameter Query</div>
              <p className="section-sub">Pilih kontrak dan tanggal batas penghitungan</p>

              <div className="jt-params">
                <div className="form-group">
                  <label className="form-label">Pilih Kontrak</label>
                  <select className="form-control"
                    value={selectedIdx ?? ''}
                    onChange={e => onSelect(Number(e.target.value))}>
                    <option value="" disabled>-- Pilih Kontrak --</option>
                    {contracts.map((c, i) => (
                      <option key={c.kontrakNo} value={i}>{c.kontrakNo} — {c.clientName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Per Tanggal</label>
                  <input className="form-control" type="date"
                    value={perTanggal} onChange={e => setPerTanggal(e.target.value)} />
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleHitung} disabled={!jadwal.length}>
                ▶ Jalankan Query
              </button>

              {sel && (
                <div className="selected-info-strip">
                  <span className="badge badge-blue">{sel.kontrakNo}</span>
                  <span>{sel.clientName} &middot; {sel.form.tenorBulan} bln &middot; {formatRupiah(sel.hasil.angsuranPerBulan)}/bln</span>
                </div>
              )}
            </div>

            {/* SQL */}
            <div className="card">
              <div className="section-heading">📝 Query SQL</div>
              <p className="section-sub">Query yang dijalankan</p>
              <pre className="sql-block">
{`SELECT 
  k.KONTRAK_NO,
  k.CLIENT_NAME,
  COUNT(ja.ID)                AS JUMLAH_ANGSURAN,
  SUM(ja.ANGSURAN_PER_BULAN)  AS TOTAL_ANGSURAN_JATUH_TEMPO
FROM KONTRAK k
JOIN JADWAL_ANGSURAN ja 
  ON k.KONTRAK_NO = ja.KONTRAK_NO
WHERE 
  k.CLIENT_NAME = '${clientName}'
  AND ja.TANGGAL_JATUH_TEMPO <= '${perTanggal}'
GROUP BY k.KONTRAK_NO, k.CLIENT_NAME;`}
              </pre>
            </div>

            {/* Hasil */}
            {hasil && (
              <div className="card fade-in">
                <div className="section-heading">📊 Hasil Query</div>
                <p className="section-sub">Output sesuai format soal</p>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>KONTRAK_NO</th>
                        <th>CLIENT_NAME</th>
                        <th>TOTAL ANGSURAN JATUH TEMPO</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="badge badge-blue">{hasil.kontrak_no}</span></td>
                        <td>{hasil.client_name}</td>
                        <td>
                          <div className="result-total-val">{formatRupiah(hasil.total_angsuran_jatuh_tempo)}</div>
                          <div className="result-total-sub">{hasil.jumlah_angsuran} angsuran</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="summary-strip">
                  <div className="strip-cell">
                    <span className="strip-cell-label">Per Tanggal</span>
                    <span className="strip-cell-val">{formatTanggal(perTanggal)}</span>
                  </div>
                  <div className="strip-cell">
                    <span className="strip-cell-label">Angsuran JT</span>
                    <span className="strip-cell-val strip-cell-val--blue">{hasil.jumlah_angsuran} bulan</span>
                  </div>
                  <div className="strip-cell">
                    <span className="strip-cell-label">Total</span>
                    <span className="strip-cell-val strip-cell-val--green">{formatRupiah(hasil.total_angsuran_jatuh_tempo)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          {detailRows.length > 0 && (
            <div className="jt-right fade-in">
              <div className="card">
                <div className="section-heading">🔍 Detail Jatuh Tempo</div>
                <p className="section-sub">Per {formatTanggal(perTanggal)} &middot; {detailRows.length} angsuran</p>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>KE</th>
                        <th>ANGSURAN</th>
                        <th>JT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRows.map(row => (
                        <tr key={row.angsuran_ke}>
                          <td><span className="angsuran-badge">{row.angsuran_ke}</span></td>
                          <td className="td-amount">{formatRupiah(row.angsuran_per_bulan)}</td>
                          <td className="td-mono">{formatTanggal(row.tanggal_jatuh_tempo)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</td>
                        <td style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
                          {formatRupiah(detailRows.reduce((s, r) => s + r.angsuran_per_bulan, 0))}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
