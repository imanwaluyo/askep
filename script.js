/* =============================================
   NursAssess Pro — Full Logic
   Developed by Iman Waluyo
   ============================================= */

// === PARTIKEL LATAR ===
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 1 + Math.random() * 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '-10px';
    p.style.background = Math.random() > 0.5 ? 'var(--cyan)' : 'var(--purple)';
    p.style.animationDuration = (18 + Math.random() * 30) + 's';
    p.style.animationDelay = Math.random() * 25 + 's';
    container.appendChild(p);
  }
})();

// === STEP DEFINITIONS ===
const STEPS = [
  { icon: 'fa-user',              title: 'Identitas Pasien' },
  { icon: 'fa-comment-medical',   title: 'Keluhan Utama' },
  { icon: 'fa-file-medical',      title: 'Riwayat Penyakit' },
  { icon: 'fa-people-group',      title: 'Riwayat Keluarga' },
  { icon: 'fa-utensils',          title: 'Pola Aktivitas' },
  { icon: 'fa-stethoscope',       title: 'Pemeriksaan Fisik' },
  { icon: 'fa-flask',             title: 'Penunjang Lab / Ro' },
  { icon: 'fa-robot',             title: 'AI Detector' },
  { icon: 'fa-chart-bar',         title: 'Analisa Data' },
  { icon: 'fa-hospital',          title: 'SDKI / SLKI / SIKI' },
  { icon: 'fa-bolt',              title: 'Prioritas Masalah' }
];

let curStep = 0;
let painVal = -1;
let labCount = 0;
let roxCount = 0;
let _diagResults = [];

// === BUILD SIDEBAR NAV ===
(function buildNav() {
  const navl = document.getElementById('navl');
  STEPS.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'nav-item' + (i === 0 ? ' active' : '');
    d.dataset.idx = i;
    d.innerHTML = `<i class="fas ${s.icon}"></i><span>${s.title}</span><span class="sn">${i + 1}</span>`;
    d.onclick = () => goStep(i);
    navl.appendChild(d);
  });
})();

// === NAVIGASI STEP ===
function goStep(n) {
  if (n < 0 || n >= STEPS.length) return;
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  curStep = n;
  const el = document.querySelector(`.step[data-s="${n}"]`);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach((ni, i) => {
    ni.classList.toggle('active', i === n);
    if (i < n) ni.classList.add('done'); else ni.classList.remove('done');
  });
  document.getElementById('stitle').textContent = `${n + 1}. ${STEPS[n].title}`;
  const pct = Math.round((n / (STEPS.length - 1)) * 100);
  document.getElementById('pfill').style.width = pct + '%';
  document.getElementById('ptext').textContent = pct + '%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('ovl').classList.remove('show');

  // Lazy init per step
  if (n === 1 && document.getElementById('pain-scale') && !document.getElementById('pain-scale').children.length) buildPain();
  if (n === 5) { calcGCS(); calcIMT(); }
  if (n === 9) renderDiagnosis();
  if (n === 10) renderPriority();
}

function toggleSB() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('ovl').classList.toggle('show');
}

