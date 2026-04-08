import React, { useState, useRef, useEffect } from 'react';
import './Panduan.css';

// ── Knowledge base ────────────────────────────────────────────
const KB = [
  {
    keys: ['halo','hai','hei','hello','hi','selamat','pagi','siang','malam','assalamualaikum','ass'],
    reply: '👋 Halo! Saya **IMS Bot**, asisten virtual untuk sistem kredit kendaraan IMS Finance.\n\nSaya bisa membantu kamu memahami:\n• 🧮 Soal 1 — Kalkulator Angsuran\n• 📅 Soal 2 — Jatuh Tempo\n• ⚠️ Soal 3 — Denda Keterlambatan\n\nMau tanya apa?',
  },
  {
    keys: ['soal 1','kalkulator','angsuran','cicilan','kredit','hitung'],
    reply: '🧮 **Soal 1 — Kalkulator Angsuran Kredit**\n\nCara pakai:\n1. Isi data kontrak (nomor, nama, OTR, DP, tenor, bunga, tgl pertama)\n2. Klik **"Hitung Angsuran"**\n3. Klik **"Simpan Kontrak"**\n\n**Rumus Flat Rate:**\n• DP = OTR × % DP\n• Pokok = OTR − DP\n• Total Bunga = Pokok × Bunga/Thn × (Tenor ÷ 12)\n• Angsuran/Bulan = (Pokok + Total Bunga) ÷ Tenor\n\nContoh Pak Sugus: OTR Rp240jt, DP 20%, Tenor 18 bln, Bunga 14% → **Rp 12.907.000/bln**',
  },
  {
    keys: ['rumus','formula','perhitungan','hitung flat','flat rate'],
    reply: '📐 **Rumus Flat Rate:**\n\n```\nDP            = OTR × % DP\nPokok         = OTR − DP\nTotal Bunga   = Pokok × Bunga/Thn × (Tenor÷12)\nTotal Bayar   = Pokok + Total Bunga\nAngsuran/Bln  = Total Bayar ÷ Tenor\n```\n\n**Contoh angka:**\n• OTR: Rp 240.000.000\n• DP 20%: Rp 48.000.000\n• Pokok: Rp 192.000.000\n• Bunga 14% × 1.5 thn: Rp 40.320.000\n• **Angsuran: Rp 12.907.000/bln**',
  },
  {
    keys: ['sugus','agr00001','pak sugus','contoh','data'],
    reply: '👤 **Data Kontrak Pak Sugus (AGR00001)**\n\n| Field | Nilai |\n|---|---|\n| OTR | Rp 240.000.000 |\n| Down Payment 20% | Rp 48.000.000 |\n| Pokok Pinjaman | Rp 192.000.000 |\n| Total Bunga 14%/thn | Rp 40.320.000 |\n| Total Bayar | Rp 232.320.000 |\n| **Angsuran/Bulan** | **Rp 12.907.000** |\n| Tenor | 18 bulan |\n| Tgl Mulai | 25 Jan 2024 |',
  },
  {
    keys: ['soal 2','jatuh tempo','jt','keterlambatan jatuh','per tanggal','query'],
    reply: '📅 **Soal 2 — Jatuh Tempo**\n\nCara pakai:\n1. Pilih kontrak dari dropdown\n2. Tentukan **tanggal batas** pengecekan\n3. Klik **"Jalankan Query"**\n\n**Logika:** Tampilkan cicilan yang `TANGGAL_JATUH_TEMPO ≤ [tanggal input]`\n\n**Contoh:** Per 14 Agustus 2024:\n• Cicilan 1–7 (25 Jan–25 Jul) ✅ sudah lewat\n• Cicilan 8 (25 Agu) ❌ belum — tanggal 25 > 14\n\n➟ Total = 7 × Rp 12.907.000 = **Rp 90.349.000**',
  },
  {
    keys: ['kenapa 25','kenapa tanggal 25','knp 25','kok 25','tanggal 25'],
    reply: '💡 Karena tanggal **Angsuran Pertama diisi 25 Januari 2024**, maka semua cicilan jatuh tempo di tanggal **25** setiap bulan.\n\nTanggal **14 Agustus** hanya sebagai *filter cutoff* — kita tanya:\n> "Cicilan mana yang jatuh temponya ≤ 14 Agustus?"\n\nJawab: cicilan 25-Jan s/d 25-Jul (7 bulan). Cicilan 25-Agu belum jatuh tempo karena 25 > 14. ✅',
  },
  {
    keys: ['soal 3','denda','keterlambatan','terlambat','denda bayar'],
    reply: '⚠️ **Soal 3 — Denda Keterlambatan**\n\nCara pakai:\n1. Pilih kontrak dari dropdown\n2. Masukkan **tanggal pembayaran aktual** (kapan benar-benar dibayar)\n3. Sistem hitung otomatis berapa hari terlambat & total denda\n\n**Rumus:**\n```\nKeterlambatan = Tgl Bayar − Tgl Jatuh Tempo (hari)\nDenda/Hari    = Angsuran × 0.1%\nTotal Denda   = Keterlambatan × Denda/Hari\n```',
  },
  {
    keys: ['simpan','save','kontrak baru','tambah kontrak'],
    reply: '💾 **Cara Simpan Kontrak:**\n\n1. Isi semua field di form kiri\n2. Klik **"Hitung Angsuran"** — preview akan muncul\n3. Klik **"Simpan Kontrak"** (tombol hijau)\n\nKontrak otomatis tersimpan dan bisa digunakan di tab **Jatuh Tempo** & **Denda**.\n\n> Data tersimpan di database — tidak hilang meski browser ditutup! 🗄️',
  },
  {
    keys: ['edit','ubah','update kontrak'],
    reply: '✏️ **Cara Edit Kontrak:**\n\nDi panel kanan "Daftar Kontrak", klik ikon ✏️ pada kontrak yang ingin diubah.\n\nForm akan terisi otomatis dengan data lama. Edit, hitung ulang, lalu klik **"Update Kontrak"**.',
  },
  {
    keys: ['hapus','delete','buang kontrak'],
    reply: '🗑️ **Cara Hapus Kontrak:**\n\nDi panel kanan "Daftar Kontrak", klik ikon 🗑️ pada kontrak yang ingin dihapus.\n\nKontrak akan dihapus permanen dari database.',
  },
  {
    keys: ['dp','down payment','uang muka'],
    reply: '💰 **Down Payment (DP)**\n\nDP adalah uang muka yang dibayar di awal sebelum cicilan dimulai.\n\n**Rumus:** `DP = OTR × % DP`\n\nContoh: OTR Rp 240jt, DP 20%\n→ `240.000.000 × 20% = Rp 48.000.000`\n\nSemakin besar DP → pokok pinjaman makin kecil → angsuran lebih ringan.',
  },
  {
    keys: ['tenor','lama','berapa bulan'],
    reply: '📆 **Tenor** adalah jangka waktu cicilan dalam **bulan**.\n\nContoh: Tenor 18 bulan = cicilan selama 1,5 tahun.\n\nSemakin panjang tenor → cicilan per bulan lebih kecil, tapi total bunga lebih besar.',
  },
  {
    keys: ['bunga','interest','rate'],
    reply: '📊 **Bunga Flat Rate**\n\nBunga dihitung dari **pokok pinjaman awal** (bukan saldo berkurang), sehingga angsuran setiap bulan **sama besar**.\n\nRumus: `Total Bunga = Pokok × Bunga/Thn × (Tenor ÷ 12)`\n\nContoh: Pokok 192jt × 14% × 1,5 thn = **Rp 40.320.000**',
  },
  {
    keys: ['refresh','hilang','data hilang','database','server'],
    reply: '🗄️ **Data Tersimpan di Database (MySQL)**\n\nData kontrak tersimpan di server `pitiagic_ims` di DomaiNesia, sehingga:\n✅ Tidak hilang saat refresh\n✅ Bisa diakses dari browser berbeda\n✅ Bisa diakses dari HP manapun\n\nBuka `alumni590.com` dari perangkat apapun — data tetap ada!',
  },
  {
    keys: ['terima kasih','makasih','thanks','thank you','oke','siap','mantap','bagus'],
    reply: '😊 Sama-sama! Senang bisa membantu.\n\nJika ada pertanyaan lain seputar IMS Finance, jangan ragu untuk bertanya ya! 🚀',
  },
];

