/**
 * ==============================================================================
 * ROBOKIDS - PLATFORM EDUKASI ROBOTIKA & PEMROGRAMAN VISUAL (MVP PROTOTYPE)
 * ==============================================================================
 * File: script.js
 * Deskripsi: Modul utama mencakup:
 * 1. Web Audio API Synthesizer (Efek suara tanpa aset eksternal)
 * 2. Lab Edukasi Breadboard Interaktif (Hover/Click, Tooltip, Penjelasan Komponen)
 * 3. Simulator Robot Grid 8x8 (Manipulasi DOM, Animasi CSS, Deteksi Tabrakan)
 * 4. Google Blockly Integration (4 Blok Kustom, Generator JS, Interpreter Step-by-Step)
 * 5. Manajemen Status Game & Perayaan Kemenangan (Mission 1)
 * ==============================================================================
 */

// Menunggu DOM siap sepenuhnya
document.addEventListener("DOMContentLoaded", () => {
  RoboKidsApp.init();
});

const RoboKidsApp = (() => {

  // ============================================================================
  // MODUL 1: AUDIO SYNTHESIZER (WEB AUDIO API)
  // Menghasilkan efek suara sintesis murni tanpa perlu mengunduh file audio luar.
  // ============================================================================
  const AudioManager = (() => {
    let audioCtx = null;
    let isMuted = false;

    // Inisialisasi Audio Context saat ada interaksi pengguna
    const getContext = () => {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      return audioCtx;
    };

    return {
      toggleMute() {
        isMuted = !isMuted;
        return isMuted;
      },
      isMuted() {
        return isMuted;
      },

      // Efek Suara Piezo Buzzer (Gelombang Kotak / Square Wave 850 Hz)
      playBuzzer() {
        if (isMuted) return;
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square"; // Karakteristik khas suara piezo buzzer mikrokontroler
        osc.frequency.setValueAtTime(880, ctx.currentTime); // Nada A5

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      },

      // Efek Suara Langkah Robot (Blip Lembut)
      playStep() {
        if (isMuted) return;
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(420, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      },

      // Efek Suara Putaran / Belok (Sapuan Nada Cepat)
      playTurn() {
        if (isMuted) return;
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      },

      // Efek Suara Tabrakan / Oops
      playBump() {
        if (isMuted) return;
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      },

      // Fanfare Kemenangan (Arpeggio Nada Sukses Ceria)
      playVictory() {
        if (isMuted) return;
        const ctx = getContext();
        if (!ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

          const startTime = ctx.currentTime + idx * 0.12;
          const duration = idx === notes.length - 1 ? 0.6 : 0.2;

          gain.gain.setValueAtTime(0.22, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      },

      // Efek Suara Komponen Terpasang (Snap Klik Gurih)
      playSnap() {
        if (isMuted) return;
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(1100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      },

      // Efek Suara Sirkuit Putus / Buzzer Mati (Klik Tumpul Dud)
      playDud() {
        if (isMuted) return;
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      },

      // Efek Suara Komponen Salah Tempat / Ditolak
      playError() {
        if (isMuted) return;
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    };
  })();

  // ============================================================================
  // MODUL 2: ENSIKLOPEDIA & SISTEM PERAKITAN FISIK (DRAG & DROP BREADBOARD)
  // Menangani perakitan manual komponen: Baterai, Resistor, Buzzer, dan Kabel.
  // ============================================================================
  const HardwareManager = (() => {
    // Database edukatif komponen ramah anak
    const componentsData = {
      "battery": {
        name: "Baterai 9V (Sumber Daya Listrik)",
        icon: "🔋",
        category: "Sumber Tenaga Utama",
        description: "Baterai adalah <strong>sumber energi listrik mandiri</strong> untuk robot. Mengalirkan tegangan 9 Volt dari kutub positif (+) ke sirkuit agar seluruh komponen memiliki energi untuk bekerja.",
        analogy: "Seperti <strong>tandon air bertekanan tinggi</strong> atau <strong>jantung</strong> yang memompa cairan ke seluruh pembuluh pipa robot!",
        hasTestBtn: false
      },
      "resistor": {
        name: "Resistor 1kΩ (Hambatan Listrik)",
        icon: "🛑",
        category: "Komponen Pengaman Sirkuit",
        description: "Resistor bertugas <strong>membatasi dan menahan aliran arus listrik</strong> yang mengalir ke komponen lain. Tanpa resistor, arus listrik yang terlalu besar bisa membuat komponen seperti LED atau Buzzer kepanasan dan rusak terbakar!",
        analogy: "Bayangkan seperti <strong>polisi tidur di jalan raya</strong> atau <strong>keran air yang diputar separuh</strong> agar air tidak menyembur terlalu deras ke ember!",
        hasTestBtn: false
      },
      "buzzer": {
        name: "Piezo Buzzer (Output Suara)",
        icon: "📢",
        category: "Komponen Output / Aktuator",
        description: "Buzzer adalah komponen elektronik yang <strong>mengubah sinyal listrik menjadi gelombang suara / nada 'BEEP' ceria</strong>. Saat pin sinyal dari mikrokontroler aktif, lempengan piezo di dalamnya bergetar sangat cepat hingga terdengar bunyi.",
        analogy: "Sama seperti <strong>klakson pada sepeda motor</strong> atau <strong>mulut robot</strong> yang berbicara menyapa kamu saat misi berhasil!",
        hasTestBtn: true
      },
      "wire-vcc": {
        name: "Jalur Kabel Merah (VCC / Daya +5V)",
        icon: "🔴",
        category: "Jalur Tenaga / Sumber Listrik",
        description: "Kabel merah terhubung ke <strong>kutub positif (+5 Volt)</strong> dari baterai atau regulator daya. Kabel ini mengalirkan energi listrik utama yang memberi 'makanan/tenaga' bagi semua komponen robot.",
        analogy: "Seperti <strong>selang bahan bakar</strong> atau <strong>pembuluh darah arteri</strong> yang mengalirkan energi ke seluruh bagian tubuh!",
        hasTestBtn: false
      },
      "wire-gnd": {
        name: "Jalur Kabel Hitam/Biru (GND / Arde)",
        icon: "⚫",
        category: "Jalur Sirkuit Netral (Ground)",
        description: "Kabel ini terhubung ke <strong>Ground (0 Volt / Kutub Negatif)</strong>. Listrik hanya bisa mengalir jika sirkuitnya 'tertutup' (memiliki jalan keluar kembali ke ground). Jalur GND memastikan tegangan tetap stabil dan aman.",
        analogy: "Seperti <strong>saluran pembuangan air</strong> di rumah. Air yang masuk harus punya jalan keluar agar tidak banjir dan sirkulasi berjalan lancar!",
        hasTestBtn: false
      },
      "wire-gpio": {
        name: "Jalur Kabel Hijau (GPIO Pin 9 - Logika)",
        icon: "🟢",
        category: "Jalur Sinyal Logika & Kontrol",
        description: "Kabel ini terhubung ke <strong>GPIO (General Purpose Input/Output)</strong> otak robot. Berbeda dari kabel listrik biasa yang selalu mengalir, kabel logika ini <strong>bisa dikendalikan lewat kode blok</strong>: Kapan mengirim perintah 'HIGH' (Bunyikan Buzzer) dan 'LOW' (Diam)!",
        analogy: "Seperti <strong>sistem saraf otak</strong> yang mengirim perintah ke otot bibirmu saat kamu memutuskan untuk bersiul!",
        hasTestBtn: false
      },
      "mcu": {
        name: "Robo-Core Microcontroller (Otak Robot)",
        icon: "💻",
        category: "Pusat Kendali / Otak Komputer",
        description: "Mikrokontroler adalah komputer mini yang membaca urutan kode blok yang kamu susun. Chip ini mengatur waktu tunggu dan mengirimkan sinyal listrik ke pin GPIO untuk menjalankan aksi robot.",
        analogy: "Seperti <strong>kapten kapal</strong> yang memegang peta misi dan memberi aba-aba kepada awak kapal untuk bergerak!",
        hasTestBtn: false
      }
    };

    // State Perakitan 6 Komponen Breadboard (Default: Belum Terpasang)
    const installedState = {
      "battery": false,
      "resistor": false,
      "buzzer": false,
      "wire-vcc": false,
      "wire-gnd": false,
      "wire-gpio": false
    };

    let activeCompKey = null;

    // Pasang Komponen Tertentu ke Breadboard
    const installComponent = (compType, silent = false) => {
      if (!installedState.hasOwnProperty(compType)) return;

      installedState[compType] = true;

      // Update Visual SVG Komponen (Tampilkan)
      const compVisual = document.getElementById(`comp-${compType}`);
      if (compVisual) {
        compVisual.classList.remove("comp-hidden");
        compVisual.classList.add("comp-visible");
      }

      // Update Soket Dropzone (Tandai terisi)
      const slotEl = document.getElementById(`slot-${compType}`);
      if (slotEl) {
        slotEl.classList.add("slot-filled");
      }

      // Update Kartu di Kotak Komponen Tray
      const dragItem = document.getElementById(`drag-${compType}`);
      if (dragItem) {
        dragItem.classList.add("is-installed");
        const badge = dragItem.querySelector(".drag-status-indicator") || dragItem.querySelector(".drag-status-badge");
        if (badge) badge.textContent = "✅ Terpasang";
      }

      updateCircuitStatusUI();

      if (!silent) {
        AudioManager.playSnap();
        renderComponentDetail(compType);
        RoboKidsApp.showToast(`✅ ${componentsData[compType].name} berhasil dipasang!`, "success");
      }
    };

    // Lepas Komponen dari Breadboard
    const uninstallComponent = (compType, silent = false) => {
      if (!installedState.hasOwnProperty(compType)) return;

      installedState[compType] = false;

      // Sembunyikan Visual SVG Komponen
      const compVisual = document.getElementById(`comp-${compType}`);
      if (compVisual) {
        compVisual.classList.remove("comp-visible");
        compVisual.classList.add("comp-hidden");
      }

      // Kembalikan Soket Dropzone
      const slotEl = document.getElementById(`slot-${compType}`);
      if (slotEl) {
        slotEl.classList.remove("slot-filled");
      }

      // Kembalikan Kartu di Kotak Komponen Tray
      const dragItem = document.getElementById(`drag-${compType}`);
      if (dragItem) {
        dragItem.classList.remove("is-installed");
        const badge = dragItem.querySelector(".drag-status-indicator") || dragItem.querySelector(".drag-status-badge");
        if (badge) badge.textContent = "Siap Pasang";
      }

      updateCircuitStatusUI();

      if (!silent) {
        RoboKidsApp.showToast(`Komponen dilepas dari sirkuit.`, "info");
      }
    };

    // Update Tampilan Pill Status Kelengkapan Sirkuit di Header Panel & Kotak Komponen
    const updateCircuitStatusUI = () => {
      const total = Object.keys(installedState).length;
      const count = Object.values(installedState).filter(Boolean).length;
      const pill = document.getElementById("circuitStatusPill");
      const trayBadge = document.getElementById("trayCountBadge");

      if (trayBadge) {
        trayBadge.textContent = `${count} / ${total} Terpasang`;
        trayBadge.classList.toggle("badge-complete", count === total);
      }

      if (!pill) return;

      if (count === total) {
        pill.className = "status-pill status-pill-active";
        pill.textContent = `🟢 Sirkuit Siap & Berdaya ⚡ (${count}/${total})`;
      } else if (count > 0) {
        pill.className = "status-pill status-pill-warning";
        pill.textContent = `🟡 Sirkuit Belum Lengkap (${count}/${total})`;
      } else {
        pill.className = "status-pill status-pill-danger";
        pill.textContent = `🔴 Sirkuit Terputus (${count}/${total})`;
      }
    };

    // Validasi Keberadaan & Kelengkapan Sirkuit Listrik
    const validateCircuit = () => {
      if (!installedState["battery"]) {
        return { isValid: false, reason: "Baterai 9V belum terpasang! Tidak ada sumber daya listrik.", missing: "battery" };
      }
      if (!installedState["wire-vcc"]) {
        return { isValid: false, reason: "Kabel daya VCC (+5V) belum terhubung ke rel sirkuit.", missing: "wire-vcc" };
      }
      if (!installedState["wire-gpio"]) {
        return { isValid: false, reason: "Kabel sinyal GPIO 9 belum menghubungkan otak robot ke resistor.", missing: "wire-gpio" };
      }
      if (!installedState["resistor"]) {
        return { isValid: false, reason: "Resistor 1kΩ belum terpasang! Arus listrik terputus.", missing: "resistor" };
      }
      if (!installedState["buzzer"]) {
        return { isValid: false, reason: "Piezo Buzzer belum dipasang pada soket breadboard.", missing: "buzzer" };
      }
      if (!installedState["wire-gnd"]) {
        return { isValid: false, reason: "Kabel GND (Arde) belum terpasang. Sirkuit tidak tertutup (arus listrik tidak bisa mengalir).", missing: "wire-gnd" };
      }
      return { isValid: true };
    };

    // Animasi Peringatan Merah Berkedip pada Panel Hardware
    const flashIncompleteWarning = () => {
      const panel = document.getElementById("hardwarePanel");
      if (panel) {
        panel.classList.add("circuit-warning-flash");
        setTimeout(() => panel.classList.remove("circuit-warning-flash"), 1200);
      }
    };

    // Update Tampilan Panel Inspektor di Sisi Kiri
    const renderComponentDetail = (key) => {
      const data = componentsData[key];
      if (!data) return;

      activeCompKey = key;

      const cardIcon = document.getElementById("cardIcon");
      const cardTitle = document.getElementById("cardTitle");
      const cardCategory = document.getElementById("cardCategory");
      const cardDescription = document.getElementById("cardDescription");
      const cardAnalogy = document.getElementById("cardAnalogy");
      const btnTestBuzzer = document.getElementById("btnTestBuzzerDirect");

      if (cardIcon) cardIcon.textContent = data.icon;
      if (cardTitle) cardTitle.textContent = data.name;
      if (cardCategory) cardCategory.textContent = data.category;
      if (cardDescription) cardDescription.innerHTML = data.description;
      if (cardAnalogy) cardAnalogy.innerHTML = data.analogy;

      if (btnTestBuzzer) {
        btnTestBuzzer.style.display = data.hasTestBtn ? "inline-block" : "none";
      }

      // Berikan highlight aktif pada elemen SVG jika sedang terpasang
      document.querySelectorAll(".circuit-interactive").forEach(el => {
        el.classList.remove("is-active");
      });
      const activeSvg = document.getElementById(`comp-${key}`);
      if (activeSvg && !activeSvg.classList.contains("comp-hidden")) {
        activeSvg.classList.add("is-active");
      }

      // Update status tombol chip selektor cepat
      document.querySelectorAll(".chip-btn").forEach(chip => {
        chip.classList.toggle("active", chip.getAttribute("data-target") === key);
      });
    };

    // Memicu Animasi Gelombang Suara Buzzer pada SVG
    const triggerBuzzerVisual = () => {
      const waves = document.getElementById("buzzerSoundWaves");
      if (waves) {
        waves.classList.remove("sound-wave-hidden");
        waves.classList.add("sound-wave-active");
        setTimeout(() => {
          waves.classList.remove("sound-wave-active");
          waves.classList.add("sound-wave-hidden");
        }, 800);
      }
    };

    // Setup Seluruh Event Listener Interaktivitas & Drag and Drop
    const setupListeners = () => {
      const tooltip = document.getElementById("circuitTooltip");
      const breadboardContainer = document.getElementById("breadboardDropContainer") || document.querySelector(".breadboard-container");

      // ==========================================
      // 1. EVENT DRAG AND DROP DARI KOTAK KOMPONEN
      // ==========================================
      const draggableCards = document.querySelectorAll(".draggable-comp");
      draggableCards.forEach(card => {
        const compType = card.getAttribute("data-type");

        // Drag Start
        card.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", compType);
          e.dataTransfer.effectAllowed = "copyMove";
          card.classList.add("is-dragging");
        });

        // Drag End
        card.addEventListener("dragend", () => {
          card.classList.remove("is-dragging");
          document.querySelectorAll(".circuit-dropzone").forEach(slot => {
            slot.classList.remove("dropzone-hover");
          });
        });

        // Click-to-Place (Kemudahan akses tablet/klik cepat)
        card.addEventListener("click", () => {
          if (!installedState[compType]) {
            installComponent(compType);
          } else {
            renderComponentDetail(compType);
            RoboKidsApp.showToast(`${componentsData[compType].name} sudah terpasang di breadboard.`, "info");
          }
        });
      });

      // ==========================================
      // 2. EVENT SOKET DROPZONE PADA BREADBOARD (SVG)
      // ==========================================
      const dropzones = document.querySelectorAll(".circuit-dropzone");
      dropzones.forEach(slot => {
        const targetSlot = slot.getAttribute("data-slot");

        slot.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          slot.classList.add("dropzone-hover");
        });

        slot.addEventListener("dragleave", () => {
          slot.classList.remove("dropzone-hover");
        });

        slot.addEventListener("drop", (e) => {
          e.preventDefault();
          slot.classList.remove("dropzone-hover");
          const draggedCompType = e.dataTransfer.getData("text/plain");

          if (!draggedCompType) return;

          // Cek apakah komponen sesuai dengan soket target
          if (draggedCompType === targetSlot) {
            installComponent(draggedCompType);
          } else {
            // Rejection: Komponen salah soket!
            AudioManager.playError();
            slot.classList.add("dropzone-shake");
            setTimeout(() => slot.classList.remove("dropzone-shake"), 400);

            const wrongName = componentsData[draggedCompType] ? componentsData[draggedCompType].name : "Komponen";
            const slotName = componentsData[targetSlot] ? componentsData[targetSlot].name : "soket ini";
            RoboKidsApp.showToast(`⚠️ Salah tempat! ${wrongName} tidak dapat dipasang pada soket ${slotName}!`, "error");
          }
        });

        // Klik soket kosong untuk memasang langsung komponen yang cocok
        slot.addEventListener("click", () => {
          if (!installedState[targetSlot]) {
            installComponent(targetSlot);
          }
        });
      });

      // ==========================================
      // 3. EVENT ELEMEN KOMPONEN TERPASANG (SVG)
      // ==========================================
      const interactiveElements = document.querySelectorAll(".circuit-interactive");
      interactiveElements.forEach(el => {
        const compId = el.getAttribute("data-component");

        el.addEventListener("click", () => {
          renderComponentDetail(compId);
          if (compId === "buzzer") {
            const check = validateCircuit();
            if (check.isValid) {
              AudioManager.playBuzzer();
              triggerBuzzerVisual();
            } else {
              AudioManager.playDud();
              flashIncompleteWarning();
              RoboKidsApp.showToast(`❌ Buzzer tidak dapat berbunyi! ${check.reason}`, "error");
            }
          }
        });

        el.addEventListener("mouseenter", () => {
          renderComponentDetail(compId);
          if (tooltip && componentsData[compId]) {
            tooltip.textContent = `${componentsData[compId].icon} ${componentsData[compId].name}`;
            tooltip.style.display = "block";
          }
        });

        el.addEventListener("mousemove", (e) => {
          if (tooltip && breadboardContainer) {
            const rect = breadboardContainer.getBoundingClientRect();
            const posX = e.clientX - rect.left;
            const posY = e.clientY - rect.top;
            tooltip.style.left = `${posX}px`;
            tooltip.style.top = `${posY}px`;
          }
        });

        el.addEventListener("mouseleave", () => {
          if (tooltip) {
            tooltip.style.display = "none";
          }
        });
      });

      // ==========================================
      // 4. TOMBOL PINTAS TRAY: RAKIT OTOMATIS & BONGKAR
      // ==========================================
      const btnAutoWire = document.getElementById("btnAutoWire");
      if (btnAutoWire) {
        btnAutoWire.addEventListener("click", () => {
          Object.keys(installedState).forEach(k => installComponent(k, true));
          AudioManager.playVictory();
          updateCircuitStatusUI();
          renderComponentDetail("battery");
          RoboKidsApp.showToast("⚡ Seluruh sirkuit berhasil dirakit otomatis!", "success");
        });
      }

      const btnResetCircuit = document.getElementById("btnResetCircuit");
      if (btnResetCircuit) {
        btnResetCircuit.addEventListener("click", () => {
          Object.keys(installedState).forEach(k => uninstallComponent(k, true));
          AudioManager.playDud();
          updateCircuitStatusUI();
          renderComponentDetail("resistor");
          RoboKidsApp.showToast("Sirkuit dikosongkan. Silakan rakit kembali komponenmu!", "info");
        });
      }

      // Tombol chip navigasi cepat
      const chips = document.querySelectorAll(".chip-btn");
      chips.forEach(chip => {
        chip.addEventListener("click", () => {
          const target = chip.getAttribute("data-target");
          renderComponentDetail(target);
          if (target === "buzzer") {
            const check = validateCircuit();
            if (check.isValid) {
              AudioManager.playBuzzer();
              triggerBuzzerVisual();
            } else {
              AudioManager.playDud();
              flashIncompleteWarning();
              RoboKidsApp.showToast(`❌ Buzzer tidak dapat berbunyi! ${check.reason}`, "error");
            }
          }
        });
      });

      // Tombol tes langsung bunyi buzzer
      const btnTestBuzzer = document.getElementById("btnTestBuzzerDirect");
      if (btnTestBuzzer) {
        btnTestBuzzer.addEventListener("click", () => {
          const check = validateCircuit();
          if (check.isValid) {
            AudioManager.playBuzzer();
            triggerBuzzerVisual();
            RoboKidsApp.showToast("Buzzer berbunyi: BEEP! 📢", "success");
          } else {
            AudioManager.playDud();
            flashIncompleteWarning();
            RoboKidsApp.showToast(`❌ Buzzer tidak dapat berbunyi! ${check.reason}`, "error");
          }
        });
      }
    };

    return {
      init() {
        setupListeners();
        updateCircuitStatusUI();
        // Default tampilkan penjelasan baterai atau resistor
        renderComponentDetail("battery");
      },
      installComponent,
      uninstallComponent,
      validateCircuit,
      flashIncompleteWarning,
      triggerBuzzerEffect() {
        triggerBuzzerVisual();
      }
    };
  })();

  // ============================================================================
  // MODUL 3: ARENA SIMULATOR ROBOT & SKENARIO MISI (GRID 8x8)
  // Menangani status koordinat robot, pergerakan, rintangan, dan target peti.
  // ============================================================================
  const Simulator = (() => {
    const GRID_SIZE = 8; // 8 x 8 kotak

    // Posisi Awal Robot
    const START_POS = { x: 1, y: 1, dir: 1 }; // x=1, y=1 (indeks 0-7), dir: 1 (Timur/East)
    
    // Titik Tujuan Misi (Peti Harta Karun Kristal)
    const GOAL_POS = { x: 5, y: 4 };

    // Daftar Koordinat Rintangan (Pulau Bebatuan & Kubangan Air di Tengah Grid)
    const OBSTACLES = [
      { x: 2, y: 2, icon: "🪨" },
      { x: 3, y: 2, icon: "🪨" },
      { x: 2, y: 3, icon: "💧" },
      { x: 3, y: 3, icon: "💧" }
    ];

    // Arah Kompas: 0: Utara (North), 1: Timur (East), 2: Selatan (South), 3: Barat (West)
    const DIRECTIONS = [
      { name: "Utara ☝️", angle: 270, dx: 0, dy: -1 },
      { name: "Timur 👉", angle: 0,   dx: 1, dy: 0 },
      { name: "Selatan 👇", angle: 90,  dx: 0, dy: 1 },
      { name: "Barat 👈", angle: 180, dx: -1, dy: 0 }
    ];

    // State Robot Saat Ini
    let robotState = {
      x: START_POS.x,
      y: START_POS.y,
      dirIndex: START_POS.dir, // Mulai hadap Timur
      hasBuzzedAtGoal: false,
      isRunning: false
    };

    let robotEl = null;

    // Render Struktur Grid Map 8x8 ke dalam DOM
    const buildGrid = () => {
      const gridContainer = document.getElementById("gridBoard");
      if (!gridContainer) return;
      gridContainer.innerHTML = "";

      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const tile = document.createElement("div");
          tile.className = "grid-tile";
          tile.id = `tile-${x}-${y}`;
          tile.dataset.x = x;
          tile.dataset.y = y;

          // Cek apakah ini titik Start
          if (x === START_POS.x && y === START_POS.y) {
            tile.classList.add("tile-start");
            tile.innerHTML = `<span title="Posisi Awal Robot">🚩</span>`;
          }
          // Cek apakah ini titik Goal Peti Harta Karun
          else if (x === GOAL_POS.x && y === GOAL_POS.y) {
            tile.classList.add("tile-goal");
            tile.innerHTML = `<span title="Objective: Peti Harta Karun Kristal" class="goal-icon">💎</span>`;
          }
          // Cek apakah ada rintangan
          else {
            const obs = OBSTACLES.find(o => o.x === x && o.y === y);
            if (obs) {
              tile.classList.add("tile-obstacle");
              tile.innerHTML = `<span title="Rintangan">${obs.icon}</span>`;
            }
          }

          // Tambahkan label koordinat kecil (1-8) untuk edukasi spasial anak
          const coordLabel = document.createElement("span");
          coordLabel.className = "tile-coord";
          coordLabel.textContent = `${x + 1},${y + 1}`;
          tile.appendChild(coordLabel);

          gridContainer.appendChild(tile);
        }
      }

      // Buat Elemen Karakter Robot Virtual (SVG)
      createRobotElement(gridContainer);
      updateRobotDOM();
      updateHUD();
    };

    // Pembuatan Karakter Robot Ceria (Robo-Bot)
    const createRobotElement = (parent) => {
      robotEl = document.createElement("div");
      robotEl.className = "robot-character";
      robotEl.id = "robotCharacter";

      robotEl.innerHTML = `
        <div class="robot-svg-wrapper" id="robotSvgWrapper">
          <svg viewBox="0 0 40 40" width="100%" height="100%">
            <!-- Badan Robot -->
            <rect x="7" y="9" width="26" height="23" rx="6" fill="#4f46e5" stroke="#312e81" stroke-width="2"/>
            <!-- Layar Kaca Wajah -->
            <rect x="11" y="13" width="18" height="12" rx="3" fill="#0f172a"/>
            <!-- Dua Mata LED Ceria -->
            <circle cx="16" cy="18" r="2.5" fill="#38bdf8"/>
            <circle cx="24" cy="18" r="2.5" fill="#38bdf8"/>
            <!-- Senyuman LED Robot -->
            <path d="M16 22 Q20 25 24 22" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <!-- Antena Sinyal -->
            <line x1="20" y1="9" x2="20" y2="3" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
            <circle cx="20" cy="3" r="2.5" fill="#ef4444"/>
            <!-- Panah Arah Hadap (Moncong Robot) -->
            <polygon points="36,20 31,16 31,24" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
          </svg>
        </div>
      `;

      parent.appendChild(robotEl);
    };

    // Sinkronisasi posisi DOM robot dengan state koordinat
    const updateRobotDOM = () => {
      if (!robotEl) return;
      const tileSize = 44; // Lebar kotak grid
      const gap = 4;      // Gap grid
      const padding = 4;  // Padding kontainer

      const posX = padding + robotState.x * (tileSize + gap);
      const posY = padding + robotState.y * (tileSize + gap);

      robotEl.style.transform = `translate(${posX}px, ${posY}px)`;

      // Rotasi arah hadap robot
      const wrapper = document.getElementById("robotSvgWrapper");
      if (wrapper) {
        const targetAngle = DIRECTIONS[robotState.dirIndex].angle;
        wrapper.style.transform = `rotate(${targetAngle}deg)`;
      }
    };

    // Update Teks Informasi Status HUD
    const updateHUD = (customStatus, statusClass = "hud-badge-ready") => {
      const hudPos = document.getElementById("hudPos");
      const hudDir = document.getElementById("hudDir");
      const hudStatus = document.getElementById("hudStatus");

      if (hudPos) {
        hudPos.textContent = `(${robotState.x + 1}, ${robotState.y + 1})`;
      }
      if (hudDir) {
        hudDir.textContent = DIRECTIONS[robotState.dirIndex].name;
      }
      if (hudStatus) {
        hudStatus.className = `hud-badge ${statusClass}`;
        hudStatus.textContent = customStatus || (robotState.isRunning ? "Sedang Bergerak..." : "Siap Jalan");
      }
    };

    return {
      init() {
        buildGrid();
      },

      reset() {
        robotState.x = START_POS.x;
        robotState.y = START_POS.y;
        robotState.dirIndex = START_POS.dir;
        robotState.hasBuzzedAtGoal = false;
        robotState.isRunning = false;

        updateRobotDOM();
        updateHUD("Siap Jalan", "hud-badge-ready");
      },

      getState() {
        return { ...robotState };
      },

      setRunning(val) {
        robotState.isRunning = val;
        updateHUD(val ? "Menjalankan Kode..." : "Selesai", val ? "hud-badge-moving" : "hud-badge-ready");
      },

      // Perintah 1: Maju Sebanyak N Langkah
      async moveForward(steps = 1) {
        const dir = DIRECTIONS[robotState.dirIndex];

        for (let s = 0; s < steps; s++) {
          const nextX = robotState.x + dir.dx;
          const nextY = robotState.y + dir.dy;

          // Cek Batas Arena (Keluar Grid)
          if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
            AudioManager.playBump();
            updateHUD("Menabrak Tembok!", "hud-badge-crash");
            RoboKidsApp.showToast("Ups! Robot menabrak batas arena luar!", "warning");
            throw new Error("OUT_OF_BOUNDS");
          }

          // Cek Tabrakan dengan Rintangan
          const hitObstacle = OBSTACLES.find(o => o.x === nextX && o.y === nextY);
          if (hitObstacle) {
            AudioManager.playBump();
            updateHUD("Menabrak Rintangan!", "hud-badge-crash");
            RoboKidsApp.showToast(`Aduh! Robot menabrak rintangan ${hitObstacle.icon}!`, "error");
            throw new Error("OBSTACLE_COLLISION");
          }

          // Lakukan perpindahan koordinat
          robotState.x = nextX;
          robotState.y = nextY;
          AudioManager.playStep();
          updateRobotDOM();
          updateHUD("Melangkah Maju...", "hud-badge-moving");

          // Delay halus per langkah agar anak dapat melihat animasi
          await new Promise(resolve => setTimeout(resolve, 380));
        }
      },

      // Perintah 2: Belok 90 Derajat (Kanan / Kiri)
      async turn(direction) {
        const isRight = direction.toUpperCase() === "KANAN";
        if (isRight) {
          robotState.dirIndex = (robotState.dirIndex + 1) % 4; // Putar searah jarum jam
        } else {
          robotState.dirIndex = (robotState.dirIndex + 3) % 4; // Putar berlawanan jarum jam
        }

        AudioManager.playTurn();
        updateRobotDOM();
        updateHUD(`Belok ${direction}...`, "hud-badge-moving");

        await new Promise(resolve => setTimeout(resolve, 300));
      },

      // Perintah 3: Bunyikan Buzzer
      async soundBuzzer() {
        const circuitCheck = HardwareManager.validateCircuit();
        if (!circuitCheck.isValid) {
          // KONSEKUENSI EDUKATIF: Jika pemasangan salah / belum lengkap, buzzer TIDAK BEKERJA!
          AudioManager.playDud();
          HardwareManager.flashIncompleteWarning();
          updateHUD("Buzzer Mati/Error ❌", "hud-badge-crash");
          RoboKidsApp.showToast(`❌ BUZZER TIDAK BEKERJA! ${circuitCheck.reason}`, "error");
          await new Promise(resolve => setTimeout(resolve, 800));
          return;
        }

        AudioManager.playBuzzer();
        HardwareManager.triggerBuzzerEffect();

        // Animasi getar robot saat membunyikan buzzer
        if (robotEl) {
          robotEl.classList.add("robot-beeping");
          setTimeout(() => robotEl.classList.remove("robot-beeping"), 400);
        }

        updateHUD("Buzzer Berbunyi! 📢", "hud-badge-moving");
        RoboKidsApp.showToast("Bip-Bip! GPIO 9 Mengaktifkan Buzzer!", "success");

        // Cek jika buzzer dibunyikan tepat di atas kotak Peti Harta Karun
        if (robotState.x === GOAL_POS.x && robotState.y === GOAL_POS.y) {
          robotState.hasBuzzedAtGoal = true;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      },

      // Perintah 4: Jeda Tunggu
      async wait(seconds = 1) {
        updateHUD(`Menunggu ${seconds}s...`, "hud-badge-moving");
        await new Promise(resolve => setTimeout(resolve, seconds * 1000));
      },

      // Periksa apakah kondisi menang misi terpenuhi
      checkMissionSuccess() {
        const isAtGoal = (robotState.x === GOAL_POS.x && robotState.y === GOAL_POS.y);
        const circuitCheck = HardwareManager.validateCircuit();
        return isAtGoal && robotState.hasBuzzedAtGoal && circuitCheck.isValid;
      },

      isAtGoalOnly() {
        return (robotState.x === GOAL_POS.x && robotState.y === GOAL_POS.y);
      }
    };
  })();

  // ============================================================================
  // MODUL 4: GOOGLE BLOCKLY WORKSPACE & CUSTOM BLOCKS
  // Mengintegrasikan pustaka visual programming Blockly dengan 4 blok instruksi.
  // ============================================================================
  const BlocklyManager = (() => {
    let workspace = null;

    // Registrasi 4 Blok Kustom RoboKids
    const registerCustomBlocks = () => {
      if (typeof Blockly === "undefined") {
        console.error("Google Blockly CDN belum termuat.");
        return;
      }

      // 1. BLOK MAJU: Maju N Langkah
      Blockly.Blocks['robot_maju'] = {
        init: function() {
          this.appendDummyInput()
              .appendField("🚀 Maju")
              .appendField(new Blockly.FieldDropdown([
                ["1 langkah", "1"],
                ["2 langkah", "2"],
                ["3 langkah", "3"],
                ["4 langkah", "4"],
                ["5 langkah", "5"]
              ]), "STEPS");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour("#10b981"); // Hijau Zamrud
          this.setTooltip("Menggerakkan robot ke depan sesuai jumlah langkah yang dipilih.");
        }
      };

      // 2. BLOK BELOK: Belok Kanan / Kiri 90 Derajat
      Blockly.Blocks['robot_belok'] = {
        init: function() {
          this.appendDummyInput()
              .appendField("🔄 Belok ke")
              .appendField(new Blockly.FieldDropdown([
                ["Kanan ↻ (90°)", "KANAN"],
                ["Kiri ↺ (90°)", "KIRI"]
              ]), "DIRECTION");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour("#3b82f6"); // Biru Langit
          this.setTooltip("Memutar arah pandang robot sebesar 90 derajat ke kanan atau kiri.");
        }
      };

      // 3. BLOK BUZZER: Bunyikan Buzzer Suara
      Blockly.Blocks['robot_buzzer'] = {
        init: function() {
          this.appendDummyInput()
              .appendField("🔊 Bunyikan Buzzer");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour("#ec4899"); // Merah Muda Ceria
          this.setTooltip("Mengirim sinyal logika HIGH ke GPIO 9 untuk membunyikan sirine buzzer.");
        }
      };

      // 4. BLOK TUNGGU: Beri Jeda Waktu N Detik
      Blockly.Blocks['robot_tunggu'] = {
        init: function() {
          this.appendDummyInput()
              .appendField("⏳ Tunggu")
              .appendField(new Blockly.FieldDropdown([
                ["1 detik", "1"],
                ["2 detik", "2"],
                ["3 detik", "3"]
              ]), "SECONDS");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour("#8b5cf6"); // Ungu Kreatif
          this.setTooltip("Memberi jeda waktu sejenak sebelum menjalankan instruksi berikutnya.");
        }
      };

      // Generator Kode JavaScript untuk Masing-Masing Blok
      // Mendukung Blockly v9-v11 (javascript.javascriptGenerator) maupun legacy (Blockly.JavaScript)
      const jsGen = (typeof javascript !== "undefined" && javascript.javascriptGenerator) 
                    ? javascript.javascriptGenerator 
                    : (Blockly.JavaScript || null);

      if (jsGen) {
        jsGen.forBlock = jsGen.forBlock || {};

        jsGen.forBlock['robot_maju'] = function(block) {
          const steps = block.getFieldValue('STEPS');
          return `await robot.maju(${steps});\n`;
        };

        jsGen.forBlock['robot_belok'] = function(block) {
          const dir = block.getFieldValue('DIRECTION');
          return `await robot.belok("${dir}");\n`;
        };

        jsGen.forBlock['robot_buzzer'] = function() {
          return `await robot.buzzer();\n`;
        };

        jsGen.forBlock['robot_tunggu'] = function(block) {
          const sec = block.getFieldValue('SECONDS');
          return `await robot.tunggu(${sec});\n`;
        };
      }
    };

    // Inisialisasi Area Kerja Workspace Blockly
    const initWorkspace = () => {
      const blocklyDiv = document.getElementById("blocklyDiv");
      const blocklyArea = document.getElementById("blocklyArea");
      if (!blocklyDiv) return;

      if (typeof Blockly === "undefined") {
        blocklyDiv.innerHTML = `
          <div style="padding: 30px; text-align: center; color: #64748b; font-family: var(--font-heading);">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🌐</div>
            <h3 style="color: #4f46e5; margin-bottom: 8px;">Memuat Google Blockly...</h3>
            <p style="font-size: 0.9rem; max-width: 380px; margin: 0 auto; line-height: 1.5;">
              Pustaka Blockly dimuat via CDN resmi. Pastikan perangkat Anda terhubung ke internet untuk pertama kali, lalu refresh halaman ini.
            </p>
          </div>
        `;
        return;
      }

      // Definisi Toolbox XML
      const toolboxXml = `
        <xml id="toolbox" style="display: none">
          <category name="Gerakan Robot" colour="#10b981">
            <block type="robot_maju">
              <field name="STEPS">1</field>
            </block>
            <block type="robot_belok">
              <field name="DIRECTION">KANAN</field>
            </block>
          </category>
          <category name="Suara & Waktu" colour="#ec4899">
            <block type="robot_buzzer"></block>
            <block type="robot_tunggu">
              <field name="SECONDS">1</field>
            </block>
          </category>
        </xml>
      `;

      // Masukkan XML ke DOM jika belum ada
      let toolboxElement = document.getElementById("toolbox");
      if (!toolboxElement) {
        const div = document.createElement("div");
        div.innerHTML = toolboxXml;
        document.body.appendChild(div.firstElementChild);
        toolboxElement = document.getElementById("toolbox");
      }

      // Konfigurasi Injeksi Blockly
      workspace = Blockly.inject(blocklyDiv, {
        toolbox: toolboxElement,
        scrollbars: true,
        trashcan: true,
        sounds: false,
        renderer: "zelos", // Gaya rounded ramah anak ala Scratch
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.05,
          maxScale: 2.0,
          minScale: 0.6,
          scaleSpeed: 1.2
        },
        grid: {
          spacing: 20,
          length: 2,
          colour: "#cbd5e1",
          snap: true
        }
      });

      // Sinkronisasi ukuran saat resize jendela
      const onResize = () => {
        if (blocklyArea && blocklyDiv && workspace) {
          Blockly.svgResize(workspace);
        }
      };
      window.addEventListener("resize", onResize);
      setTimeout(onResize, 100);

      // Event listener perubahan workspace untuk update preview kode JavaScript
      workspace.addChangeListener(() => {
        updateJsCodePreview();
      });
    };

    // Update Teks Drawer Preview Kode JavaScript Asli
    const updateJsCodePreview = () => {
      const codeContainer = document.getElementById("generatedJsCode");
      if (!codeContainer || !workspace) return;

      const jsGen = (typeof javascript !== "undefined" && javascript.javascriptGenerator) 
                    ? javascript.javascriptGenerator 
                    : (Blockly.JavaScript || null);

      if (jsGen && typeof jsGen.workspaceToCode === "function") {
        try {
          const code = jsGen.workspaceToCode(workspace);
          codeContainer.textContent = code.trim().length > 0 ? code : "// Susun blok di atas untuk melihat kode JavaScript di sini...";
        } catch (e) {
          codeContainer.textContent = "// Kode sedang disinkronkan...";
        }
      }
    };

    return {
      init() {
        registerCustomBlocks();
        initWorkspace();
      },

      getWorkspace() {
        return workspace;
      },

      // Mengekstrak urutan instruksi blok secara terstruktur
      extractActionSequence() {
        if (!workspace) return [];

        const actions = [];
        const topBlocks = workspace.getTopBlocks(true);
        if (topBlocks.length === 0) return actions;

        // Cari tumpukan blok dengan jumlah instruksi terpanjang
        let bestTopBlock = topBlocks[0];
        let maxCount = 0;

        for (const tb of topBlocks) {
          let count = 0;
          let curr = tb;
          while (curr) {
            count++;
            curr = curr.getNextBlock();
          }
          if (count > maxCount) {
            maxCount = count;
            bestTopBlock = tb;
          }
        }

        let currentBlock = bestTopBlock;

        while (currentBlock) {
          const type = currentBlock.type;
          const id = currentBlock.id;

          if (type === "robot_maju") {
            const steps = parseInt(currentBlock.getFieldValue("STEPS") || "1", 10);
            actions.push({ type: "MAJU", steps, blockId: id });
          } else if (type === "robot_belok") {
            const dir = currentBlock.getFieldValue("DIRECTION") || "KANAN";
            actions.push({ type: "BELOK", direction: dir, blockId: id });
          } else if (type === "robot_buzzer") {
            actions.push({ type: "BUZZER", blockId: id });
          } else if (type === "robot_tunggu") {
            const sec = parseInt(currentBlock.getFieldValue("SECONDS") || "1", 10);
            actions.push({ type: "TUNGGU", seconds: sec, blockId: id });
          }

          currentBlock = currentBlock.getNextBlock();
        }

        return actions;
      },

      // Muat Solusi Kunci Otomatis (Demo Hackathon)
      loadSolutionHint() {
        if (!workspace) return;
        workspace.clear();

        // Rute Menang yang Elegan:
        // Dari (1,1) Hadap Timur:
        // 1. Maju 3 langkah -> sampai (4,1)
        // 2. Belok Kanan 90° -> hadap Selatan
        // 3. Maju 3 langkah -> sampai (4,4)
        // 4. Belok Kiri 90° -> hadap Timur
        // 5. Maju 1 langkah -> sampai (5,4) [Peti Kristal]
        // 6. Bunyikan Buzzer! -> Sirine Kemenangan

        Blockly.Events.disable();

        const b1 = workspace.newBlock('robot_maju');
        b1.setFieldValue('3', 'STEPS');
        b1.initSvg();
        b1.render();
        b1.moveBy(50, 40);

        const b2 = workspace.newBlock('robot_belok');
        b2.setFieldValue('KANAN', 'DIRECTION');
        b2.initSvg();
        b2.render();
        b1.nextConnection.connect(b2.previousConnection);

        const b3 = workspace.newBlock('robot_maju');
        b3.setFieldValue('3', 'STEPS');
        b3.initSvg();
        b3.render();
        b2.nextConnection.connect(b3.previousConnection);

        const b4 = workspace.newBlock('robot_belok');
        b4.setFieldValue('KIRI', 'DIRECTION');
        b4.initSvg();
        b4.render();
        b3.nextConnection.connect(b4.previousConnection);

        const b5 = workspace.newBlock('robot_maju');
        b5.setFieldValue('1', 'STEPS');
        b5.initSvg();
        b5.render();
        b4.nextConnection.connect(b5.previousConnection);

        const b6 = workspace.newBlock('robot_buzzer');
        b6.initSvg();
        b6.render();
        b5.nextConnection.connect(b6.previousConnection);

        if (typeof workspace.cleanUp === "function") {
          workspace.cleanUp();
        }

        Blockly.Events.enable();
        updateJsCodePreview();
        RoboKidsApp.showToast("💡 Solusi Misi berhasil dimuat ke workspace!", "success");
      },

      clear() {
        if (workspace) {
          workspace.clear();
          updateJsCodePreview();
        }
      },

      highlightBlock(id) {
        if (workspace && typeof workspace.highlightBlock === "function") {
          workspace.highlightBlock(id);
        }
      }
    };
  })();

  // ============================================================================
  // MODUL 5: ENGINE EKSEKUSI PROGRAM ROBOT (STEP-BY-STEP RUNNER)
  // Menjalankan instruksi secara asynchronous berurutan, sinkronisasi UI & Audio.
  // ============================================================================
  const ExecutionEngine = (() => {
    let isExecuting = false;

    return {
      async run() {
        if (isExecuting) return;

        const actions = BlocklyManager.extractActionSequence();
        if (actions.length === 0) {
          RoboKidsApp.showToast("⚠️ Tarik minimal satu blok perintah ke area kerja!", "warning");
          return;
        }

        isExecuting = true;
        Simulator.setRunning(true);
        const btnRun = document.getElementById("btnRunCode");
        if (btnRun) {
          btnRun.disabled = true;
          btnRun.style.opacity = "0.7";
        }

        try {
          for (let i = 0; i < actions.length; i++) {
            const act = actions[i];

            // Berikan highlight visual pada blok yang sedang aktif berjalan
            BlocklyManager.highlightBlock(act.blockId);

            switch (act.type) {
              case "MAJU":
                await Simulator.moveForward(act.steps);
                break;
              case "BELOK":
                await Simulator.turn(act.direction);
                break;
              case "BUZZER":
                await Simulator.soundBuzzer();
                break;
              case "TUNGGU":
                await Simulator.wait(act.seconds);
                break;
            }
          }

          // Matikan highlight setelah selesai
          BlocklyManager.highlightBlock(null);

          // Cek Apakah Misi Berhasil Sempurna
          if (Simulator.checkMissionSuccess()) {
            AudioManager.playVictory();
            RoboKidsApp.openSuccessModal();
          } else if (Simulator.isAtGoalOnly()) {
            const circuitCheck = HardwareManager.validateCircuit();
            if (!circuitCheck.isValid) {
              RoboKidsApp.showToast(`⚠️ Robot telah mencapai Peti Kristal, tetapi Buzzer TIDAK BEKERJA karena sirkuit belum dirakit! Pasang komponen di panel kiri.`, "error");
              HardwareManager.flashIncompleteWarning();
            } else if (!Simulator.getState().hasBuzzedAtGoal) {
              RoboKidsApp.showToast("⚠️ Kamu sudah sampai di Peti Kristal, tetapi lupa membunyikan Buzzer! Tambahkan blok 'Bunyikan Buzzer'.", "warning");
            }
          } else {
            RoboKidsApp.showToast("Robot berhenti. Belum mencapai Peti Harta Karun. Coba sesuaikan langkahmu!", "warning");
          }

        } catch (err) {
          console.warn("Eksekusi dihentikan:", err.message);
          BlocklyManager.highlightBlock(null);
        } finally {
          isExecuting = false;
          Simulator.setRunning(false);
          if (btnRun) {
            btnRun.disabled = false;
            btnRun.style.opacity = "1";
          }
        }
      }
    };
  })();

  // ============================================================================
  // MODUL 6: TOAST & MODAL DIALOG MANAGER
  // ============================================================================
  const UIController = (() => {
    const showToast = (message, type = "info") => {
      const container = document.getElementById("toastContainer");
      if (!container) return;

      const toast = document.createElement("div");
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `<span>${message}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    };

    // Partikel Confetti Kemenangan Sederhana (Murni Canvas/DOM)
    const triggerConfetti = () => {
      const container = document.getElementById("confettiContainer");
      if (!container) return;
      container.innerHTML = "";

      const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"];
      for (let i = 0; i < 40; i++) {
        const conf = document.createElement("div");
        conf.style.position = "absolute";
        conf.style.width = `${Math.random() * 10 + 6}px`;
        conf.style.height = `${Math.random() * 8 + 4}px`;
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = `${Math.random() * 100}%`;
        conf.style.top = "-10px";
        conf.style.borderRadius = "2px";
        conf.style.transform = `rotate(${Math.random() * 360}deg)`;
        conf.style.animation = `confettiFall ${Math.random() * 2 + 1.5}s ease-in forwards`;
        container.appendChild(conf);
      }
    };

    const setupUIEvents = () => {
      // Tombol Audio Mute/Unmute
      const btnAudio = document.getElementById("btnAudioToggle");
      const audioIcon = document.getElementById("audioIcon");
      if (btnAudio) {
        btnAudio.addEventListener("click", () => {
          const muted = AudioManager.toggleMute();
          if (audioIcon) audioIcon.textContent = muted ? "🔇" : "🔊";
          const label = btnAudio.querySelector(".btn-label");
          if (label) label.textContent = muted ? "Suara: OFF" : "Suara: ON";
          showToast(muted ? "Suara dimatikan" : "Suara dinyalakan", "info");
        });
      }

      // Tombol Jalankan RUN
      const btnRun = document.getElementById("btnRunCode");
      if (btnRun) {
        btnRun.addEventListener("click", () => {
          ExecutionEngine.run();
        });
      }

      // Tombol Reset Posisi
      const btnReset = document.getElementById("btnResetSim");
      if (btnReset) {
        btnReset.addEventListener("click", () => {
          Simulator.reset();
          BlocklyManager.highlightBlock(null);
          showToast("Posisi robot dikembalikan ke titik awal 🚩", "info");
        });
      }

      // Tombol Solusi Kunci
      const btnHint = document.getElementById("btnLoadHint");
      if (btnHint) {
        btnHint.addEventListener("click", () => {
          BlocklyManager.loadSolutionHint();
        });
      }

      // Tombol Hapus Semua Blok
      const btnClear = document.getElementById("btnClearWorkspace");
      if (btnClear) {
        btnClear.addEventListener("click", () => {
          if (confirm("Apakah kamu ingin menghapus semua blok di area kerja?")) {
            BlocklyManager.clear();
            showToast("Area kerja telah dibersihkan 🗑️", "info");
          }
        });
      }

      // Modal Bantuan
      const btnHelp = document.getElementById("btnHelp");
      const helpModal = document.getElementById("helpModal");
      const btnCloseHelp = document.getElementById("btnCloseHelp");
      if (btnHelp && helpModal) {
        btnHelp.addEventListener("click", () => helpModal.classList.add("is-open"));
      }
      if (btnCloseHelp && helpModal) {
        btnCloseHelp.addEventListener("click", () => helpModal.classList.remove("is-open"));
      }

      // Modal Perayaan Sukses
      const successModal = document.getElementById("successModal");
      const btnPlayAgain = document.getElementById("btnModalPlayAgain");
      if (btnPlayAgain && successModal) {
        btnPlayAgain.addEventListener("click", () => {
          successModal.classList.remove("is-open");
          Simulator.reset();
        });
      }
    };

    return {
      init() {
        setupUIEvents();
      },
      showToast,
      openSuccessModal() {
        const successModal = document.getElementById("successModal");
        if (successModal) {
          successModal.classList.add("is-open");
          triggerConfetti();
        }
      }
    };
  })();

  // ============================================================================
  // MODUL 7: RESIZABLE TABS & SPLIT VIEW CONTROLLER
  // Mengatur draggable divider untuk memperbesar/memperkecil panel kiri-kanan & atas-bawah.
  // ============================================================================
  const ResizerController = (() => {
    let isDraggingH = false;
    let isDraggingV = false;

    const setupResizers = () => {
      const mainResizer = document.getElementById("mainResizer");
      const simResizer = document.getElementById("simResizer");
      const mainContainer = document.querySelector(".main-container");
      const simulatorWrapper = document.getElementById("simulatorWrapper");
      const codingPanel = document.getElementById("codingPanel");

      // ----------------------------------------------------
      // 1. HORIZONTAL RESIZER (PANEL KIRI VS PANEL KANAN)
      // ----------------------------------------------------
      if (mainResizer && mainContainer) {
        const startDragH = (e) => {
          if (window.innerWidth <= 992) return;
          isDraggingH = true;
          mainResizer.classList.add("is-active");
          document.body.classList.add("resizing-active");
          e.preventDefault();
        };

        const onDragH = (e) => {
          if (!isDraggingH) return;
          const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
          const containerRect = mainContainer.getBoundingClientRect();
          const newLeftWidth = clientX - containerRect.left;

          // Batasi rentang resize: Min 340px, Max (Lebar Layar - 380px)
          const minW = 340;
          const maxW = containerRect.width - 380;

          if (newLeftWidth >= minW && newLeftWidth <= maxW) {
            mainContainer.style.gridTemplateColumns = `${newLeftWidth}px 14px 1fr`;
            const ws = BlocklyManager.getWorkspace();
            if (ws && typeof Blockly !== "undefined") {
              Blockly.svgResize(ws);
            }
          }
        };

        const stopDragH = () => {
          if (isDraggingH) {
            isDraggingH = false;
            mainResizer.classList.remove("is-active");
            document.body.classList.remove("resizing-active");
            const ws = BlocklyManager.getWorkspace();
            if (ws && typeof Blockly !== "undefined") {
              Blockly.svgResize(ws);
            }
          }
        };

        mainResizer.addEventListener("mousedown", startDragH);
        mainResizer.addEventListener("touchstart", startDragH, { passive: false });

        window.addEventListener("mousemove", onDragH);
        window.addEventListener("touchmove", onDragH, { passive: false });

        window.addEventListener("mouseup", stopDragH);
        window.addEventListener("touchend", stopDragH);
      }

      // ----------------------------------------------------
      // 2. VERTICAL RESIZER (SIMULATOR ATAS VS BLOCKLY BAWAH)
      // ----------------------------------------------------
      if (simResizer && simulatorWrapper && codingPanel) {
        const startDragV = (e) => {
          isDraggingV = true;
          simResizer.classList.add("is-active");
          document.body.classList.add("resizing-active-v");
          e.preventDefault();
        };

        const onDragV = (e) => {
          if (!isDraggingV) return;
          const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;
          const codingRect = codingPanel.getBoundingClientRect();
          const newHeight = clientY - codingRect.top;

          // Batasi tinggi simulator: Min 180px, Max 500px
          const minH = 180;
          const maxH = 500;

          if (newHeight >= minH && newHeight <= maxH) {
            simulatorWrapper.style.height = `${newHeight}px`;
            simulatorWrapper.style.flex = "none";
            const ws = BlocklyManager.getWorkspace();
            if (ws && typeof Blockly !== "undefined") {
              Blockly.svgResize(ws);
            }
          }
        };

        const stopDragV = () => {
          if (isDraggingV) {
            isDraggingV = false;
            simResizer.classList.remove("is-active");
            document.body.classList.remove("resizing-active-v");
            const ws = BlocklyManager.getWorkspace();
            if (ws && typeof Blockly !== "undefined") {
              Blockly.svgResize(ws);
            }
          }
        };

        simResizer.addEventListener("mousedown", startDragV);
        simResizer.addEventListener("touchstart", startDragV, { passive: false });

        window.addEventListener("mousemove", onDragV);
        window.addEventListener("touchmove", onDragV, { passive: false });

        window.addEventListener("mouseup", stopDragV);
        window.addEventListener("touchend", stopDragV);
      }
    };

    return {
      init() {
        setupResizers();
      }
    };
  })();

  // ============================================================================
  // INISIALISASI UTAMA
  // ============================================================================
  return {
    init() {
      HardwareManager.init();
      Simulator.init();
      BlocklyManager.init();
      UIController.init();
      ResizerController.init();
      console.log("🤖 RoboKids MVP siap dimainkan!");
    },
    showToast: UIController.showToast,
    openSuccessModal: UIController.openSuccessModal
  };
})();