// === TOAST ===
function toast(msg, type) {
  type = type || 's';
  const icons = { s: 'fa-check-circle', e: 'fa-times-circle', i: 'fa-info-circle' };
  const t = document.createElement('div');
  t.className = 'toast t-' + type;
  t.innerHTML = `<i class="fas ${icons[type]}"></i>${msg}`;
  document.getElementById('toast-box').appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// === HELPER ===
function getVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function getChkVals(id) { return [...document.querySelectorAll('#' + id + ' .ci.ck')].map(el => el.dataset.val); }
function chkClick(e) { const ci = e.target.closest('.ci'); if (!ci) return; ci.classList.toggle('ck'); ci.querySelector('input').checked = ci.classList.contains('ck'); }

// === SKALA NYERI ===
function buildPain() {
  const c = document.getElementById('pain-scale');
  if (!c) return;
  const colors = ['#10b981','#34d399','#6ee7b7','#a3e635','#facc15','#f59e0b','#f97316','#ef4444','#dc2626','#b91c1c','#7f1d1d'];
  for (let i = 0; i <= 10; i++) {
    const b = document.createElement('button');
    b.className = 'pb'; b.textContent = i;
    b.onclick = () => {
      painVal = i;
      document.querySelectorAll('.pb').forEach(x => { x.classList.remove('sel'); x.style.background = ''; x.style.borderColor = ''; x.style.color = ''; });
      b.classList.add('sel'); b.style.background = colors[i]; b.style.borderColor = colors[i]; b.style.color = '#fff';
    };
    c.appendChild(b);
  }
}

// === GCS ===
function calcGCS() {
  const e = +getVal('f-gcs-e'), v = +getVal('f-gcs-v'), m = +getVal('f-gcs-m');
  const t = e + v + m;
  document.getElementById('f-gcs-total').value = t;
  const el = document.getElementById('f-gcs-total');
  el.style.color = t <= 8 ? 'var(--danger)' : t <= 12 ? 'var(--warn)' : 'var(--cyan)';
}

// === IMT ===
function calcIMT() {
  const bb = +getVal('f-bb'), tb = +getVal('f-tb') / 100;
  if (bb > 0 && tb > 0) {
    const imt = (bb / (tb * tb)).toFixed(1);
    document.getElementById('f-imt').value = imt;
    let kat = imt < 18.5 ? 'Kurus' : imt < 25 ? 'Normal' : imt < 30 ? 'Gemuk (Overweight)' : 'Obesitas';
    document.getElementById('f-imtkat').value = kat;
  } else {
    document.getElementById('f-imt').value = '';
    document.getElementById('f-imtkat').value = '';
  }
}

// === LAB / RO DYNAMIC ===
function addLabRow() {
  labCount++;
  const d = document.createElement('div');
  d.className = 'g3 lab-row';
  d.innerHTML = `<div class="fg"><input class="fi lab-p" placeholder="Parameter"></div><div class="fg"><input class="fi lab-v" placeholder="Nilai"></div><div class="fg"><input class="fi lab-n" placeholder="Normal (opsional)"></div>`;
  document.getElementById('lab-rows').appendChild(d);
}
function addRoxRow() {
  roxCount++;
  const d = document.createElement('div');
  d.className = 'g2 rox-row';
  d.innerHTML = `<div class="fg"><input class="fi rox-t" placeholder="Jenis pemeriksaan"></div><div class="fg"><input class="fi rox-r" placeholder="Hasil"></div>`;
  document.getElementById('rox-rows').appendChild(d);
}
function getLabData() {
  const rows = [];
  document.querySelectorAll('#lab-rows .lab-row').forEach(r => {
    const p = r.querySelector('.lab-p').value.trim();
    const v = r.querySelector('.lab-v').value.trim();
    const n = r.querySelector('.lab-n').value.trim();
    if (p || v) rows.push({ p, v, n });
  });
  return rows;
}
function getRoxData() {
  const rows = [];
  document.querySelectorAll('#rox-rows .rox-row').forEach(r => {
    const t = r.querySelector('.rox-t').value.trim();
    const res = r.querySelector('.rox-r').value.trim();
    if (t || res) rows.push({ t, res });
  });
  return rows;
}

// ============================================================
// DATABASE SDKI / SLKI / SIKI
// ============================================================
const DB = [
  {
    id: '00199', lb: 'Nyeri', dom: 'Perdamaian',
    def: 'Pengalaman sensorik dan emosional tidak menyenangkan dari kerusakan jaringan aktual atau potensial yang dideskripsikan dalam bentuk verbal dan nonverbal.',
    kw: ['nyeri','sakit','pedih','perih','ngilu','nrs','skala nyeri','antalgi','meringis','berdenyut','tajam','tumpul','menyebar','radiasi','linu','nyut','vas','ndiri'],
    bp: 3,
    slki: [
      { lb: 'Tingkat Nyeri', ind: ['Melaporkan intensitas nyeri','Ekspresi wajah saat nyeri','Respons fisiologis terhadap nyeri','Durasi episode nyeri'] },
      { lb: 'Kontrol Nyeri', ind: ['Mengenali onset nyeri','Menggunakan teknik non-farmakologis','Melaporkan nyeri terkendali'] }
    ],
    siki: [
      { lb: 'Manajemen Nyeri', act: ['Lakukan penilaian nyeri komprehensif (lokasi, kualitas, intensitas, durasi, onset)','Gunakan skala nyeri yang sesuai (NRS, VAS, FLACC, Wong-Baker)','Berikan analgesik sesuai order dokter','Evaluasi efektivitas terapi analgesik 30-60 menit setelah pemberian','Intervensi non-farmakologis: relaksasi progresif, distraksi, kompres hangat/dingin, massage','Dokumentasikan respons pasien terhadap intervensi nyeri','Ajarkan teknik coping untuk mengatasi nyeri','Monitor tanda vital sebelum dan sesudah pemberian analgesik','Kolaborasi dengan tim medis jika nyeri tidak terkendali'] },
      { lb: 'Manajemen Nyeri: Farmakologis', act: ['Berikan analgesik tepat waktu sebelum aktivitas penyebab nyeri','Monitor efek samping analgesik (mual, muntah, sedasi, hipotensi)','Edukasi pasien tentang nama, dosis, frekuensi, dan efek samping obat','Catat waktu pemberian dan respons pasien'] }
    ]
  },
  {
    id: '00090', lb: 'Risiko Infeksi', dom: 'Keamanan', isRisiko: true,
    def: 'Peningkatan kerentanan terhadap invasi organisme patogen.',
    kw: ['kateter','ngt','drain','operasi','bedah','invasif','ivfd','cvc','intubasi','ventilator','lekosit','leukosit','wound','luka operasi','insisi','dehisensi'],
    bp: 2,
    slki: [
      { lb: 'Status Imunisasi', ind: ['Derajat pertahanan sekunder','Derajat pertahanan primer'] }
    ],
    siki: [
      { lb: 'Perlindungan terhadap Infeksi', act: ['Teknik aseptik dan antiseptik pada setiap tindakan invasif','Perawatan luka dengan teknik steril','Ganti dressing luka sesuai jadwal atau jika kotor/lembab','Monitor tanda infeksi: suhu, leukosit, kemerahan, pembengkakan, eksudat','Ganti set infus dan jalur infus sesuai protokol','Perawatan kateter sesuai standar','Kolaborasi pemberian antibiotik sesuai order','Ajarkan pasien dan keluarga tentang tanda infeksi','Pertahankan kebersihan lingkungan perawatan','Hand hygiene sebelum dan sesudah tindakan'] },
      { lb: 'Surveilans', act: ['Monitor tanda vital secara berkala','Pantau hasil lab (leukosit, CRP, prokalsitonin)','Dokumentasikan temuan infeksi','Laporkan temuan abnormal kepada dokter'] }
    ]
  },
  {
    id: '00198', lb: 'Gangguan Pola Tidur', dom: 'Perdamaian',
    def: 'Gangguan kuantitas dan kualitas tidur (berkurang, bertambah, atau tidak merasa segar).',
    kw: ['insomnia','sulit tidur','terbangun','tidak bisa tidur','ganggu tidur','tidak lelap','mimpi buruk','mengigau','kurang tidur','tidur kurang','gelisah malam','bangun berkali'],
    bp: 3,
    slki: [{ lb: 'Kualitas Tidur', ind: ['Mudah memulai tidur','Durasi tidur adekuat','Bangun merasa segar','Tidak terbangun di malam hari'] }],
    siki: [{ lb: 'Terapi Tidur', act: ['Tentukan pola tidur saat ini dan kebutuhan tidur pasien','Ciptakan lingkungan tidur nyaman: suhu, pencahayaan, kebisingan minimal','Kurangi stimulasi sebelum tidur','Teknik relaksasi: deep breathing, progressive muscle relaxation','Anjurkan menghindari kafein dan makan berat sebelum tidur','Atur jadwal tidur yang konsisten','Kolaborasi pemberian hipnotik/sedatif sesuai order','Monitor dan evaluasi kualitas tidur setiap shift'] }]
  },
  {
    id: '00002', lb: 'Gangguan Nutrisi: Kurang dari Kebutuhan', dom: 'Nutrisi',
    def: 'Intake nutrisi tidak cukup untuk kebutuhan metabolisme tubuh.',
    kw: ['nafsu makan','berkurang','menurun','kurang','anoreksia','bb turun','berat badan turun','imt','lemah','kurus','malnutrisi','mual','muntah','ngt','nasogastric','diet','sulit makan','tidak mau makan','kakektik'],
    bp: 2,
    slki: [
      { lb: 'Status Nutrisi: Intake', ind: ['Jumlah makanan yang dimakan','Jumlah cairan yang diminum','Berat badan stabil'] },
      { lb: 'Status Nutrisi: Energi', ind: ['Berat badan ideal','Massa tubuh proporsional','Kadar albumin normal'] }
    ],
    siki: [
      { lb: 'Manajemen Nutrisi', act: ['Tentukan kebutuhan kalori dan nutrisi pasien','Berikan makanan tinggi kalori tinggi protein','Anjurkan makan porsi kecil sering (5-6x/hari)','Berikan suplemen nutrisi sesuai order','Perawatan mulut sebelum makan','Ciptakan lingkungan makan menyenangkan','Monitor berat badan secara berkala','Kolaborasi ahli gizi untuk menu pasien','Dokumentasikan intake makanan setiap kali makan','Monitor tanda malnutrisi: albumin, prealbumin, LILA'] },
      { lb: 'Terapi Nutrisi Enteral', act: ['Pasang/rawat NGT sesuai prosedur','Berikan makanan melalui NGT sesuai order','Monitor residu sebelum pemberian makanan','Evaluasi toleransi pasien terhadap makanan enteral','Kolaborasi jika terjadi komplikasi'] }
    ]
  },
  {
    id: '00027', lb: 'Kekurangan Volume Cairan', dom: 'Nutrisi',
    def: 'Penurunan cairan intravaskular, interstisial, dan/atau intraselular.',
    kw: ['dehidrasi','muntah','diare','mencret','kering','turgor','membran mukosa','sunken','cairan kurang','intake kurang','output meningkat','drain','ngt suction','sweating','demam tinggi','polyuria','hematokrit naik'],
    bp: 1,
    slki: [{ lb: 'Keseimbangan Cairan', ind: ['Tekanan darah stabil','Nadi dalam rentang normal','Turgor kulit baik','Output urine adekuat (>0.5 ml/kg/jam)','Membran mukosa lembab'] }],
    siki: [{ lb: 'Manajemen Hipovolemia', act: ['Monitor tanda vital setiap 1-2 jam','Catat intake dan output cairan secara ketat','Monitor tanda dehidrasi: turgor, mukosa, sunken eyes','Berikan cairan IV sesuai order (kristaloid/koloid)','Monitor lab: hematokrit, BUN, kreatinin, elektrolit','Kolaborasi pemberian elektrolit sesuai hasil lab','Evaluasi respons pasien terhadap pemberian cairan','Timbang berat badan harian','Monitor edema sebagai tanda overload cairan'] }]
  },
  {
    id: '00026', lb: 'Kelebihan Volume Cairan', dom: 'Nutrisi',
    def: 'Peningkatan retensi cairan isotonic.',
    kw: ['edema','kelebihan cairan','overload','retensi cairan','gagal jantung','gagal ginjal','crackle','ascites','effusi','jvp','distensi','bb naik'],
    bp: 1,
    slki: [{ lb: 'Keseimbangan Cairan', ind: ['Berat badan stabil','Tidak ada edema','Pernapasan dalam rentang normal','TD dalam rentang normal'] }],
    siki: [{ lb: 'Manajemen Hipervolemia', act: ['Monitor tanda vital dan GCS','Catat intake dan output cairan secara ketat','Batasi intake cairan sesuai order','Timbang berat badan harian','Monitor edema: lokasi, derajat, perubahan','Berikan diuretik sesuai order dan monitor respons','Posisikan pasien semifowler atau high fowler','Monitor lab: elektrolit, BUN, kreatinin','Kolaborasi penyesuaian cairan','Monitor tanda overload paru: crackle, sesak'] }]
  },
  {
    id: '00030', lb: 'Gangguan Pertukaran Gas', dom: 'Kardiovaskular/Pernapasan',
    def: 'Kelebihan/kekurangan oksigenasi dan/atau eliminasi CO2 pada membran alveolokapilaris.',
    kw: ['sesak','dispnea','sianosis','spo2','hipoksemia','hiperkapnia','retaksi','cuping hidung','rhonki','wheezing','crackle','takipnea','napas cepat','edema paru','penumonia','copd','asma','ards','gagal napas','oksigen','ventilator','intubasi'],
    bp: 1,
    slki: [
      { lb: 'Status Pertukaran Gas', ind: ['SpO2 dalam rentang normal (>95%)','PaO2 dalam rentang normal (>80 mmHg)','PaCO2 dalam rentang normal (35-45 mmHg)','Tidak ada sianosis'] },
      { lb: 'Status Pernapasan: Pertukaran Gas', ind: ['Frekuensi napas normal','Kedalaman napas adequat','Tidak ada dispnea'] }
    ],
    siki: [
      { lb: 'Pemantauan Pernapasan', act: ['Monitor frekuensi, kedalaman, ritme pernapasan setiap 1-2 jam','Monitor SpO2 secara kontinu','Auskultasi bunyi napas setiap shift','Monitor warna kulit dan membran mukosa','Catat karakteristik sputum: warna, konsistensi, jumlah','Monitor gas darah sesuai indikasi','Laporkan perubahan status pernapasan segera'] },
      { lb: 'Manajemen Jalan Napas', act: ['Pastikan jalan napas paten','Posisikan pasien fowler/semi-fowler','Berikan oksigen sesuai order','Suction sekret jika diperlukan','Terapi nebulizer sesuai order','Ajarkan teknik pernapasan dada dan perut','Ajarkan teknik batuk efektif','Kolaborasi bronkodilator dan mukolitik'] }
    ]
  },
  {
    id: '00155', lb: 'Risiko Perdarahan', dom: 'Keamanan', isRisiko: true,
    def: 'Peningkatan risiko kehilangan darah secara bermakna.',
    kw: ['trombosit rendah','trombositopeni','pt memanjang','aptt memanjang','inr','antikoagulan','warfarin','heparin','pasca operasi','post op','perdarahan','hematoma','melena','hematemesis','ekimosis','petekie','gagal hati','sirosis'],
    bp: 1,
    slki: [{ lb: 'Koagulasi', ind: ['Waktu pembekuan darah dalam batas normal','Trombosit dalam batas normal','Tidak ada tanda perdarahan spontan'] }],
    siki: [{ lb: 'Manajemen Perdarahan', act: ['Monitor tanda perdarahan: hematemesis, melena, hematuria','Monitor koagulasi: trombosit, PT, APTT, INR','Monitor tanda vital secara berkala','Perhatikan tanda hipovolemia: takikardia, hipotensi, pucat','Siapkan transfusi darah jika diperlukan','Tekanan langsung pada area perdarahan','Kolaborasi faktor koagulasi/trombosit sesuai order','Batasi tindakan invasif yang tidak perlu','Ajarkan pasien menghindari trauma','Monitor produksi drainase dari luka/drain'] }]
  },
  {
    id: 'RJ', lb: 'Risiko Jatuh', dom: 'Keamanan', isRisiko: true,
    def: 'Peningkatan kerentanan terhadap jatuh yang dapat menyebabkan kerusakan fisik.',
    kw: ['jatuh','pusing','vertigo','lemah','seimbang','hipotensi ortostatik','lansia','sedatif','hipnotik','bedrest','imobilisasi','mobilisasi terbatas','riwayat jatuh','penglihatan','gelap','licin'],
    bp: 2,
    slki: [{ lb: 'Status Risiko Jatuh', ind: ['Mampu mempertahankan keseimbangan','Mampu berjalan tanpa bantuan','Lingkungan bebas bahaya jatuh'] }],
    siki: [{ lb: 'Pencegahan Jatuh', act: ['Skrining risiko jatuh saat masuk dan berkala','Pasang penanda risiko jatuh di tempat tidur','Posisikan tempat tidur rendah, rem terkunci','Pastikan bel panggilan dalam jangkauan','Letakkan barang yang sering digunakan dalam jangkauan','Pencahayaan cukut terutama malam hari','Pasang side rail jika perlu','Bantu pasien saat mobilisasi pertama kali','Ajarkan teknik bangun bertahap: duduk dulu sebelum berdiri','Kolaborasi alat bantu: tongkat, walker, kursi roda','Monitor efek obat yang meningkatkan risiko jatuh','Evaluasi lingkungan: lantai licin, kabel, rambat'] }]
  },
  {
    id: '00093', lb: 'Kelelahan', dom: 'Aktivitas',
    def: 'Ketidakmampuan untuk mempertahankan tingkat aktivitas yang diperlukan.',
    kw: ['lelah','lemas','letih','lesu','tidak bertenaga','mengantuk','capai','penat','sulit konsentrasi','otot lemah','aktivitas terbatas','tidak kuat','payah'],
    bp: 3,
    slki: [{ lb: 'Tingkat Energi', ind: ['Mampu melakukan aktivitas sehari-hari','Melaporkan tingkat energi adequat','Mampu berpartisipasi dalam aktivitas yang diinginkan'] }],
    siki: [{ lb: 'Manajemen Energi', act: ['Tentukan penyebab kelelahan','Prioritaskan aktivitas: fokus yang penting','Anjurkan periode istirahat di antara aktivitas','Bantu pasien dalam aktivitas sehari-hari sesuai kebutuhan','Anjurkan teknik konservasi energi','Monitor respons terhadap aktivitas: TD, N, RR, SpO2','Tingkatkan aktivitas secara bertahap','Pastikan nutrisi dan cairan adekuat','Kolaborasi terapis okupasi jika diperlukan'] }]
  },
  {
    id: '00141', lb: 'Cemas', dom: 'Koping/Stres',
    def: 'Perasaan tidak menyenangkan yang timbul dari persepsi ancaman yang tidak spesifik.',
    kw: ['cemas','takut','kuatir','gelisah','takut mati','takut operasi','ansietas','worry','panik','tidak tenang','khawatir','jantung berdebar','tegang'],
    bp: 4,
    slki: [{ lb: 'Tingkat Kecemasan', ind: ['Melaporkan kecemasan berkurang','Tampak rileks','Mampu menggunakan teknik coping','Tanda vital dalam rentang normal'] }],
    siki: [
      { lb: 'Penurunan Kecemasan', act: ['Penilaian tingkat kecemasan pasien','Dukungan emosional dan therapeutic communication','Ciptakan lingkungan tenang dan nyaman','Dengarkan keluhan tanpa menghakimi','Berikan informasi jelas tentang prosedur dan perawatan','Ajarkan relaksasi: deep breathing, progressive muscle relaxation','Libatkan keluarga sebagai sumber dukungan','Kolaborasi ansiolitik sesuai order','Evaluasi tingkat kecemasan secara berkala','Bantu identifikasi sumber kecemasan dan coping mechanism'] },
      { lb: 'Terapi Aktivitas', act: ['Identifikasi aktivitas pengalihan kecemasan','Ajarkan teknik distraksi: musik, bacaan, hobi','Ajarkan teknik grounding 5-4-3-2-1','Libatkan pasien dalam aktivitas menyenangkan'] }
    ]
  },
  {
    id: '00032', lb: 'Pola Napas Tidak Efektif', dom: 'Kardiovaskular/Pernapasan',
    def: 'Inspirasi dan/atau ekspirasi yang tidak memberikan ventilasi adekuat.',
    kw: ['napas dangkal','cuping hidung','retaksi','substernal','interkostal','bibir','orthopnea','takipnea','bradipnea','cheyne','kussmaul','nasal','kanul','masker','venturi','non rebreathing'],
    bp: 1,
    slki: [{ lb: 'Status Pernapasan: Ventilasi', ind: ['Frekuensi napas normal','Irama napas teratur','Kedalaman napas adequat','Tidak ada penggunaan otot aksesoris'] }],
    siki: [
      { lb: 'Manajemen Jalan Napas', act: ['Pastikan jalan napas paten','Posisikan pasien untuk maksimalkan ventilasi','Berikan oksigen tambahan sesuai order','Monitor frekuensi, kedalaman, irama napas','Suction sekret jika perlu','Ajarkan pernapasan bibir saat ekspirasi','Ajarkan pernapasan diafragma','Monitor SpO2 dan gas darah','Kolaborasi bronkodilator'] },
      { lb: 'Terapi Oksigen', act: ['Berikan oksigen sesuai order dan indikasi','Monitor aliran oksigen dan metode pemberian','Pastikan konektor dan selang terpasang baik','Monitor SpO2 selama pemberian oksigen','Evaluasi efektivitas terapi oksigen'] }
    ]
  },
  {
    id: '00047', lb: 'Risiko Kerusakan Integritas Kulit', dom: 'Keamanan', isRisiko: true,
    def: 'Peningkatan kerentanan terhadap perubahan kulit yang merugikan.',
    kw: ['bedrest','tirah baring','imobilisasi','inkontinensia','edema','dekubitus','ulkus','lesi','kulit kering','kulit tipis','luka','gesekan','shear','friction','kelembaban','parese','paralisis','diabetik','steroid'],
    bp: 2,
    slki: [{ lb: 'Status Integumen Kulit', ind: ['Kulit utuh tanpa lesi','Turgor kulit baik','Tidak ada eritema','Tidak ada area tekanan'] }],
    siki: [{ lb: 'Perlindungan Kulit', act: ['Skrining risiko dekubitus (Braden Scale) saat masuk dan berkala','Perubahan posisi setiap 2 jam','Gunakan bantalan pengurang tekanan (matras anti-dekubitus)','Jaga kelembaban kulit: bersihkan, keringkan, oleskan lotion','Minimalkan gesekan dan geseran saat memindahkan pasien','Optimalkan nutrisi untuk penyembuhan kulit','Elevasi area edema','Monitor area tulang menonjol setiap shift','Dokumentasikan temuan integumen kulit','Kolaborasi wound care jika diperlukan'] }]
  },
  {
    id: '00011', lb: 'Konstipasi', dom: 'Eliminasi',
    def: 'Penurunan frekuensi defekasi disertai pengeluaran feses yang keras dan kering.',
    kw: ['konstipasi','sembelit','susah bab','bab sulit','bab keras','feses keras','straining','perut kembung','distensi','tidak bab','obstipasi'],
    bp: 3,
    slki: [{ lb: 'Eliminasi Usus', ind: ['BAB teratur (1-3x/hari)','Konsistensi feses lunak','Tidak ada straining saat BAB'] }],
    siki: [{ lb: 'Manajemen Konstipasi', act: ['Anjurkan intake cairan adequat (2000-2500 ml/hari)','Anjurkan makanan tinggi serat: sayur, buah, biji-bijian','Anjurkan aktivitas fisik sesuai kemampuan','Ajarkan kebiasaan BAB teratur pada waktu yang sama','Berikan laksatif/suppositoria sesuai order','Monitor frekuensi, konsistensi, jumlah feses','Monitor distensi abdomen dan nyeri','Kolaborasi jika konstipasi tidak membaik'] }]
  },
  {
    id: '00013', lb: 'Diare', dom: 'Eliminasi',
    def: 'Buang air besar cair dengan frekuensi lebih dari biasanya.',
    kw: ['diare','mencret','bab cair','bab berair','bab sering','kram perut','urgensi'],
    bp: 2,
    slki: [{ lb: 'Eliminasi Usus', ind: ['Frekuensi BAB normal','Konsistensi feses normal','Tidak ada kram abdomen'] }],
    siki: [{ lb: 'Manajemen Diare', act: ['Monitor frekuensi, konsistensi, jumlah diare','Kirim spesimen feses untuk pemeriksaan lab','Monitor tanda dehidrasi: turgor, mukosa, TD, nadi','Catat intake dan output cairan ketat','Berikan cairan pengganti (ORS) sesuai order','Berikan diet sesuai tingkat diare','Kolaborasi antidiare sesuai order','Perawatan perianal: bersihkan lembut, oleskan barrier cream','Monitor elektrolit serum','Edukasi kebersihan makanan dan tangan'] }]
  },
  {
    id: '00085', lb: 'Kerusakan Mobilitas Fisik', dom: 'Aktivitas',
    def: 'Keterbatasan dalam kemampuan melakukan gerakan fisik secara mandiri.',
    kw: ['mobilitas terbatas','sulit bergerak','sulit jalan','parese','paralisis','hemiparese','hemiplegia','fraktur','post op','pasca operasi','ketergantungan','alat bantu','kursi roda','walker','tongkat'],
    bp: 2,
    slki: [{ lb: 'Kemampuan Mobilitas Fisik', ind: ['Mampu melakukan ROM aktif','Mampu berpindah posisi mandiri','Mampu berjalan sesuai kemampuan','Kekuatan otot normal'] }],
    siki: [
      { lb: 'Terapi Latihan: Ambulasi', act: ['Tentukan kemampuan ambulasi saat ini','Bantu pasien bangun dari tempat tidur secara bertahap','Mobilisasi bertahap: duduk → berdiri → berjalan','Gunakan alat bantu sesuai kebutuhan','Monitor respons selama ambulasi: TD, N, RR, SpO2','Ajarkan teknik transfer yang aman','Kolaborasi fisioterapi untuk program latihan','Evaluasi kemajuan mobilitas secara berkala'] },
      { lb: 'Terapi Latihan: ROM', act: ['ROM pasif pada ekstremitas yang tidak bisa digerakkan','Ajarkan dan bantu ROM aktif pada ekstremitas mampu','Latihan 2-3x/hari, 5-10 repetisi per gerakan','Monitor toleransi pasien','Dokumentasikan ROM yang dicapai'] }
    ]
  },
  {
    id: '00016', lb: 'Gangguan Eliminasi Urin', dom: 'Eliminasi',
    def: 'Dysfungsi dalam eliminasi urin.',
    kw: ['retensi','inkontinensia','urgensi','dysuria','hematuria','nyeri bak','anyang anyang','kateter','foley','catheter','urine','urin','kandung kemih','ngompol','tidak bisa kencing'],
    bp: 3,
    slki: [{ lb: 'Eliminasi Urin', ind: ['Mampu berkemih mandiri','Tidak ada retensi urine','Tidak ada inkontinensia'] }],
    siki: [{ lb: 'Manajemen Eliminasi Urin', act: ['Monitor output urine: frekuensi, jumlah, warna','Kateterisasi jika diperlukan sesuai prosedur','Rawat kateter sesuai standar','Monitor tanda infeksi saluran kemih','Ajarkan latihan otot panggul (Kegel)','Kolaborasi USG untuk evaluasi residu post void','Monitor intake dan output cairan','Edukasi pola BAK yang sehat'] }]
  },
  {
    id: '00126', lb: 'Kurang Pengetahuan', dom: 'Kesehatan',
    def: 'Ketiadaan atau kurangnya informasi kognitif terkait topik tertentu.',
    kw: ['tidak tahu','kurang paham','belum paham','salah paham','butuh edukasi','perlu informasi','belum tahu','bertanya','pengetahuan kurang','tidak mengerti'],
    bp: 4,
    slki: [
      { lb: 'Pengetahuan: Proses Penyakit', ind: ['Menjelaskan proses penyakit','Menjelaskan tanda-tanda penyakit','Menjelaskan faktor risiko'] },
      { lb: 'Pengetahuan: Prosedur/Tindakan', ind: ['Menjelaskan tujuan tindakan','Menjelaskan prosedur tindakan','Menyebutkan efek samping tindakan'] }
    ],
    siki: [{ lb: 'Pengajaran: Proses Penyakit', act: ['Assess tingkat pengetahuan pasien saat ini','Identifikasi kebutuhan belajar pasien','Gunakan metode pengajaran yang sesuai','Berikan informasi tentang penyakit: penyebab, tanda, gejala, pengobatan','Gunakan media pendukung: leaflet, video, gambar','Ajarkan tanda bahaya yang harus dilaporkan','Libatkan keluarga dalam proses edukasi','Evaluasi pemahaman pasien dengan metode teach-back','Dokumentasikan materi yang telah disampaikan','Berikan lembar edukasi tertulis'] }]
  }
];

// === GATHER ALL DATA ===
function gatherAllData() {
  const d = { subj: [], obj: [] };
  const nama = getVal('f-nama'); if (nama) d.subj.push('Pasien ' + nama);
  const keluhan = getVal('f-keluhan'); if (keluhan) d.subj.push(keluhan);
  if (painVal >= 0) {
    d.subj.push('Skala nyeri ' + painVal + '/10');
    const lok = getVal('f-loknyeri'); if (lok) d.subj.push('Lokasi nyeri: ' + lok);
    const dur = getVal('f-durasinyeri'); if (dur) d.subj.push('Durasi: ' + dur);
    const kar = getChkVals('chk-karnyeri'); if (kar.length) d.subj.push('Karakteristik: ' + kar.join(', '));
  }
  const rs = getVal('f-riwayatsekarang'); if (rs) d.subj.push(rs);
  const rd = getChkVals('chk-riwayatdahulu'); if (rd.length) d.subj.push('Riwayat penyakit dahulu: ' + rd.join(', '));
  const al = getVal('f-alergi'); if (al) d.subj.push('Alergi: ' + al);
  const rk = getChkVals('chk-keluarga'); if (rk.length) d.subj.push('Riwayat keluarga: ' + rk.join(', '));
  const na = getVal('f-nafsuafter'); if (na && na !== 'Baik') d.subj.push('Nafsu makan saat sakit: ' + na);
  const km = getChkVals('chk-kesulitanmakan'); if (km.length) d.subj.push('Kesulitan makan: ' + km.join(', '));
  const gt = getChkVals('chk-ganggtidur'); if (gt.length) d.subj.push('Gangguan tidur: ' + gt.join(', '));
  const tk = getVal('f-tidurkualitas'); if (tk && tk !== 'Baik') d.subj.push('Kualitas tidur: ' + tk);
  const td2 = getVal('f-tidurdurasi'); if (td2) d.subj.push('Durasi tidur: ' + td2 + ' jam');
  const mob = getVal('f-mobilisasi'); if (mob && mob !== 'Mobile penuh' && mob !== 'Jalan mandiri') d.subj.push('Mobilisasi: ' + mob);
  // Obyektif
  const tdv = getVal('f-td'); if (tdv) d.obj.push('TD ' + tdv + ' mmHg');
  const nadi = getVal('f-nadi'); if (nadi) d.obj.push('Nadi ' + nadi + 'x/mnt');
  const rr = getVal('f-rr'); if (rr) d.obj.push('RR ' + rr + 'x/mnt');
  const suhu = getVal('f-suhu'); if (suhu) d.obj.push('Suhu ' + suhu + '°C');
  const spo2 = getVal('f-spo2'); if (spo2) d.obj.push('SpO2 ' + spo2 + '%');
  const bb = getVal('f-bb'); if (bb) d.obj.push('BB ' + bb + ' kg');
  const tb = getVal('f-tb'); if (tb) d.obj.push('TB ' + tb + ' cm');
  const imt = getVal('f-imt'); if (imt) d.obj.push('IMT ' + imt + ' (' + getVal('f-imtkat') + ')');
  const gcs = getVal('f-gcs-total'); if (gcs) d.obj.push('GCS ' + gcs);
  const ub = getVal('f-ubahbb'); if (ub && ub !== 'Tetap') d.obj.push('Perubahan BB: ' + ub);
  const bk = getChkVals('chk-bak'); if (bk.length) d.obj.push('Kelainan BAK: ' + bk.join(', '));
  const bab = getChkVals('chk-bab'); if (bab.length) d.obj.push('Kelainan BAB: ' + bab.join(', '));
  const hy = getChkVals('chk-hygiene'); if (hy.length) d.obj.push('Hygiene: ' + hy.join(', '));
  const pfMap = [['pf-kepala','Kepala & Leher'],['pf-paru','Paru'],['pf-jantung','Jantung'],['pf-abdomen','Abdomen'],['pf-ekstremitas','Ekstremitas'],['pf-kulit','Kulit'],['pf-neuro','Neurologis']];
  pfMap.forEach(function(p) { const v = getVal('f-' + p[0]); if (v) d.obj.push(p[1] + ': ' + v); });
  getLabData().forEach(function(l) { d.obj.push('Lab ' + l.p + ': ' + l.v + (l.n ? ' (normal: ' + l.n + ')' : '')); });
  getRoxData().forEach(function(r) { d.obj.push(r.t + ': ' + r.res); });
  const ekg = getVal('f-ekg'); if (ekg) d.obj.push('EKG: ' + ekg);
  const lp = getVal('f-lainpenunjang'); if (lp) d.obj.push(lp);
  const ivfd = getVal('f-ivfd'); if (ivfd) d.obj.push('IVFD: ' + ivfd);
  return d;
}

// === ANALISIS ===
function analyzeData(data) {
  const allText = data.subj.concat(data.obj).join(' ').toLowerCase();
  const results = [];
  DB.forEach(function(dx) {
    let score = 0;
    dx.kw.forEach(function(kw) { if (allText.includes(kw.toLowerCase())) score++; });
    if (score > 0) {
      let pri = dx.bp;
      if (dx.id === '00030') { const s = +getVal('f-spo2'); if (s && s < 90) pri = 1; }
      if (dx.id === '00199' && painVal >= 7) pri = 2;
      if (dx.id === 'RJ') { const g = +getVal('f-gcs-total'); if (g && g <= 12) pri = 1; }
      if (dx.id === '00002') { const i = +getVal('f-imt'); if (i && i < 17) pri = 1; }
      results.push({ id: dx.id, lb: dx.lb, dom: dx.dom, def: dx.def, isRisiko: dx.isRisiko, kw: dx.kw, bp: dx.bp, slki: dx.slki, siki: dx.siki, matchScore: score, finalPriority: pri });
    }
  });
  results.sort(function(a, b) { return a.finalPriority - b.finalPriority || b.matchScore - a.matchScore; });
  return results;
}

// === AI DETECTOR ===
function runAI() {
  const text = document.getElementById('ai-input').value.trim();
  if (!text) { toast('Tempelkan teks catatan medis terlebih dahulu', 'e'); return; }
  const lower = text.toLowerCase();
  const results = [];
  DB.forEach(function(dx) {
    let score = 0;
    dx.kw.forEach(function(kw) { if (lower.includes(kw.toLowerCase())) score++; });
    if (score > 0) results.push({ id: dx.id, lb: dx.lb, dom: dx.dom, def: dx.def, isRisiko: dx.isRisiko, kw: dx.kw, slki: dx.slki, siki: dx.siki, matchScore: score, bp: dx.bp });
  });
  results.sort(function(a, b) { return b.matchScore - a.matchScore; });
  if (results.length === 0) {
    document.getElementById('ai-result').innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted)"><i class="fas fa-robot" style="font-size:32px;margin-bottom:8px;display:block;opacity:.3"></i>Tidak ditemukan diagnosis yang cocok. Coba tambahkan data lebih lengkap.</div>';
    return;
  }
  let html = '<div style="margin-top:14px"><div style="font-size:12px;font-weight:700;margin-bottom:10px;color:var(--cyan);display:flex;align-items:center;gap:6px"><span class="pulse-dot"></span> Ditemukan ' + results.length + ' diagnosis keperawatan:</div>';
  results.forEach(function(r) {
    const pct = Math.min(100, Math.round((r.matchScore / r.kw.length) * 100));
    html += '<div class="am" onclick="expandAIResult(\'' + r.id + '\')"><span><strong>' + r.lb + '</strong> <span style="color:var(--muted);font-size:10px">(' + r.id + ')</span></span><span class="ms">' + r.matchScore + ' keyword | ' + pct + '%</span></div>';
  });
  html += '</div>';
  document.getElementById('ai-result').innerHTML = html;
  toast('AI mendeteksi ' + results.length + ' diagnosis keperawatan', 's');
}

