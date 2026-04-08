import React, { useState, useRef, useEffect } from 'react';
import './Panduan.css';

// ── Knowledge base ────────────────────────────────────────────
const KB = [
  {
    keys: ['halo','hai','hei','hello','hi','selamat','pagi','siang','malam','assalamualaikum','ass'],
    reply: '👋 Halo! Saya **IMS Bot**.\n\nSaya bisa membantu kamu memahami:\n• 🧮 **Soal 1** — Kalkulator Angsuran\n• 📅 **Soal 2** — Jatuh Tempo\n• ⚠️ **Soal 3** — Denda Keterlambatan\n\nMau tanya apa?',
  },
  {
    keys: ['soal 1','kalkulator','angsuran','cicilan','kredit','hitung angsuran'],
    reply: '🧮 **Soal 1 — Kalkulator Angsuran**\n\nLangkah:\n1. Isi form: nomor kontrak, nama, OTR, DP, tenor, bunga, tgl pertama\n2. Klik **"Hitung Angsuran"**\n3. Klik **"Simpan Kontrak"**\n\n**Rumus Flat Rate:**\n• Pokok = OTR − DP\n• Total Bunga = Pokok × Bunga/Thn × (Tenor÷12)\n• Angsuran/Bln = (Pokok + Bunga) ÷ Tenor',
  },
  {
    keys: ['rumus','formula','perhitungan','flat rate'],
    reply: '📐 **Rumus Flat Rate:**\n\n`DP = OTR × % DP`\n`Pokok = OTR − DP`\n`Bunga = Pokok × Rate/Thn × (Tenor÷12)`\n`Angsuran = (Pokok + Bunga) ÷ Tenor`\n\n**Contoh Pak Sugus:**\n• OTR: Rp 240jt, DP 20%\n• Pokok: Rp 192jt\n• Bunga: Rp 40,32jt\n• **Angsuran: Rp 12.907.000/bln**',
  },
  {
    keys: ['sugus','agr00001','pak sugus','contoh data'],
    reply: '👤 **Data AGR00001 — Pak Sugus**\n\n• OTR: Rp 240.000.000\n• DP 20%: Rp 48.000.000\n• Pokok: Rp 192.000.000\n• Bunga 14%/thn × 1,5: Rp 40.320.000\n• **Angsuran: Rp 12.907.000/bln**\n• Tenor: 18 bulan\n• Mulai: 25 Jan 2024',
  },
  {
    keys: ['soal 2','jatuh tempo','per tanggal','query jatuh'],
    reply: '📅 **Soal 2 — Jatuh Tempo**\n\nLangkah:\n1. Pilih kontrak dari dropdown\n2. Tentukan **tanggal batas**\n3. Klik **"Jalankan Query"**\n\nLogika: tampil cicilan dengan `JatuhTempo ≤ tanggal input`\n\n**Contoh per 14 Agu 2024:**\nCicilan 25 Jan–25 Jul ✅ sudah lewat\nCicilan 25 Agu ❌ belum (25 > 14)\n→ 7 angsuran = **Rp 90.349.000**',
  },
  {
    keys: ['kenapa 25','tanggal 25','kok 25','knp 25'],
    reply: '💡 **Kenapa tanggal 25?**\n\nKarena **Angsuran Pertama** diisi 25 Jan 2024, maka semua cicilan jatuh di tanggal 25 setiap bulan.\n\nTanggal **14 Agustus** adalah *filter cutoff* — kita tanya:\n> "Cicilan mana yang jatuh temponya ≤ 14 Agu?"\n\nJawabnya: Jan–Jul (7 bulan). Cicilan 25 Agu belum jatuh tempo karena 25 > 14. ✅',
  },
  {
    keys: ['soal 3','denda','keterlambatan','terlambat'],
    reply: '⚠️ **Soal 3 — Denda Keterlambatan**\n\nLangkah:\n1. Pilih kontrak\n2. Masukkan tanggal **pembayaran aktual**\n3. Lihat hasil denda otomatis\n\n**Rumus:**\n`Telat = Tgl Bayar − Tgl JT (hari)`\n`Denda/Hari = Angsuran × 0.1%`\n`Total Denda = Telat × Denda/Hari`',
  },
  {
    keys: ['simpan','save','tambah kontrak','kontrak baru'],
    reply: '💾 **Cara Simpan Kontrak:**\n\n1. Isi form di halaman Kalkulator\n2. Klik **"Hitung Angsuran"**\n3. Klik **"Simpan Kontrak"** (tombol hijau)\n\nData tersimpan di database — tidak hilang saat refresh atau ganti browser! 🗄️',
  },
  {
    keys: ['hapus','delete kontrak'],
    reply: '🗑️ Di panel kanan "Daftar Kontrak", klik ikon **🗑️** pada kontrak yang ingin dihapus.\n\nKontrak akan dihapus permanen dari database.',
  },
  {
    keys: ['refresh','hilang','database','beda browser','hp lain'],
    reply: '🗄️ **Data tersimpan di MySQL** di server DomaiNesia.\n\n✅ Tidak hilang saat refresh\n✅ Bisa diakses dari browser berbeda\n✅ Bisa diakses dari HP manapun\n\nBuka `alumni590.com` dari perangkat apapun!',
  },
  {
    keys: ['dp','down payment','uang muka'],
    reply: '💰 **Down Payment (DP)**\n\nUang muka yang dibayar di awal.\n\n`DP = OTR × % DP`\n\nContoh: OTR 240jt, DP 20%\n→ `240.000.000 × 20% = Rp 48.000.000`\n\nSemakin besar DP → pokok lebih kecil → cicilan lebih ringan.',
  },
  {
    keys: ['bunga','interest','rate','persen'],
    reply: '📊 **Bunga Flat Rate** dihitung dari pokok pinjaman awal, sehingga angsuran setiap bulan **sama besar**.\n\n`Bunga = Pokok × Rate/Thn × (Tenor÷12)`\n\nContoh: 192jt × 14% × 1,5 = **Rp 40.320.000**',
  },
  {
    keys: ['terima kasih','makasih','thanks','mantap','bagus','oke siap'],
    reply: '😊 Sama-sama! Kalau ada pertanyaan lain, saya siap bantu ya! 🚀',
  },
];

