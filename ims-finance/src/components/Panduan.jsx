import React, { useState, useRef, useEffect } from 'react';
import './Panduan.css';

// ================================================================
// ⚙️ GEMINI API CONFIG
// Dapatkan API Key GRATIS di: https://aistudio.google.com/app/apikey
// ================================================================
const GEMINI_API_KEY = 'AIzaSyB1351oUk36q9TxT755mSi89iWZf5vWkx8';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Kamu adalah IMS Bot, asisten virtual untuk aplikasi IMS Finance — Sistem Kredit Kendaraan milik PT. Inovasi Mitra Sejati.

KONTEKS APLIKASI:
Aplikasi ini memiliki 3 fitur utama (soal):

SOAL 1 — Kalkulator Angsuran Kredit (Flat Rate):
Rumus:
- Down Payment (DP) = OTR × % DP
- Pokok Pinjaman = OTR − DP
- Total Bunga = Pokok × (Bunga/Tahun) × (Tenor ÷ 12)
- Total Bayar = Pokok + Total Bunga
- Angsuran/Bulan = Total Bayar ÷ Tenor

Contoh nyata (Pak Sugus, AGR00001):
- OTR: Rp 240.000.000, DP: 20%, Tenor: 18 bulan, Bunga: 14%/tahun
- DP = 48.000.000, Pokok = 192.000.000, Bunga = 40.320.000
- Angsuran/bulan = Rp 12.907.000

SOAL 2 — Jatuh Tempo:
Query: tampilkan cicilan dengan TANGGAL_JATUH_TEMPO ≤ tanggal input.
Contoh: per 14 Agustus 2024 → 7 angsuran (25 Jan–25 Jul) = Rp 90.349.000.
Cicilan 25 Agustus tidak masuk karena 25 > 14 (belum jatuh tempo).

SOAL 3 — Denda Keterlambatan:
- Keterlambatan = Tgl Bayar − Tgl Jatuh Tempo (dalam hari)
- Denda/Hari = Angsuran × 0.1%
- Total Denda = Keterlambatan × Denda/Hari

CARA PENGGUNAAN APP:
- Tab Kalkulator: isi form → Hitung → Simpan Kontrak
- Tab Jatuh Tempo: pilih kontrak → pilih tanggal → Jalankan Query
- Tab Denda: pilih kontrak → masukkan tgl bayar aktual → lihat denda

DATA TEKNIS: React + Vite frontend, PHP + MySQL backend, hosting DomaiNesia. Data tersimpan di database sehingga tidak hilang saat refresh.