function expandAIResult(id) {
  const dx = DB.find(function(d) { return d.id === id; });
  if (!dx) return;
  const existing = document.querySelector('.ai-detail-' + id);
  if (existing) { existing.remove(); return; }
  const priColors = { 1: 'var(--danger)', 2: 'var(--warn)', 3: 'var(--teal)', 4: 'var(--purple)' };
  let html = '<div class="ai-detail-' + id + '" style="margin-top:12px;padding:16px;background:var(--card);border:1px solid rgba(0,220,255,.2);border-radius:10px;backdrop-filter:blur(10px)">';
  html += '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + dx.lb + ' <span style="color:var(--muted);font-size:11px">(' + dx.id + ') — ' + dx.dom + '</span></div>';
  html += '<div style="font-size:12px;color:var(--text2);margin-bottom:14px">' + dx.def + '</div>';
  dx.slki.forEach(function(s) {
    html += '<div class="dxs dxs-sliki"><div class="dxst" style="color:var(--cyan)"><i class="fas fa-bullseye"></i> SLKI: ' + s.lb + '</div>';
    s.ind.forEach(function(ind) { html += '<div class="ir"><span>' + ind + '</span><span style="color:var(--muted)">Skala 1-5</span></div>'; });
    html += '</div>';
  });
  dx.siki.forEach(function(s) {
    html += '<div class="dxs dxs-siki"><div class="dxst" style="color:var(--purple)"><i class="fas fa-hand-holding-medical"></i> SIKI: ' + s.lb + '</div>';
    s.act.forEach(function(a) { html += '<div class="ai">' + a + '</div>'; });
    html += '</div>';
  });
  html += '</div>';
  const container = document.getElementById('ai-result');
  const div = document.createElement('div');
  div.className = 'ai-detail-' + id;
  div.innerHTML = html;
  container.appendChild(div);
}