const CHIPS = [
  '🧮 Soal 1', '📅 Soal 2', '⚠️ Soal 3',
  'Rumus angsuran', 'Data Pak Sugus', 'Kenapa tanggal 25?',
];

function getTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function findReply(text) {
  const lower = text.toLowerCase();
  for (const item of KB) {
    if (item.keys.some(k => lower.includes(k))) return item.reply;
  }
  return '🤔 Maaf, saya belum punya jawaban untuk itu.\n\nCoba tanya tentang:\n• **Soal 1/2/3**\n• **Rumus** perhitungan\n• **Data** Pak Sugus\n• **Cara** simpan/hapus kontrak';
}

function renderText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, j) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={j}>{p.slice(2,-2)}</strong>;
      if (p.startsWith('`')  && p.endsWith('`'))  return <code key={j}>{p.slice(1,-1)}</code>;
      return p;
    });
    return <span key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</span>;
  });
}

export default function ChatBot() {
  const [open, setOpen]     = useState(false);
  const [hasNew, setHasNew] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: '👋 Halo! Saya **IMS Bot**.\n\nAda yang bisa saya bantu seputar sistem kredit kendaraan IMS Finance?', time: getTime() },
  ]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef           = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const sendMessage = (text) => {
    const q = text.trim(); if (!q) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: q, time: getTime() }]);
    setInput(''); setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now()+1, from: 'bot', text: findReply(q), time: getTime() }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleOpen = () => { setOpen(true); setHasNew(false); };
  const handleKey  = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };

  return (
    <>
      {/* Chat window */}
      <div className={`chat-window ${open ? '' : 'chat-window--hidden'}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-avatar">🤖</div>
          <div className="chat-header-info">
            <div className="chat-header-name">IMS Bot</div>
            <div className="chat-header-status">
              <span className="chat-status-dot" /> Online — siap membantu
            </div>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Tutup">✕</button>
        </div>

        {/* Messages */}
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

        {/* Quick chips */}
        <div className="chat-chips">
          {CHIPS.map(chip => (
            <button key={chip} className="chat-chip" onClick={() => sendMessage(chip)}>{chip}</button>
          ))}
        </div>

        {/* Input */}
        <div className="chat-input-row">
          <input
            className="chat-input" value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Ketik pertanyaan kamu..." disabled={typing}
          />
          <button className="chat-send" onClick={() => sendMessage(input)} disabled={!input.trim() || typing} aria-label="Kirim">➤</button>
        </div>
      </div>

      {/* FAB Button */}
      <button className="chat-fab" onClick={handleOpen} aria-label="Buka Chat Bot">
        {open ? '✕' : '🤖'}
        {hasNew && !open && <span className="chat-fab-badge">1</span>}
      </button>
    </>
  );
}
