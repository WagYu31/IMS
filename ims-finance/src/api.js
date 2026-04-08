// ============================================================
// IMS Finance — API Service
// Produksi: /api/contracts.php (PHP + MySQL di shared hosting)
// Dev lokal: localStorage fallback
// ============================================================

const API_URL = '/api/contracts.php';

// Cek apakah kita di production (ada file PHP di server)
// Di local dev (localhost) PHP tidak tersedia, pakai localStorage
const isLocalDev = window.location.hostname === 'localhost'
  || window.location.hostname === '127.0.0.1';

// ── localStorage helpers ──────────────────────────────────────
const LS_KEY = 'ims-contracts';

function lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? []; }
  catch { return []; }
}
function lsSave(contracts) {
  localStorage.setItem(LS_KEY, JSON.stringify(contracts));
}

// ── API Service ───────────────────────────────────────────────
export const api = {

  /** GET semua kontrak */
  async getAll() {
    if (isLocalDev) return lsLoad();
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Gagal memuat data');
    return res.json();
  },

  /** POST / upsert kontrak */
  async save(contract) {
    if (isLocalDev) {
      const all = lsLoad();
      const idx = all.findIndex(c => c.kontrakNo === contract.kontrakNo);
      if (idx >= 0) all[idx] = contract; else all.push(contract);
      lsSave(all);
      return { success: true };
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contract),
    });
    if (!res.ok) throw new Error('Gagal menyimpan kontrak');
    return res.json();
  },

  /** DELETE kontrak berdasarkan kontrakNo */
  async delete(kontrakNo) {
    if (isLocalDev) {
      const all = lsLoad().filter(c => c.kontrakNo !== kontrakNo);
      lsSave(all);
      return { success: true };
    }
    const res = await fetch(`${API_URL}?id=${encodeURIComponent(kontrakNo)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Gagal menghapus kontrak');
    return res.json();
  },
};