// === RUN ANALYSIS ===
function runAnalysis() {
  const data = gatherAllData();
  const results = analyzeData(data);
  const sBox = document.getElementById('analisa-subjektif'); sBox.style.display = 'block';
  document.getElementById('data-s').innerHTML = data.subj.length
    ? data.subj.map(function(s) { return '<div style="padding:4px 0;border-bottom:1px solid var(--border)"><i class="fas fa-quote-left" style="color:var(--cyan);font-size:9px;margin-right:6px;opacity:.5"></i>' + s + '</div>'; }).join('')
    : '<div style="color:var(--muted)">Data subyektif belum diisi</div>';
  const oBox = document.getElementById('analisa-obyektif'); oBox.style.display = 'block';
  document.getElementById('data-o').innerHTML = data.obj.length
    ? data.obj.map(function(s) { return '<div style="padding:4px 0;border-bottom:1px solid var(--border)"><i class="fas fa-clipboard-check" style="color:var(--teal);font-size:9px;margin-right:6px;opacity:.5"></i>' + s + '</div>'; }).join('')
    : '<div style="color:var(--muted)">Data obyektif belum diisi</div>';
  const mBox = document.getElementById('analisa-masalah'); mBox.style.display = 'block';
  if (results.length === 0) {
    document.getElementById('data-masalah').innerHTML = '<div style="color:var(--muted)"><i class="fas fa-info-circle"></i> Belum teridentifikasi masalah. Lengkapi data asesmen terlebih dahulu.</div>';
  } else {
    const pc = { 1: 'var(--danger)', 2: 'var(--warn)', 3: 'var(--teal)', 4: 'var(--purple)' };
    const bc = { 1: 'b-h', 2: 'b-m', 3: 'b-l', 4: 'b-v' };
    const pl = { 1: 'Prioritas 1', 2: 'Prioritas 2', 3: 'Prioritas 3', 4: 'Prioritas 4' };
    document.getElementById('data-masalah').innerHTML = results.map(function(r) {
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(4,10,20,.5);border-radius:8px;margin-bottom:6px;border-left:3px solid ' + pc[r.finalPriority] + '"><span style="font-size:13px;font-weight:600">' + r.lb + '</span><span style="font-size:10px;color:var(--muted)">(' + r.id + ')</span><span class="badge ' + bc[r.finalPriority] + '">' + pl[r.finalPriority] + '</span><span style="margin-left:auto;font-size:11px;color:var(--cyan)">' + r.matchScore + ' match</span></div>';
    }).join('');
  }
  _diagResults = results;
  toast('Analisis selesai: ' + results.length + ' masalah teridentifikasi', 's');
}