const CHIPS = [
  'Cara pakai Soal 1',
  'Rumus angsuran',
  'Data Pak Sugus',
  'Soal 2 jatuh tempo',
  'Kenapa tanggal 25?',
  'Cara hitung denda',
];

function getTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function findReply(text) {
  const lower = text.toLowerCase();
  for (const item of KB) {
    if (item.keys.some(k => lower.includes(k))) return item.reply;
  }
  return '🤔 Maaf, saya belum punya jawaban untuk itu.\n\nCoba tanya tentang:\n• **Soal 1** — Kalkulator Angsuran\n• **Soal 2** — Jatuh Tempo\n• **Soal 3** — Denda Keterlambatan\n• **Rumus** perhitungan\n• **Data** Pak Sugus';
}

function renderText(text) {
  // Convert **bold** and `code` and newlines
  return text.split('\n').map((line, i) => {
    const parts = line
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      .map((p, j) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={j}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={j}>{p.slice(1, -1)}</code>;
        return p;
      });
    return <span key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</span>;
  });
}

export default function Panduan() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: '👋 Halo! Saya **IMS Bot**.\n\nSaya siap membantu kamu memahami sistem kredit kendaraan IMS Finance.\n\nMau tanya apa? 😊',
      time: getTime(),
    },
  ]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const q = text.trim();
    if (!q) return;

    const userMsg = { id: Date.now(), from: 'user', text: q, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, from: 'bot', text: findReply(q), time: getTime() };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
    }, 700 + Math.random() * 400);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="chat-page fade-in">

      {/* Header */}
      <div className="chat-header">
        <div className="chat-avatar">🤖</div>
        <div className="chat-header-info">
          <div className="chat-header-name">IMS Bot</div>
          <div className="chat-header-status">
            <span className="chat-status-dot" />
            Online — siap membantu
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-msg chat-msg--${msg.from}`}>
            {msg.from === 'bot' && <div className="chat-msg-icon">🤖</div>}
            <div>
              <div className={`chat-bubble chat-bubble--${msg.from}`}>
                {renderText(msg.text)}
              </div>
              <div className="chat-time">{msg.time}</div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="chat-msg chat-msg--bot">
            <div className="chat-msg-icon">🤖</div>
            <div className="chat-bubble chat-bubble--bot">
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      <div className="chat-chips">
        {CHIPS.map(chip => (
          <button key={chip} className="chat-chip" onClick={() => sendMessage(chip)}>
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ketik pertanyaan kamu..."
          disabled={typing}
        />
        <button
          className="chat-send"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || typing}
          aria-label="Kirim"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
