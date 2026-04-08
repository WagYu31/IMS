import React, { useState, useEffect } from 'react';
import { formatRupiah, formatTanggal, hitungDenda } from '../utils/kalkulasi';
import './DendaKeterlambatan.css';

export default function DendaKeterlambatan({ contracts, selectedIdx, onSelect }) {
  const [perTanggal, setPerTanggal]     = useState('2024-08-14');
  const [sudahBayarKe, setSudahBayarKe] = useState(5);
  const [dendaPersen, setDendaPersen]   = useState(0.1);
  const [hasil, setHasil]               = useState([]);
  const [hasRun, setHasRun]             = useState(false);

  useEffect(() => { setHasil([]); setHasRun(false); }, [selectedIdx]);

  const sel        = selectedIdx !== null ? contracts[selectedIdx] : null;
  const jadwal     = sel?.jadwal     || [];
  const clientName = sel?.clientName || '-';

  const handleHitung = () => {
    if (!jadwal.length) return;
    setHasil(hitungDenda(jadwal, clientName, sudahBayarKe, perTanggal, dendaPersen));
    setHasRun(true);
  };

  const totalDenda     = hasil.reduce((s, r) => s + r.total_denda, 0);
  const totalHariTelat = hasil.reduce((s, r) => s + r.hari_keterlambatan, 0);

  return (
    <div className="denda-page fade-in">
      {/* Header */}
      <div className="denda-page-header">
        <div>
          <h2 className="denda-page-title">⚠️ Denda Keterlambatan</h2>
          <p className="denda-page-desc">Hitung denda keterlambatan pembayaran angsuran per tanggal tertentu</p>
        </div>
        <span className="badge badge-red">Soal 3</span>
      </div>

      <div className="alert alert-warning">
        <span>📋</span>
        <div>
          <strong>Formula:</strong> Denda = <strong>Angsuran × denda%/hari × hari keterlambatan</strong>.
          Berlaku per angsuran yang belum dibayar dan sudah melewati jatuh tempo.
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="alert alert-warning">
          ⚠️ Belum ada kontrak. Tambahkan di tab <strong>Kalkulator Angsuran</strong> terlebih dahulu.
        </div>
      ) : (
        <div className="denda-body">
          {/* LEFT */}
          <div className="denda-left">

            {/* Params */}
            <div className="card card--accent-top card--accent-red">
              <div className="section-heading">Parameter Query</div>
              <p className="section-sub">Masukkan kondisi pembayaran untuk menghitung denda</p>

              <div className="denda-params">
                <div className="form-group col-full">
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
                  <label className="form-label">Sudah Bayar s/d Ke-</label>
                  <input className="form-control" type="number" min={0}
                    value={sudahBayarKe} onChange={e => setSudahBayarKe(parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Denda per Hari (%)</label>
                  <input className="form-control" type="number" step="0.01"
                    value={dendaPersen} onChange={e => setDendaPersen(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group col-full">
                  <label className="form-label">Per Tanggal Hitung</label>
                  <input className="form-control" type="date"
                    value={perTanggal} onChange={e => setPerTanggal(e.target.value)} />
                </div>
              </div>

              {sel && (
                <div className="selected-info-strip">
                  <span className="badge badge-blue">{sel.kontrakNo}</span>
                  <span>{sel.clientName} &middot; {sel.form.tenorBulan} bln &middot; {formatRupiah(sel.hasil.angsuranPerBulan)}/bln</span>
                </div>
              )}

              <button className="btn btn-danger" onClick={handleHitung} disabled={!jadwal.length}>
                ⚠️ Hitung Denda
              </button>
            </div>

            {/* SQL */}
            <div className="card">
              <div className="section-heading">📝 Query SQL</div>
              <p className="section-sub">Query denda keterlambatan</p>
              <pre className="sql-block">
{`SELECT
  k.KONTRAK_NO,
  k.CLIENT_NAME,
  ja.ANGSURAN_KE,
  DATEDIFF('${perTanggal}',
    ja.TANGGAL_JATUH_TEMPO)     AS HARI_KETERLAMBATAN,
  ROUND(
    ja.ANGSURAN_PER_BULAN
    * (${dendaPersen} / 100)
    * DATEDIFF('${perTanggal}',
        ja.TANGGAL_JATUH_TEMPO)
  )                             AS TOTAL_DENDA
FROM KONTRAK k
JOIN JADWAL_ANGSURAN ja
  ON k.KONTRAK_NO = ja.KONTRAK_NO
LEFT JOIN PEMBAYARAN p
  ON ja.KONTRAK_NO = p.KONTRAK_NO
  AND ja.ANGSURAN_KE = p.ANGSURAN_KE
WHERE
  k.CLIENT_NAME = '${clientName}'
  AND ja.TANGGAL_JATUH_TEMPO < '${perTanggal}'
  AND ja.ANGSURAN_KE > ${sudahBayarKe}
  AND p.ID IS NULL
ORDER BY ja.ANGSURAN_KE;`}
              </pre>
            </div>

            {/* Tabel hasil */}
            {hasRun && (
              <div className="card fade-in">
                <div className="section-heading">📊 Hasil Query — Detail Denda</div>
                <p className="section-sub">Output sesuai format soal</p>

                {hasil.length === 0 ? (
                  <div className="alert alert-success">
                    ✅ Tidak ada keterlambatan. Semua angsuran yang jatuh tempo sudah dibayar.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>KONTRAK</th>
                          <th>CLIENT</th>
                          <th>KE</th>
                          <th>ANGSURAN</th>
                          <th>JT</th>
                          <th>HARI</th>
                          <th>DENDA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hasil.map((row, i) => (
                          <tr key={i}>
                            <td><span className="badge badge-blue">{row.kontrak_no}</span></td>
                            <td>{row.client_name}</td>
                            <td><span className="ke-chip-red">{row.installment_no}</span></td>
                            <td style={{ color: 'var(--text-secondary)' }}>{formatRupiah(row.angsuran_per_bulan)}</td>
                            <td className="td-mono">{formatTanggal(row.tanggal_jatuh_tempo)}</td>
                            <td>
                              <div className="hari-cell">
                                <span className="hari-num">{row.hari_keterlambatan}</span>
                                <span className="hari-txt">hr</span>
                              </div>
                            </td>
                            <td><span className="td-denda">{formatRupiah(row.total_denda)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="denda-total-row">
                          <td colSpan={5} style={{ color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</td>
                          <td><strong style={{ color: 'var(--color-amber-300)' }}>{totalHariTelat} hr</strong></td>
                          <td><span className="td-denda-total">{formatRupiah(totalDenda)}</span></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="denda-right">
            {hasRun && hasil.length > 0 ? (
              <>
                <div className="denda-stat-box denda-stat-box--red">
                  <div className="dsb-icon">🔴</div>
                  <div className="dsb-label">Angsuran Terlambat</div>
                  <div className="dsb-value">{hasil.length} Angsuran</div>
                  {hasil.map(r => (
                    <div key={r.installment_no} className="dsb-sub">Angsuran ke-{r.installment_no}</div>
                  ))}
                </div>

                <div className="denda-stat-box denda-stat-box--amber">
                  <div className="dsb-icon">⏱️</div>
                  <div className="dsb-label">Total Hari Terlambat</div>
                  <div className="dsb-value">{totalHariTelat} Hari</div>
                  {hasil.map(r => (
                    <div key={r.installment_no} className="dsb-sub">Ke-{r.installment_no}: {r.hari_keterlambatan} hari</div>
                  ))}
                </div>

                <div className="denda-stat-box denda-stat-box--danger">
                  <div className="dsb-icon">💸</div>
                  <div className="dsb-label">Total Denda</div>
                  <div className="dsb-value--big">{formatRupiah(totalDenda)}</div>
                  {hasil.map(r => (
                    <div key={r.installment_no} className="dsb-sub">Ke-{r.installment_no}: {formatRupiah(r.total_denda)}</div>
                  ))}
                </div>

                {/* Kalkulasi detail */}
                <div className="card">
                  <div className="section-heading">🧮 Perhitungan</div>
                  <p className="section-sub" style={{ marginBottom: 'var(--space-3)' }}>Verifikasi manual per angsuran</p>
                  <div className="kalkulasi-list">
                    {hasil.map(row => (
                      <div key={row.installment_no} className="kalkulasi-card">
                        <div className="kalkulasi-title">
                          Ke-{row.installment_no} · {formatTanggal(row.tanggal_jatuh_tempo)}
                        </div>
                        <div className="kalkulasi-formula">
                          <span className="f-operand">{formatRupiah(row.angsuran_per_bulan)}</span>
                          <span className="f-operator">×</span>
                          <span className="f-operand">{dendaPersen}%</span>
                          <span className="f-operator">×</span>
                          <span className="f-operand">{row.hari_keterlambatan}h</span>
                          <span className="f-operator">=</span>
                          <span className="f-result">{formatRupiah(row.total_denda)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="card hint-card">
                <div className="hint-icon">⚠️</div>
                <div className="section-heading" style={{ marginBottom: 'var(--space-3)' }}>Cara Pakai</div>
                <ol className="hint-list">
                  <li>Pilih kontrak dari dropdown</li>
                  <li>Set angsuran terakhir yang sudah dibayar</li>
                  <li>Set persentase denda per hari</li>
                  <li>Pilih tanggal perhitungan</li>
                  <li>Klik <strong>Hitung Denda</strong></li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