// === RENDER DIAGNOSIS ===
function renderDiagnosis() {
  const results = _diagResults || [];
  const container = document.getElementById('dx-list');
  if (results.length === 0) {
    container.innerHTML = '<div class="card" style="text-align:center;padding:40px"><i class="fas fa-clipboard-list" style="font-size:36px;color:var(--muted);margin-bottom:12px;display:block;opacity:.3"></i><div style="color:var(--muted);font-size:13px">Belum ada diagnosis. Jalankan analisis data terlebih dahulu.</div><button class="btn btn-p" style="margin-top:14px" onclick="goStep(8);runAnalysis();setTimeout(function(){renderDiagnosis();goStep(9)},400)"><i class="fas fa-arrow-left"></i> Ke Analisa Data</button></div>';
    return;
  }
  const colors = { 1: 'var(--danger)', 2: 'var(--warn)', 3: 'var(--teal)', 4: 'var(--purple)' };
  const bgc = { 1: 'var(--danger-g)', 2: 'var(--warn-g)', 3: 'var(--teal-g)', 4: 'var(--purple-g)' };
  const bc = { 1: 'b-h', 2: 'b-m', 3: 'b-l', 4: 'b-v' };
  let html = '';
  results.forEach(function(r, i) {
    const c = colors[r.finalPriority] || 'var(--cyan)';
    const bg = bgc[r.finalPriority] || 'var(--cyan-g)';
    html += '<div class="dxc" id="dxc-' + i + '"><div class="dxh" onclick="document.getElementById(\'dxc-' + i + '\').classList.toggle(\'open\')">';
    html += '<div class="dxh-icon" style="background:' + bg + ';color:' + c + '"><i class="fas fa-file-medical"></i></div>';
    html += '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700">' + r.lb + '</div><div style="font-size:10.5px;color:var(--muted)">SDKI ' + r.id + ' — ' + r.dom + (r.isRisiko ? ' <span class="badge b-a">Risiko</span>' : '') + '</div></div>';
    html += '<span class="badge ' + bc[r.finalPriority] + '">P' + r.finalPriority + '</span>';
    html += '<i class="fas fa-chevron-down dxcv"></i></div><div class="dxb">';
    html += '<div style="font-size:12px;color:var(--text2);margin-bottom:14px;padding:10px;background:rgba(4,10,20,.4);border-radius:8px;border:1px solid var(--border)">' + r.def + '</div>';
    r.slki.forEach(function(s) {
      html += '<div class="dxs dxs-sliki"><div class="dxst" style="color:var(--cyan)"><i class="fas fa-bullseye"></i> SLKI: ' + s.lb + '</div>';
      s.ind.forEach(function(ind) { html += '<div class="ir"><span>' + ind + '</span><span>Skala 1 (buruk) → 5 (baik)</span></div>'; });
      html += '</div>';
    });
    r.siki.forEach(function(s) {
      html += '<div class="dxs dxs-siki"><div class="dxst" style="color:var(--purple)"><i class="fas fa-hand-holding-medical"></i> SIKI: ' + s.lb + '</div>';
      s.act.forEach(function(a) { html += '<div class="ai">' + a + '</div>'; });
      html += '</div>';
    });
    html += '</div></div>';
  });
  container.innerHTML = html;
}