ATURAN MENJAWAB:
- Jawab dalam Bahasa Indonesia yang ramah dan ringkas
- Jika ada pertanyaan hitungan kredit (OTR, DP, tenor, bunga), langsung HITUNG dan tampilkan hasilnya dalam format Rupiah
- Gunakan emoji secukupnya agar lebih ramah
- Jika tidak tahu, arahkan ke fitur yang relevan di aplikasi
- Maksimal 150 kata per jawaban`;

// ================================================================
// 🧮 SMART CALCULATOR — parse angka dari chat
// ================================================================
function tryCalculate(text) {
  const t = text.toLowerCase();

  // Detect OTR
  const otrMatch = t.match(/otr\s*[\s:=]?\s*([\d.,]+)\s*(juta|jt|m|rb|ribu)?/);
  const dpMatch  = t.match(/dp\s*[\s:=]?\s*([\d.,]+)\s*(%|persen)?/);
  const tenorMatch = t.match(/tenor\s*[\s:=]?\s*(\d+)\s*(bulan|bln)?/);
  const bungaMatch = t.match(/bunga\s*[\s:=]?\s*([\d.,]+)\s*(%|persen)?/);

  if (!otrMatch) return null;

  const parseNum = (match, unitGroup) => {
    let n = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    const unit = match[unitGroup] || '';
    if (unit.includes('juta') || unit.includes('jt') || unit === 'm') n *= 1_000_000;
    if (unit.includes('rb') || unit.includes('ribu')) n *= 1_000;
    return n;
  };

  const otr   = parseNum(otrMatch, 2);
  const dp    = dpMatch   ? parseNum(dpMatch, 2)   : 20;   // default 20%
  const tenor = tenorMatch ? parseInt(tenorMatch[1]) : 18;  // default 18 bulan
  const bunga = bungaMatch ? parseNum(bungaMatch, 2) : 14;  // default 14%

  const dpAmount   = otr * (dp / 100);
  const pokok      = otr - dpAmount;
  const totalBunga = pokok * (bunga / 100) * (tenor / 12);
  const totalBayar = pokok + totalBunga;
  const angsuran   = Math.ceil(totalBayar / tenor);

  const fmt = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  return `🧮 **Hasil Perhitungan Kredit**\n\n• OTR: ${fmt(otr)}\n• DP (${dp}%): ${fmt(dpAmount)}\n• Pokok Pinjaman: ${fmt(pokok)}\n• Total Bunga (${bunga}%/thn × ${tenor/12} thn): ${fmt(totalBunga)}\n• Total Bayar: ${fmt(totalBayar)}\n• **Angsuran/Bulan: ${fmt(angsuran)}** 🎯\n• Tenor: ${tenor} bulan`;
}

// ================================================================
// 📚 LOCAL KNOWLEDGE BASE (fallback)
// ================================================================
const KB = [
  { keys: ['halo','hai','hei','hello','hi','selamat','pagi','siang','malam','assalam'], reply: '👋 Halo! Saya **IMS Bot**.\n\nSaya bisa bantu:\n• 🧮 **Soal 1** — Kalkulator Angsuran\n• 📅 **Soal 2** — Jatuh Tempo\n• ⚠️ **Soal 3** — Denda Keterlambatan\n• 💬 Tanya langsung contoh: *"OTR 300jt DP 20% tenor 24 bunga 14% berapa angsurannya?"*\n\nMau tanya apa?' },
  { keys: ['soal 1','kalkulator','angsuran kredit','cicilan','hitung angsuran'], reply: '🧮 **Soal 1 — Kalkulator Angsuran**\n\n1. Isi form: OTR, DP, tenor, bunga, tgl pertama\n2. Klik **"Hitung Angsuran"**\n3. Klik **"Simpan Kontrak"**\n\n**Rumus Flat Rate:**\n`Angsuran = (Pokok + Pokok×Bunga×Tenor/12) ÷ Tenor`\n\n💡 Atau tanya langsung: *"OTR 250jt DP 20% tenor 18 bunga 14%"* — saya langsung hitung!' },
  { keys: ['rumus','formula','flat rate','perhitungan'], reply: '📐 **Rumus Flat Rate**\n\n`DP = OTR × % DP`\n`Pokok = OTR − DP`\n`Bunga = Pokok × Rate × (Tenor÷12)`\n`Angsuran = (Pokok + Bunga) ÷ Tenor`\n\n💡 Mau langsung hitung? Ketik: *"OTR 300jt DP 20% tenor 24 bunga 14%"*' },
  { keys: ['sugus','agr00001','pak sugus'], reply: '👤 **AGR00001 — Pak Sugus**\n\n• OTR: Rp 240.000.000\n• DP 20%: Rp 48.000.000\n• Pokok: Rp 192.000.000\n• Bunga 14%×1,5: Rp 40.320.000\n• **Angsuran: Rp 12.907.000/bln**\n• Tenor: 18 bln (25 Jan 2024)' },
  { keys: ['soal 2','jatuh tempo','per tanggal'], reply: '📅 **Soal 2 — Jatuh Tempo**\n\n1. Pilih kontrak → tentukan tanggal batas → **Jalankan Query**\n\nLogika: tampil cicilan `JT ≤ tanggal`\n\nPer 14 Agu 2024 → 7 cicilan (Jan–Jul) = **Rp 90.349.000**\n(Cicilan 25 Agu tidak masuk karena 25 > 14)' },
  { keys: ['kenapa 25','tanggal 25','knp 25'], reply: '💡 Karena **Tgl Angsuran Pertama = 25 Jan 2024**, semua cicilan jatuh di tanggal 25.\n\nTanggal **14** adalah *filter cutoff* (batas pengecekan), bukan tanggal cicilan.\n\nQuery: `JT ≤ 14 Agu` → cicilan Jan–Jul ✅, Agu ❌ (25 > 14)' },
  { keys: ['soal 3','denda','keterlambatan','terlambat'], reply: '⚠️ **Soal 3 — Denda**\n\n1. Pilih kontrak → masukkan tgl bayar aktual\n\n`Keterlambatan = Tgl Bayar − Tgl JT (hari)`\n`Denda/Hari = Angsuran × 0.1%`\n`Total Denda = Hari × Denda/Hari`' },
  { keys: ['simpan','save','tambah kontrak'], reply: '💾 1. Isi form → **Hitung Angsuran** → **Simpan Kontrak**\n\nData tersimpan di MySQL — tidak hilang saat refresh, bisa diakses dari HP manapun! 🗄️' },
  { keys: ['hapus','delete kontrak','hapus kontrak'], reply: '🗑️ Di panel **Daftar Kontrak** (kanan), klik ikon 🗑️ pada kontrak yang ingin dihapus. Permanen dari database.' },
  { keys: ['database','refresh','hilang','beda browser','hp lain'], reply: '🗄️ Data tersimpan di **MySQL** di DomaiNesia.\n\n✅ Tidak hilang saat refresh\n✅ Bisa diakses dari browser berbeda\n✅ Bisa diakses dari HP manapun\n\n→ Buka `alumni590.com` dari perangkat apapun!' },
  { keys: ['terima kasih','makasih','thanks','mantap','bagus','keren'], reply: '😊 Sama-sama! Senang bisa membantu. Kalau ada pertanyaan lain, tanya aja ya! 🚀' },
];

const CHIPS = ['🧮 Soal 1', '📅 Soal 2', '⚠️ Soal 3', 'Rumus angsuran', 'Data Pak Sugus', 'OTR 300jt DP 20% tenor 24 bunga 14%'];

function getTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function findLocalReply(text, contracts = []) {
  const lower = text.toLowerCase();
  // 1. Try calculator
  const calc = tryCalculate(lower);
  if (calc) return calc;

  // 2. Query about saved contracts
  if (lower.includes('daftar kontrak') || lower.includes('kontrak apa') || lower.includes('kontrak yang ada') || lower.includes('list kontrak')) {
    if (contracts.length === 0) return '📋 Belum ada kontrak tersimpan.\n\nTambahkan kontrak di tab **Kalkulator Angsuran** terlebih dahulu!';
    const list = contracts.map((c, i) =>
      `${i+1}. **${c.kontrakNo}** — ${c.clientName}\n   Angsuran: Rp ${Math.round(c.hasil?.angsuranPerBulan || 0).toLocaleString('id-ID')}/bln · Tenor: ${c.form?.tenorBulan} bln`
    ).join('\n');
    return `📋 **Daftar Kontrak (${contracts.length} data)**\n\n${list}`;
  }

  // 3. Query specific contract by name or number
  for (const c of contracts) {
    const name = c.clientName?.toLowerCase() || '';
    const no   = c.kontrakNo?.toLowerCase()  || '';
    if (lower.includes(name) || lower.includes(no)) {
      const h = c.hasil || {};
      const f = c.form  || {};
      const fmt = (n) => 'Rp ' + Math.round(n||0).toLocaleString('id-ID');
      return `📄 **Kontrak ${c.kontrakNo} — ${c.clientName}**\n\n• OTR: ${fmt(f.otr)}\n• DP (${f.dpPersen}%): ${fmt(h.dp)}\n• Pokok Pinjaman: ${fmt(h.pokok)}\n• Total Bunga (${f.bungaPerTahun}%/thn): ${fmt(h.bungaTotal)}\n• **Angsuran/Bulan: ${fmt(h.angsuranPerBulan)}** 🎯\n• Total Bayar: ${fmt(h.totalBayar)}\n• Tenor: ${f.tenorBulan} bulan\n• Mulai: ${f.tglMulai}`;
    }
  }

  // 4. Keyword match KB
  for (const item of KB) {
    if (item.keys.some(k => lower.includes(k))) return item.reply;
  }
  return null;
}

const isDemo = GEMINI_API_KEY.includes('Demo') || GEMINI_API_KEY.includes('REPLACE');

async function getReply(text, history, contracts = []) {
  // 1. Local calculator first
  const calc = tryCalculate(text.toLowerCase());
  if (calc) return calc;

  // 2. Local contract queries (faster than Gemini for these)
  const localContract = (() => {
    const lower = text.toLowerCase();
    if (lower.includes('daftar kontrak') || lower.includes('kontrak apa') || lower.includes('kontrak yang ada') || lower.includes('list kontrak')) {
      if (contracts.length === 0) return '📋 Belum ada kontrak tersimpan.\n\nTambahkan di tab **Kalkulator Angsuran** terlebih dahulu!';
      const list = contracts.map((c, i) =>
        `${i+1}. **${c.kontrakNo}** — ${c.clientName}\n   Angsuran: Rp ${Math.round(c.hasil?.angsuranPerBulan||0).toLocaleString('id-ID')}/bln · Tenor: ${c.form?.tenorBulan} bln`
      ).join('\n');
      return `📋 **Daftar Kontrak (${contracts.length} data)**\n\n${list}`;
    }
    return null;
  })();
  if (localContract) return localContract;

  // 3. Build contracts context for Gemini
  const contractsContext = contracts.length > 0
    ? '\n\nDATA KONTRAK TERSIMPAN SAAT INI:\n' + contracts.map(c => {
        const h = c.hasil || {}; const f = c.form || {};
        const fmt = (n) => 'Rp ' + Math.round(n||0).toLocaleString('id-ID');
        return `- ${c.kontrakNo} | ${c.clientName} | OTR: ${fmt(f.otr)} | DP: ${f.dpPersen}% (${fmt(h.dp)}) | Pokok: ${fmt(h.pokok)} | Bunga: ${fmt(h.bungaTotal)} | Angsuran: ${fmt(h.angsuranPerBulan)}/bln | Tenor: ${f.tenorBulan} bln | Mulai: ${f.tglMulai}`;
      }).join('\n')
    : '';

  // 4. Try Gemini AI
  if (!isDemo) {
    try {
      const contents = [
        ...history.map(m => ({ role: m.from === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text }] },
      ];
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT + contractsContext }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch { /* fall through */ }
  }

  // 5. Fallback local KB
  return findLocalReply(text, contracts)
    ?? '🤔 Maaf, saya belum paham pertanyaan itu.\n\nCoba tanya:\n• **Daftar kontrak** yang tersimpan\n• **Soal 1/2/3**\n• **Rumus** flat rate\n• Contoh: *"OTR 250jt DP 20% tenor 18 bunga 14%"*';
}


function renderText(text) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, j) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={j}>{p.slice(2,-2)}</strong>;
      if (p.startsWith('`')  && p.endsWith('`'))  return <code key={j}>{p.slice(1,-1)}</code>;
      return p;
    });
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>;
  });
}

export default function ChatBot({ contracts = [] }) {
  const [open, setOpen]     = useState(false);
  const [hasNew, setHasNew] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: `👋 Halo! Saya **IMS Bot**${!isDemo ? ' (powered by Gemini AI 🤖)' : ''}.\n\nBisa tanya apa saja seputar sistem kredit IMS Finance!\n\n💡 Coba: *"OTR 300jt DP 20% tenor 24 bunga 14% berapa angsurannya?"*`, time: getTime() },
  ]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef           = useRef(null);
  const inputRef            = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const sendMessage = async (text) => {
    const q = text.trim(); if (!q) return;
    const userMsg = { id: Date.now(), from: 'user', text: q, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setTyping(true);

    const history = messages.slice(-10);
    const reply = await getReply(q, history, contracts);

    setMessages(prev => [...prev, { id: Date.now()+1, from: 'bot', text: reply, time: getTime() }]);
    setTyping(false);
  };

  const handleOpen = () => { setOpen(true); setHasNew(false); setTimeout(() => inputRef.current?.focus(), 200); };
  const handleKey  = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };

  return (
    <>
      {/* Chat window */}
      <div className={`chat-window ${open ? '' : 'chat-window--hidden'}`}>
        <div className="chat-header">
          <div className="chat-avatar">🤖</div>
          <div className="chat-header-info">
            <div className="chat-header-name">IMS Bot {!isDemo && <span style={{fontSize:'10px',opacity:0.7}}>· Gemini AI</span>}</div>
            <div className="chat-header-status"><span className="chat-status-dot" /> Online — siap membantu</div>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-msg chat-msg--${msg.from}`}>
              {msg.from === 'bot' && <div className="chat-msg-icon">🤖</div>}
              <div>
                <div className={`chat-bubble chat-bubble--${msg.from}`}>{renderText(msg.text)}</div>
                <div className="chat-time">{msg.time}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="chat-msg chat-msg--bot">
              <div className="chat-msg-icon">🤖</div>
              <div className="chat-bubble chat-bubble--bot">
                <div className="chat-typing"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-chips">
          {CHIPS.map(chip => (
            <button key={chip} className="chat-chip" onClick={() => sendMessage(chip)}>{chip}</button>
          ))}
        </div>

        <div className="chat-input-row">
          <input ref={inputRef} className="chat-input" value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Ketik pertanyaan atau angka kredit..." disabled={typing} />
          <button className="chat-send" onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing} aria-label="Kirim">➤</button>
        </div>
      </div>

      {/* FAB */}
      <button className="chat-fab" onClick={handleOpen} aria-label="Chat Bot">
        {open ? '✕' : '🤖'}
        {hasNew && !open && <span className="chat-fab-badge">1</span>}
      </button>
    </>
  );
}
