/**
 * TANDA X 1.0 - PRO (FIXED GITHUB SCRIPT)
 */

// --- 1. KONFIGURASI TELEGRAM & DATABASE ---
const TELEGRAM_TOKEN = "8362133596:AAG0FzCOuspjxIrZT6dl2CFAC0pwBanf-yE"; 
const TELEGRAM_CHAT_ID = "1460830899"; 

let databasePengguna = JSON.parse(localStorage.getItem('tandaX_db')) || [
    { user: "admin", pass: "1234", phone: "N/A", pakej: "N/A", status: "active" }
];

const updateDB = () => localStorage.setItem('tandaX_db', JSON.stringify(databasePengguna));

// --- 2. LOGIK NAVIGASI ---
window.showRegister = () => {
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('register-box').style.display = 'block';
};

window.showLogin = () => {
    document.getElementById('login-box').style.display = 'block';
    document.getElementById('register-box').style.display = 'none';
};

// --- 3. LOGIK PENDAFTARAN ---
window.prosesDaftar = () => {
    const u = document.getElementById('regUser').value.trim();
    const p = document.getElementById('regPass').value.trim();
    const ph = document.getElementById('regPhone').value.trim();
    const pkg = document.getElementById('regPackage').value;

    if(!u || !p || !ph) return alert("Sila isi semua maklumat!");
    
    databasePengguna.push({ user: u, pass: p, phone: ph, pakej: pkg, status: "pending" });
    updateDB();

    const mesej = `🔔 *PENDAFTARAN BARU*\n👤 User: ${u}\n🔑 Pass: ${p}\n📞 Phone: ${ph}\n📦 Pakej: ${pkg}`;
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(mesej)}&parse_mode=Markdown`;

    fetch(url).then(() => { 
        alert("Pendaftaran dihantar! Admin akan hubungi anda."); 
        window.showLogin(); 
    });
};

// --- 4. LOGIK LOG MASUK ---
window.prosesLogin = () => {
    const u = document.getElementById('userInput').value.trim();
    const p = document.getElementById('passInput').value.trim();

    if (u === "admin" && p === "1234") return bukaDashboard();

    const user = databasePengguna.find(x => x.user === u && x.pass === p);
    if (user) {
        if (user.status === "pending") return alert("Akaun belum aktif. Hubungi Admin!");
        localStorage.setItem('tandaX_logged', 'true');
        localStorage.setItem('tandaX_user', u);
        bukaAplikasi();
    } else { 
        alert("Username atau Password salah!"); 
    }
};

// --- 5. ADMIN DASHBOARD ---
function bukaDashboard() {
    document.getElementById('pay-screen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('userTableBody');
    if(!tbody) return;
    tbody.innerHTML = "";
    databasePengguna.forEach((user, index) => {
        if(user.user === 'admin') return;
        const waLink = `https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`;
        tbody.innerHTML += `<tr>
            <td>${user.user}</td>
            <td>${user.phone}</td>
            <td>${user.pakej}</td>
            <td><strong>${user.status.toUpperCase()}</strong></td>
            <td>
                ${user.status === 'pending' ? `<button onclick="ubahStatus(${index},'active')" class="btn-action" style="background:green; color:white;">Aktif</button>` : ''}
                <a href="${waLink}" target="_blank" class="btn-action" style="background:#25D366; color:white; text-decoration:none;">WA</a>
                <button onclick="padamUser(${index})" class="btn-action" style="background:red; color:white;">Padam</button>
            </td>
        </tr>`;
    });
}

window.ubahStatus = (idx, s) => { databasePengguna[idx].status = s; updateDB(); renderTable(); };
window.padamUser = (idx) => { if(confirm("Padam user ini?")) { databasePengguna.splice(idx,1); updateDB(); renderTable(); } };
window.logKeluarAdmin = () => { localStorage.removeItem('tandaX_logged'); location.reload(); };

// --- 6. LOGIK APLIKASI UTAMA ---
function bukaAplikasi() {
    document.getElementById('pay-screen').style.display = 'none';
    document.getElementById('mainAppSection').style.display = 'block';
    document.getElementById('status').innerText = "Akaun: " + localStorage.getItem('tandaX_user');
}

window.logKeluar = () => { localStorage.removeItem('tandaX_logged'); location.reload(); };

// YouTube API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
let player;

document.getElementById('btnLoad').onclick = () => {
    const url = document.getElementById('youtubeUrl').value;
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/)?.[1];
    if (videoId) {
        if (player) player.loadVideoById(videoId);
        else player = new YT.Player('player', { height: '360', width: '100%', videoId: videoId });
    }
};

// Speech Recognition & Images
const wordImages = {
    kami: "https://i.ibb.co/2BQ4Zyw/Kami-b14a9c807d6417a26758-1.jpg",
    saya: "https://i.ibb.co/tTYPQ2YH/Saya-308cf649158d30e78273.jpg",
    makan: "https://i.ibb.co/pd6WB8L/Makan-Makanan-358171f7a0d456b53998.jpg"
};

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Recognition) {
    const rec = new Recognition();
    rec.lang = 'ms-MY'; rec.continuous = true;
    document.getElementById('btnStart').onclick = () => { rec.start(); document.getElementById('status').innerText = "🎤 Mendengar..."; };
    document.getElementById('btnStop').onclick = () => { rec.stop(); document.getElementById('status').innerText = "Berhenti."; };
    
    rec.onresult = (e) => {
        const t = e.results[e.results.length-1][0].transcript.toLowerCase().trim();
        document.getElementById('transcriptDisplay').innerText = t;
        const lastWord = t.split(" ").pop().replace(/[^\w]/g, '');
        
        if (wordImages[lastWord]) {
            document.getElementById('signImage').src = wordImages[lastWord];
            document.getElementById('output').innerText = "Isyarat: " + lastWord.toUpperCase();
        } else {
            fingerspell(lastWord);
        }
    };
}

function fingerspell(w) {
    let i = 0;
    const interval = setInterval(() => {
        if(i >= w.length) return clearInterval(interval);
        document.getElementById('signImage').src = `https://via.placeholder.com/300?text=${w[i].toUpperCase()}`;
        document.getElementById('output').innerText = "Mengeja: " + w[i].toUpperCase();
        i++;
    }, 700);
}

document.getElementById('btnYT').onclick = () => {
    document.getElementById('youtubeSection').style.display = "block";
    document.getElementById('signLanguageSection').style.display = "flex";
};

window.onload = () => { if(localStorage.getItem('tandaX_logged') === 'true') bukaAplikasi(); };