// === RENDER PRIORITAS ===
function renderPriority() {
  const results = _diagResults || [];
  const container = document.getElementById('priority-list');
  if (results.length === 0) {
    container.innerHTML = '<div class="card" style="text-align:center;padding:40px"><div style="color:var(--muted)">Belum ada data prioritas.</div><button class="btn btn-p" style="margin-top:14px" onclick="goStep(8);runAnalysis();setTimeout(function(){renderPriority();goStep(10)},400)"><i class="fas fa-arrow-left"></i> Ke Analisa Data</button></div>';
    return;
  }
  const labels = { 1: 'Mengancam Jiwa', 2: 'Bahaya / Keamanan', 3: 'Kenyamanan', 4: 'Pendidikan / Psikologis' };
  const colors = { 1: '#f43f5e', 2: '#fbbf24', 3: '#2dd4bf', 4: '#a78bfa' };
  const bgColors = { 1: 'rgba(244,63,94,.06)', 2: 'rgba(251,191,36,.06)', 3: 'rgba(45,212,191,.06)', 4: 'rgba(167,139,250,.06)' };
  let html = '';
  let num = 1;
  [1, 2, 3, 4].forEach(function(pri) {
    const group = results.filter(function(r) { return r.finalPriority === pri; });
    if (group.length === 0) return;
    html += '<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;color:' + colors[pri] + ';margin-bottom:8px;display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:2px;background:' + colors[pri] + ';display:inline-block;box-shadow:0 0 8px ' + colors[pri] + '"></span>PRIORITAS ' + pri + ' — ' + labels[pri].toUpperCase() + '</div>';
    group.forEach(function(r) {
      html += '<div class="pri" style="background:' + bgColors[pri] + ';border-color:' + colors[pri] + '15"><div class="pn" style="background:' + colors[pri] + '">' + num++ + '</div>';
      html += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + r.lb + '</div><div style="font-size:10.5px;color:var(--muted)">SDKI ' + r.id + ' — ' + r.dom + ' | ' + r.matchScore + ' indikator</div></div>';
      html += '<span class="badge ' + (pri === 1 ? 'b-h' : pri === 2 ? 'b-m' : pri === 3 ? 'b-l' : 'b-v') + '">P' + pri + '</span></div>';
    });
    html += '</div>';
  });
  container.innerHTML = html;
}

// === PRINT ===
function printRes() { window.print(); }

// ============================================================
// RENDER SEMUA STEP HTML
// ============================================================
function renderAllSteps() {
  const C = document.getElementById('carea');

  // Helper: nav buttons
  function nav(prev, next) {
    return '<div class="snav"><button class="btn btn-s" onclick="goStep(' + prev + ')"><i class="fas fa-arrow-left"></i> Sebelumnya</button><button class="btn btn-p" onclick="goStep(' + next + ')">Selanjutnya <i class="fas fa-arrow-right"></i></button></div>';
  }
  function navFirst(next) {
    return '<div class="snav"><button class="btn btn-s" disabled><i class="fas fa-arrow-left"></i> Sebelumnya</button><button class="btn btn-p" onclick="goStep(' + next + ')">Selanjutnya <i class="fas fa-arrow-right"></i></button></div>';
  }

  // --- STEP 0: Identitas ---
  C.innerHTML += '<div class="step active" data-s="0">'
    + '<div class="card"><div class="ct"><i class="fas fa-user"></i> Identitas Pasien</div>'
    + '<div class="g2">'
    + f('f-nama','Nama Lengkap','text') + f('f-nik','NIK','text','','16')
    + f('f-ttl','Tanggal Lahir','date') + f('f-jk','Jenis Kelamin','sel',['','— Pilih —','Laki-laki','Perempuan'])
    + f('f-agama','Agama','sel',['','— Pilih —','Islam','Kristen','Katolik','Hindu','Buddha','Konghucu'])
    + f('f-status','Status Pernikahan','sel',['','— Pilih —','Belum Kawin','Kawin','Cerai','Cerai Mati'])
    + f('f-pendidikan','Pendidikan','sel',['','— Pilih —','Tidak Sekolah','SD','SMP','SMA','D3','S1','S2'])
    + f('f-pekerjaan','Pekerjaan','text')
    + '</div>' + ft('f-alamat','Alamat',2) + '</div>'
    + '<div class="card"><div class="ct"><i class="fas fa-hospital"></i> Data Rawat</div>'
    + '<div class="g3">'
    + f('f-norm','No. RM','text') + f('f-tglmasuk','Tgl Masuk','date')
    + f('f-ruangan','Ruangan','sel',['','— Pilih —','ICU','ICCU','HCU','IRNA Kelas 1','IRNA Kelas 2','IRNA Kelas 3','IRJ','IGD','VK'])
    + f('f-diagmed','Diagnosa Medis','text') + f('f-dokter','DPJP','text') + f('f-perawat','Perawat','text')
    + '</div><div class="g2">' + f('f-notelp','No. Telp','text') + f('f-pj','Penanggung Jawab','text') + '</div></div>'
    + navFirst(1) + '</div>';

  // --- STEP 1: Keluhan ---
  C.innerHTML += '<div class="step" data-s="1">'
    + '<div class="card"><div class="ct"><i class="fas fa-comment-medical"></i> Keluhan Utama</div>'
    + ft('f-keluhan','Keluhan Utama',3) + '</div>'
    + '<div class="card"><div class="ct"><i class="fas fa-gauge-high"></i> Skala Nyeri</div>'
    + '<div class="fg"><label class="fl">Skala Nyeri (0 = Tidak Nyeri, 10 = Maksimal)</label><div class="ps" id="pain-scale"></div></div>'
    + '<div class="g2 mt-10">' + f('f-loknyeri','Lokasi Nyeri','text') + f('f-durasinyeri','Durasi','text') + '</div>'
    + '<div class="fg"><label class="fl">Karakteristik</label><div class="cgrp" id="chk-karnyeri" onclick="chkClick(event)">'
    + ck('Tajam')+ck('Tumpul')+ck('Berdenyut')+ck('Perih')+ck('Ditusuk')+ck('Menyebar')+ck('Kram')+ck('Terbakar')
    + '</div></div></div>' + nav(0,2) + '</div>';

  // --- STEP 2: Riwayat ---
  C.innerHTML += '<div class="step" data-s="2">'
    + '<div class="card"><div class="ct"><i class="fas fa-file-medical"></i> Riwayat Penyakit Sekarang</div>'
    + ft('f-riwayatsekarang','Anamnesis',4) + '</div>'
    + '<div class="card"><div class="ct"><i class="fas fa-clipboard-list"></i> Riwayat Penyakit Dahulu</div>'
    + '<div class="fg"><label class="fl">Penyakit yang pernah diderita</label><div class="cgrp" id="chk-riwayatdahulu" onclick="chkClick(event)">'
    + ck('DM')+ck('Hipertensi')+ck('Jantung')+ck('Asma')+ck('TB Paru')+ck('Ginjal')+ck('Stroke')+ck('Kanker')
    + '</div></div><div class="g2">' + ft('f-riwayatop','Riwayat Operasi',2) + ft('f-alergi','Riwayat Alergi',2) + '</div></div>'
    + nav(1,3) + '</div>';

  // --- STEP 3: Keluarga ---
  C.innerHTML += '<div class="step" data-s="3">'
    + '<div class="card"><div class="ct"><i class="fas fa-people-group"></i> Riwayat Kesehatan Keluarga</div>'
    + '<div class="fg"><label class="fl">Penyakit keturunan</label><div class="cgrp" id="chk-keluarga" onclick="chkClick(event)">'
    + ck('DM')+ck('Hipertensi')+ck('Jantung')+ck('Kanker')+ck('Asma')+ck('Stroke')+ck('TB')+ck('Ginjal')
    + '</div></div>' + ft('f-keluargaket','Keterangan',2) + '</div>'
    + nav(2,4) + '</div>';

  // --- STEP 4: Pola Aktivitas ---
  C.innerHTML += '<div class="step" data-s="4">'
    // Nutrisi
    + '<div class="card"><div class="ct"><i class="fas fa-utensils"></i> Pola Nutrisi</div>'
    + '<p style="font-size:11px;color:var(--muted);margin-bottom:8px">Sebelum sakit</p>'
    + '<div class="g3">' + f('f-nafsubefore','Nafsu Makan','sel',['','— Pilih —','Baik','Cukup','Kurang']) + f('f-jmlmakanbefore','Jumlah Makan/Hari','text') + f('f-jnsmakanbefore','Jenis Makanan','text') + '</div>'
    + '<p style="font-size:11px;color:var(--muted);margin:10px 0">Saat sakit</p>'
    + '<div class="g3">' + f('f-nafsuafter','Nafsu Makan','sel',['','— Pilih —','Baik','Cukup','Kurang','Tidak ada']) + f('f-jmlmakanafter','Jumlah Makan/Hari','text') + f('f-ubahbb','Perubahan BB','sel',['','— Pilih —','Turun >10%','Turun 5-10%','Turun <5%','Tetap','Naik']) + '</div>'
    + '<div class="fg"><label class="fl">Kesulitan Makan</label><div class="cgrp" id="chk-kesulitanmakan" onclick="chkClick(event)">' + ck('Mual')+ck('Muntah')+ck('Dysphagia')+ck('Diet khusus')+ck('NGT') + '</div></div></div>'
    // Cairan
    + '<div class="card"><div class="ct"><i class="fas fa-glass-water"></i> Pola Cairan</div><div class="g3">' + f('f-jenisminum','Jenis Minuman','text') + f('f-jmlminum','Jumlah/hari','text') + f('f-ivfd','IVFD','text') + '</div></div>'
    // Eliminasi
    + '<div class="card"><div class="ct"><i class="fas fa-toilet"></i> Pola Eliminasi</div><div class="g2"><div>'
    + '<p style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px">BAK</p><div class="g2">' + f('f-bakfreq','Frekuensi','text') + f('f-bakwarna','Warna','sel',['','— Pilih —','Kuning jerami','Kuning pekat','Cokelat','Merah']) + '</div>'
    + '<div class="fg"><label class="fl">Kelainan BAK</label><div class="cgrp" id="chk-bak" onclick="chkClick(event)">' + ck('Anyang-anyangan')+ck('Hematuria')+ck('Kateter')+ck('Inkontinensia')+ck('Retensi') + '</div></div></div><div>'
    + '<p style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px">BAB</p><div class="g2">' + f('f-babfreq','Frekuensi','text') + f('f-babkons','Konsistensi','sel',['','— Pilih —','Lunak','Padat','Cair','Berak hitam','Konstipasi']) + '</div>'
    + '<div class="fg"><label class="fl">Kelainan BAB</label><div class="cgrp" id="chk-bab" onclick="chkClick(event)">' + ck('Diare')+ck('Konstipasi')+ck('Melena')+ck('Darah') + '</div></div></div></div></div>'
    // Tidur & Aktivitas
    + '<div class="card"><div class="ct"><i class="fas fa-bed"></i> Pola Tidur & Aktivitas</div>'
    + '<div class="g2">' + f('f-tidurdurasi','Durasi Tidur','text') + f('f-tidurkualitas','Kualitas Tidur','sel',['','— Pilih —','Baik','Cukup','Kurang','Sangat Kurang']) + '</div>'
    + '<div class="g2"><div class="fg"><label class="fl">Gangguan Tidur</label><div class="cgrp" id="chk-ganggtidur" onclick="chkClick(event)">' + ck('Insomnia')+ck('Terbangun')+ck('Mimpi buruk') + '</div></div>'
    + '<div class="fg">' + f('f-mobilisasi','Mobilisasi','sel',['','— Pilih —','Bedrest total','Tirah baring','Duduk di kursi','Jalan dengan bantuan','Jalan mandiri','Mobile penuh']) + '</div></div>'
    + '<div class="fg"><label class="fl">Hygiene</label><div class="cgrp" id="chk-hygiene" onclick="chkClick(event)">' + ck('Mandi sendiri')+ck('Mandi dibantu')+ck('Gosok gigi sendiri')+ck('Dibantu perawat') + '</div></div></div>'
    + nav(3,5) + '</div>';

  // --- STEP 5: Fisik ---
  C.innerHTML += '<div class="step" data-s="5">'
    + '<div class="card"><div class="ct"><i class="fas fa-brain"></i> Kesadaran (GCS)</div>'
    + '<div class="g2">'
    + f('f-gcs-e','Eye (E)','sel',['4','4 — Spontan','3','3 — Suara','2','2 — Nyeri','1','1 — Tidak'],'','onchange="calcGCS()"')
    + f('f-gcs-v','Verbal (V)','sel',['5','5 — Tepat','4','4 — Tidak Tepat','3','3 — Tidak Jelas','2','2 — Suara','1','1 — Tidak'],'','onchange="calcGCS()"')
    + f('f-gcs-m','Motor (M)','sel',['6','6 — Perintah','5','5 — Lokalisasi','4','4 — Fleksi Normal','3','3 — Dekortikasi','2','2 — Deserebrasi','1','1 — Tidak'],'','onchange="calcGCS()"')
    + f('f-gcs-total','Total GCS','text','','','readonly')
    + '</div></div>'
    + '<div class="card"><div class="ct"><i class="fas fa-heart-pulse"></i> Tanda Vital</div>'
    + '<div class="g3">'
    + f('f-td','TD (mmHg)','text') + f('f-nadi','Nadi (x/mnt)','number') + f('f-rr','RR (x/mnt)','number')
    + f('f-suhu','Suhu (°C)','number','','','step="0.1"') + f('f-spo2','SpO2 (%)','number')
    + f('f-bb','BB (kg)','number','','','oninput="calcIMT()"') + f('f-tb','TB (cm)','number','','','oninput="calcIMT()"')
    + f('f-imt','IMT','text','','','readonly') + f('f-imtkat','Kategori IMT','text','','','readonly')
    + '</div></div>'
    + '<div class="card"><div class="ct"><i class="fas fa-stethoscope"></i> Pemeriksaan Fisik Sistem</div>'
    + ft('f-pf-kepala','Kepala & Leher',2)
    + ft('f-pf-paru','Paru-paru',2)
    + ft('f-pf-jantung','Jantung',2)
    + ft('f-pf-abdomen','Abdomen',2)
    + ft('f-pf-ekstremitas','Ekstremitas',2)
    + ft('f-pf-kulit','Kulit & Integumen',2)
    + ft('f-pf-neuro','Neurologis',2)
    + '</div>' + nav(4,6) + '</div>';

  // --- STEP 6: Penunjang ---
  C.innerHTML += '<div class="step" data-s="6">'
    + '<div class="card"><div class="ct"><i class="fas fa-flask"></i> Laboratorium</div><div id="lab-rows"></div><button class="btn btn-sm btn-s mt-10" onclick="addLabRow()"><i class="fas fa-plus"></i> Tambah Parameter</button></div>'
    + '<div class="card"><div class="ct"><i class="fas fa-x-ray"></i> Radiologi</div><div id="rox-rows"></div><button class="btn btn-sm btn-s mt-10" onclick="addRoxRow()"><i class="fas fa-plus"></i> Tambah Pemeriksaan</button></div>'
    + '<div class="card"><div class="ct"><i class="fas fa-wave-square"></i> Pemeriksaan Lainnya</div>'
    + ft('f-ekg','EKG',2) + ft('f-lainpenunjang','USG / CT Scan / MRI / Lainnya',2) + '</div>'
    + nav(5,7) + '</div>';

  // --- STEP 7: AI ---
  C.innerHTML += '<div class="step" data-s="7">'
    + '<div class="card card-glow">'
    + '<div class="ct"><i class="fas fa-robot"></i> AI Smart Detector <span class="badge b-a" style="margin-left:6px"><span class="pulse-dot"></span> INTELLIGENT</span></div>'
    + '<p style="font-size:12px;color:var(--text2);margin-bottom:14px">Tempelkan salinan catatan medis atau asesmen keperawatan. AI akan mendeteksi SDKI, SLKI, dan SIKI yang relevan secara otomatis.</p>'
    + '<div class="aiz"><textarea id="ai-input" placeholder="Tempelkan teks catatan medis di sini...&#10;&#10;Contoh: Pasien datang dengan keluhan nyeri dada sejak 3 jam. NRS 7/10. TD 150/90, N 102x/mnt, RR 28x/mnt, SPO2 89%. Sesak napas, sianosis bibir. Terpasang kateter. Lab: Hb 8.2, Leukosit 15000, Trombosit 80000. Ro: kardiomegali, edema paru. Cemas, sulit tidur. Riwayat DM dan hipertensi. Nafsu makan berkurang."></textarea></div>'
    + '<div style="display:flex;gap:8px;margin-top:12px" class="no-print"><button class="btn btn-p" onclick="runAI()"><i class="fas fa-wand-magic-sparkles"></i> Analisis dengan AI</button><button class="btn btn-s" onclick="document.getElementById(\'ai-input\').value=\'\';document.getElementById(\'ai-result\').innerHTML=\'\'"><i class="fas fa-eraser"></i> Bersihkan</button></div>'
    + '<div id="ai-result"></div></div>' + nav(6,8) + '</div>';

  // --- STEP 8: Analisa ---
  C.innerHTML += '<div class="step" data-s="8">'
    + '<div class="card"><div class="ct"><i class="fas fa-chart-bar"></i> Analisa Data Keperawatan</div>'
    + '<p style="font-size:12px;color:var(--text2);margin-bottom:12px">Data dikumpulkan otomatis dari seluruh form asesmen yang telah diisi.</p>'
    + '<button class="btn btn-p no-print" onclick="runAnalysis()"><i class="fas fa-magnifying-glass-chart"></i> Jalankan Analisis Data</button></div>'
    + '<div class="card" id="analisa-subjektif" style="display:none"><div class="ct"><i class="fas fa-comment"></i> Data Subyektif</div><div id="data-s"></div></div>'
    + '<div class="card" id="analisa-obyektif" style="display:none"><div class="ct"><i class="fas fa-clipboard-check"></i> Data Obyektif</div><div id="data-o"></div></div>'
    + '<div class="card" id="analisa-masalah" style="display:none"><div class="ct"><i class="fas fa-triangle-exclamation"></i> Identifikasi Masalah</div><div id="data-masalah"></div></div>'
    + nav(7,9) + '</div>';

  // --- STEP 9: SDKI/SLKI/SIKI ---
  C.innerHTML += '<div class="step" data-s="9">'
    + '<div class="card"><div class="ct"><i class="fas fa-hospital"></i> Diagnosis Keperawatan — SDKI, SLKI, SIKI</div>'
    + '<p style="font-size:12px;color:var(--text2);margin-bottom:12px">Klik setiap kartu untuk melihat detail SLKI (Luaran) dan SIKI (Intervensi) sesuai standar.</p>'
    + '<button class="btn btn-p no-print" onclick="goStep(8);runAnalysis();setTimeout(function(){renderDiagnosis();goStep(9)},400)"><i class="fas fa-rotate"></i> Refresh Analisis</button></div>'
    + '<div id="dx-list"></div>' + nav(8,10) + '</div>';

  // --- STEP 10: Prioritas ---
  C.innerHTML += '<div class="step" data-s="10">'
    + '<div class="card"><div class="ct"><i class="fas fa-bolt"></i> Prioritas Masalah Keperawatan</div>'
    + '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">'
    + '<div style="display:flex;align-items:center;gap:5px;font-size:11px"><span style="width:10px;height:10px;border-radius:2px;background:#f43f5e;display:inline-block;box-shadow:0 0 8px #f43f5e"></span>P1 — Mengancam Jiwa</div>'
    + '<div style="display:flex;align-items:center;gap:5px;font-size:11px"><span style="width:10px;height:10px;border-radius:2px;background:#fbbf24;display:inline-block;box-shadow:0 0 8px #fbbf24"></span>P2 — Bahaya/Keamanan</div>'
    + '<div style="display:flex;align-items:center;gap:5px;font-size:11px"><span style="width:10px;height:10px;border-radius:2px;background:#2dd4bf;display:inline-block;box-shadow:0 0 8px #2dd4bf"></span>P3 — Kenyamanan</div>'
    + '<div style="display:flex;align-items:center;gap:5px;font-size:11px"><span style="width:10px;height:10px;border-radius:2px;background:#a78bfa;display:inline-block;box-shadow:0 0 8px #a78bfa"></span>P4 — Pendidikan/Psikologis</div>'
    + '</div>'
    + '<button class="btn btn-p no-print" onclick="goStep(8);runAnalysis();setTimeout(function(){renderPriority();goStep(10)},400)"><i class="fas fa-rotate"></i> Refresh Prioritas</button></div>'
    + '<div id="priority-list"></div>'
    + '<div class="snav"><button class="btn btn-s" onclick="goStep(9)"><i class="fas fa-arrow-left"></i> Sebelumnya</button><button class="btn btn-p" onclick="printRes()"><i class="fas fa-print"></i> Cetak Hasil Asesmen</button></div>'
    + '</div>';
}

// === FORM HELPERS ===
function f(id, label, type, opts, max, extra) {
  let attrs = 'id="' + id + '" class="fi" placeholder="' + label + '"';
  if (max) attrs += ' maxlength="' + max + '"';
  if (extra) attrs += ' ' + extra;
  if (type === 'date') attrs = 'id="' + id + '" type="date" class="fi"';
  if (type === 'number') attrs = 'id="' + id + '" type="number" class="fi" placeholder="' + label + '"';
  if (type === 'sel') {
    let html = '<div class="fg"><label class="fl">' + label + '</label><select id="' + id + '" class="fs">';
    opts.forEach(function(o, i) { html += '<option value="' + o + '"' + (extra && extra.includes('onchange') ? ' ' + extra : '') + '>' + o + '</option>'; });
    html += '</select></div>'; return html;
  }
  return '<div class="fg"><label class="fl">' + label + '</label><input ' + attrs + '></div>';
}
function ft(id, label, rows) {
  return '<div class="fg"><label class="fl">' + label + '</label><textarea id="' + id + '" class="fta" rows="' + rows + '" placeholder="' + label + '..."></textarea></div>';
}
function ck(val) {
  return '<label class="ci" data-val="' + val + '"><input type="checkbox"><i class="fas fa-check"></i> ' + val + '</label>';
}

// === INIT ===
renderAllSteps();
buildPain();
calcGCS();
addLabRow(); addLabRow(); addLabRow();
addRoxRow(); addRoxRow();
goStep(0);
