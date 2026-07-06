// SafeLife Concierge Application Controller
(function () {
  // 1. Initial State Setup
  let state = {
    activePatientId: "arthur-pendelton",
    currentView: "landing", // landing, command-center, patient-dashboard, emergency, privacy, showcase
    encryptionEnabled: false,
    role: "Caregiver", // Patient, Caregiver, Doctor, Responder
    simpleMode: false,
    textScale: "normal", // normal, large, extra-large
    highContrast: false,
    processingQuery: false,
    voiceListening: false
  };

  // Local storage keys
  const DB_KEY = "safelife_concierge_db";
  const SETTINGS_KEY = "safelife_concierge_settings";

  // Cache of patients data
  let patientsData = {};

  // Initialize DB from preloaded data if empty
  function initDatabase() {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        if (state.encryptionEnabled) {
          patientsData = decryptData(saved);
        } else {
          patientsData = JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to load database. Restoring defaults.", e);
        patientsData = JSON.parse(JSON.stringify(window.SafeLifeData.patients));
        saveDatabase();
      }
    } else {
      patientsData = JSON.parse(JSON.stringify(window.SafeLifeData.patients));
      saveDatabase();
    }
  }

  function saveDatabase() {
    let rawString = JSON.stringify(patientsData);
    if (state.encryptionEnabled) {
      let encrypted = encryptData(rawString);
      localStorage.setItem(DB_KEY, encrypted);
    } else {
      localStorage.setItem(DB_KEY, rawString);
    }
    // Also save settings
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      encryptionEnabled: state.encryptionEnabled,
      role: state.role,
      simpleMode: state.simpleMode,
      textScale: state.textScale,
      highContrast: state.highContrast,
      activePatientId: state.activePatientId
    }));
  }

  // Cryptographic simulation wrappers
  function encryptData(str) {
    // Standard mock AES output (Base64 encoding with salt indicator)
    let b64 = btoa(unescape(encodeURIComponent(str)));
    return "ENC_" + b64.split("").reverse().join("");
  }

  function decryptData(encStr) {
    if (!encStr.startsWith("ENC_")) return JSON.parse(encStr);
    let rev = encStr.substring(4).split("").reverse().join("");
    let dec = decodeURIComponent(escape(atob(rev)));
    return JSON.parse(dec);
  }

  // Get raw local storage view for security page
  function getRawStoragePreview() {
    let val = localStorage.getItem(DB_KEY) || "";
    if (val.length > 200) {
      return val.substring(0, 200) + "... [Truncated Protected Payload]";
    }
    return val;
  }

  // Dynamic metric re-calculation
  function recalculateMetrics(patientId) {
    const patient = patientsData[patientId];
    if (!patient) return;

    // Calculate Adherence
    const totalDoses = patient.medications.reduce((sum, med) => sum + Object.keys(med.takenToday).length, 0);
    const takenDoses = patient.medications.reduce((sum, med) => {
      let takenCount = 0;
      for (let timeKey in med.takenToday) {
        if (med.takenToday[timeKey]) takenCount++;
      }
      return sum + takenCount;
    }, 0);

    const baseAdherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;
    
    // Add variations based on missed logs
    let finalAdherence = Math.min(100, Math.max(50, baseAdherence));
    
    // Adjust risk score
    let riskScore = 20;
    let riskLevel = "Low";
    let riskReason = "Regular medication schedules logged. Care circle is in sync.";

    if (finalAdherence < 90) {
      riskScore = 55;
      riskLevel = "Medium";
      riskReason = "Evening medication checks have irregular patterns. Alert triggers active.";
    }
    if (finalAdherence < 70) {
      riskScore = 85;
      riskLevel = "High";
      riskReason = "Multiple doses missed in active window. Caregiver notification dispatched.";
    }

    patient.metrics.adherenceRate = finalAdherence;
    patient.metrics.riskScore = riskLevel;
    patient.metrics.riskReason = riskReason;
    
    // Adjust health timeline alerts based on missed check
    const missedMetformin = patient.medications.find(m => m.name === "Metformin" && !m.takenToday.evening);
    if (missedMetformin && !patient.healthTimeline.some(item => item.title === "Missed Evening Metformin")) {
      patient.healthTimeline.unshift({
        date: new Date().toISOString().split("T")[0],
        type: "Alert",
        title: "Missed Evening Metformin",
        details: "System flagged omission of evening dose. Reminder sent to Robert."
      });
    }
  }

  // 2. DOM Rendering Engine
  function renderView() {
    const currentPatient = patientsData[state.activePatientId];
    if (!currentPatient) return;

    recalculateMetrics(state.activePatientId);

    // Apply high contrast styling
    const bodyClass = document.body.classList;
    if (state.highContrast) {
      bodyClass.add("high-contrast");
    } else {
      bodyClass.remove("high-contrast");
    }

    // Apply text scaling
    document.body.style.fontSize = state.textScale === "large" ? "18px" : state.textScale === "extra-large" ? "20px" : "16px";

    // Handle view display toggles
    const views = ["landing", "command-center", "patient-dashboard", "emergency", "privacy", "showcase"];
    views.forEach(v => {
      const container = document.getElementById(`view-${v}`);
      if (container) {
        if (v === state.currentView) {
          container.classList.remove("hidden");
          container.classList.add("fade-in");
        } else {
          container.classList.add("hidden");
        }
      }
    });

    // Update active nav styling
    const navItems = ["landing", "command-center", "patient-dashboard", "emergency", "privacy", "showcase"];
    navItems.forEach(item => {
      const btn = document.getElementById(`nav-${item}`);
      if (btn) {
        if (item === state.currentView) {
          btn.classList.add("text-blue-600", "dark:text-blue-400", "border-b-2", "border-blue-600");
          btn.classList.remove("text-gray-500", "dark:text-gray-400");
        } else {
          btn.classList.remove("text-blue-600", "dark:text-blue-400", "border-b-2", "border-blue-600");
          btn.classList.add("text-gray-500", "dark:text-gray-400");
        }
      }
    });

    // Run custom page renderers
    if (state.currentView === "patient-dashboard") {
      renderPatientDashboard(currentPatient);
    } else if (state.currentView === "command-center") {
      renderFamilyCommandCenter();
    } else if (state.currentView === "emergency") {
      renderEmergencyCenter(currentPatient);
    } else if (state.currentView === "privacy") {
      renderPrivacyDashboard(currentPatient);
    } else if (state.currentView === "showcase") {
      renderShowcasePage();
    }
  }

  // View 1: Patient Dashboard Renderer
  function renderPatientDashboard(patient) {
    // 1. Patient Profile Info
    document.getElementById("dash-patient-name").innerText = patient.name;
    document.getElementById("dash-patient-meta").innerText = `Age: ${patient.age} • ${patient.gender} • Profile: ${patient.diagnoses.join(", ")}`;
    
    // Simple Mode Toggle Layout
    const standardDash = document.getElementById("dashboard-standard-layout");
    const simpleDash = document.getElementById("dashboard-simple-layout");
    if (state.simpleMode) {
      standardDash.classList.add("hidden");
      simpleDash.classList.remove("hidden");
      renderSimpleDashboard(patient);
      return;
    } else {
      standardDash.classList.remove("hidden");
      simpleDash.classList.add("hidden");
    }

    // 2. Today's Medications
    const medsContainer = document.getElementById("dash-meds-list");
    medsContainer.innerHTML = "";
    patient.medications.forEach(med => {
      medsContainer.appendChild(createMedicationCard(med));
    });

    // 3. Upcoming Appointments
    const apptsContainer = document.getElementById("dash-appointments-list");
    apptsContainer.innerHTML = "";
    if (patient.appointments.length === 0) {
      apptsContainer.innerHTML = `<p class="text-xs text-gray-500 italic p-3">No upcoming doctor visits.</p>`;
    } else {
      patient.appointments.forEach(appt => {
        apptsContainer.appendChild(createAppointmentCard(appt));
      });
    }

    // 4. Clinical Alerts & Impact Highlights
    const alertsContainer = document.getElementById("dash-alerts-list");
    alertsContainer.innerHTML = "";
    
    // Risk Warning Widget
    const riskClass = patient.metrics.riskScore === "High" ? "bg-red-50 dark:bg-red-950/20 border-red-200" : patient.metrics.riskScore === "Medium" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200" : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200";
    const textRiskClass = patient.metrics.riskScore === "High" ? "text-red-700 dark:text-red-400" : patient.metrics.riskScore === "Medium" ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400";
    
    alertsContainer.innerHTML = `
      <div class="border rounded-xl p-3 ${riskClass}">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider ${textRiskClass}">Clinical Risk Status</span>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold ${patient.metrics.riskScore === "High" ? "bg-red-100 text-red-800" : patient.metrics.riskScore === "Medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}">${patient.metrics.riskScore}</span>
        </div>
        <p class="text-xs font-medium mt-1 text-gray-800 dark:text-gray-200">${patient.metrics.riskReason}</p>
      </div>
    `;

    // Impact Highlights on Patient Dashboard
    const engagementScore = Math.round((patient.metrics.adherenceRate * 0.7) + (patient.metrics.completedAppointments * 2.5));
    document.getElementById("dash-adherence-percentage").innerText = `${patient.metrics.adherenceRate}%`;
    document.getElementById("dash-adherence-bar").style.width = `${patient.metrics.adherenceRate}%`;
    document.getElementById("dash-caregiver-hours").innerText = `${patient.metrics.caregiverHoursSaved}h`;
    document.getElementById("dash-risk-reduction").innerText = `-${patient.metrics.riskReduction}%`;
    document.getElementById("dash-engagement-score").innerText = `${Math.min(100, engagementScore)}/100`;

    // 5. CareCircle Task coordination
    const taskList = document.getElementById("dash-carecircle-tasks");
    taskList.innerHTML = "";
    patient.careCircle.tasks.forEach(task => {
      taskList.appendChild(createCareCircleTaskRow(task));
    });

    // 6. Family Activity & Notes Feed
    const feed = document.getElementById("dash-carecircle-feed");
    feed.innerHTML = "";
    patient.careCircle.notes.forEach(note => {
      feed.innerHTML += `
        <div class="bg-white/40 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 text-xs">
          <div class="flex justify-between font-semibold text-gray-700 dark:text-gray-300">
            <span>${note.author}</span>
            <span class="text-gray-400 font-normal">${note.date}</span>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mt-1">${note.text}</p>
        </div>
      `;
    });

    // 7. Health Activity Timeline
    const timeline = document.getElementById("dash-health-timeline");
    timeline.innerHTML = "";
    patient.healthTimeline.forEach(item => {
      const typeIcons = { Alert: "🚨", Medication: "💊", Vitals: "❤️", Lab: "🔬" };
      timeline.innerHTML += `
        <div class="flex items-start space-x-2 text-xs border-b border-gray-50 dark:border-gray-800/60 pb-2">
          <span class="bg-gray-100 dark:bg-gray-800 p-1 rounded">${typeIcons[item.type] || "📄"}</span>
          <div class="flex-1">
            <div class="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
              <span>${item.title}</span>
              <span class="text-gray-400 font-normal">${item.date}</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-0.5">${item.details}</p>
          </div>
        </div>
      `;
    });
  }

  // Simple Mode Layout for elderly patients
  function renderSimpleDashboard(patient) {
    const simpleContainer = document.getElementById("dashboard-simple-layout");
    
    // Large icons and controls
    const todayMeds = patient.medications.map(med => {
      const times = Object.keys(med.takenToday);
      const isTaken = times.every(t => med.takenToday[t]);
      return `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100">${med.name} (${med.dosage})</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">${med.instructions} at ${med.time.join(", ")}</p>
          </div>
          <button onclick="window.toggleMedTakeSimple('${med.id}')" class="px-5 py-3 rounded-lg font-bold ${isTaken ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}">
            ${isTaken ? '✓ Taken' : 'Mark Taken'}
          </button>
        </div>
      `;
    }).join("");

    const upcomingAppt = patient.appointments[0] || null;
    const apptText = upcomingAppt 
      ? `Dr. ${upcomingAppt.doctor} (${upcomingAppt.specialty}) on ${upcomingAppt.date} at ${upcomingAppt.time}` 
      : "No doctor appointments scheduled.";

    simpleContainer.innerHTML = `
      <div class="space-y-6">
        <div class="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl text-center">
          <h3 class="text-2xl font-bold text-yellow-800">Elderly Friendly Simple Mode Active</h3>
          <p class="text-sm text-yellow-700">High contrast buttons, large text, voice-assistance ready.</p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-md">
          <h2 class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">💊 My Medications Today</h2>
          <div class="space-y-3">
            ${todayMeds}
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-md">
          <h2 class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">📅 Next Doctor Visit</h2>
          <p class="text-lg text-gray-800 dark:text-gray-200 font-semibold">${apptText}</p>
        </div>

        <div class="bg-red-50 border-2 border-red-200 p-5 rounded-2xl text-center shadow-md">
          <h2 class="text-2xl font-bold text-red-800 mb-2">🚨 Emergency Help</h2>
          <button onclick="window.goToEmergencyView()" class="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-xl rounded-xl">
            Get Emergency Action Plan
          </button>
        </div>
      </div>
    `;
  }

  // Create UI component for Medication item
  function createMedicationCard(med) {
    const card = document.createElement("div");
    card.className = "bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-3 rounded-xl flex items-center justify-between";
    
    // Identify dose timings
    const timingDoses = Object.keys(med.takenToday);
    const allCompleted = timingDoses.every(t => med.takenToday[t]);

    let toggles = "";
    timingDoses.forEach(timeKey => {
      const isDoseTaken = med.takenToday[timeKey];
      const timeLabel = timeKey === "morning" ? "Morning Dose" : "Evening Dose";
      toggles += `
        <label class="inline-flex items-center space-x-1.5 cursor-pointer">
          <input type="checkbox" ${isDoseTaken ? "checked" : ""} 
                 onchange="window.toggleMedicationSession('${med.id}', '${timeKey}')"
                 class="custom-checkbox w-4.5 h-4.5 rounded text-emerald-600 border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:ring-emerald-500">
          <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">${timeLabel}</span>
        </label>
      `;
    });

    card.innerHTML = `
      <div class="flex-1">
        <div class="flex items-center space-x-2">
          <h5 class="font-bold text-gray-900 dark:text-gray-100 text-sm">${med.name} <span class="text-xs font-normal text-gray-500">(${med.dosage})</span></h5>
          ${allCompleted ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">Taken</span>' : ''}
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${med.instructions} • times: ${med.time.join(", ")}</p>
        <div class="mt-2 flex space-x-4">
          ${toggles}
        </div>
      </div>
    `;
    return card;
  }

  // Create UI component for Appointment Card
  function createAppointmentCard(appt) {
    const card = document.createElement("div");
    card.className = "bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-3 rounded-xl";
    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h5 class="font-bold text-gray-900 dark:text-gray-100 text-sm">${appt.doctor}</h5>
          <span class="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">${appt.specialty}</span>
        </div>
        <div class="text-right">
          <p class="text-xs font-bold text-blue-600 dark:text-blue-400">${appt.date}</p>
          <p class="text-[10px] text-gray-400">${appt.time}</p>
        </div>
      </div>
      <p class="text-xs text-gray-600 dark:text-gray-300 mt-2"><strong>Reason:</strong> ${appt.reason}</p>
      
      <div class="mt-2 border-t pt-2 border-gray-50 dark:border-gray-800/60">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visit Checkpoints</span>
        <ul class="text-[11px] text-gray-500 dark:text-gray-400 list-disc list-inside mt-1 space-y-0.5">
          ${appt.checklist.map(item => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    `;
    return card;
  }

  // Create CareCircle Task item
  function createCareCircleTaskRow(task) {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-gray-800/60";
    row.innerHTML = `
      <div class="flex items-center space-x-2">
        <input type="checkbox" ${task.completed ? "checked" : ""} 
               onchange="window.toggleCareCircleTask('${task.id}')"
               class="w-4 h-4 text-indigo-600 border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900 focus:ring-indigo-500">
        <span class="${task.completed ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300 font-medium"}">${task.title}</span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-[9px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">${task.assignedTo.split(" ")[0]}</span>
        <span class="text-[9px] text-gray-400">${task.dueDate}</span>
      </div>
    `;
    return row;
  }

  // View 2: Family Command Center Renderer
  function renderFamilyCommandCenter() {
    const listContainer = document.getElementById("command-relatives-list");
    listContainer.innerHTML = "";
    
    // Gather all family members
    Object.keys(patientsData).forEach(id => {
      const patient = patientsData[id];
      const riskClass = patient.metrics.riskScore === "High" ? "border-red-400 ring-2 ring-red-100 bg-red-50/20" : patient.metrics.riskScore === "Medium" ? "border-amber-400 ring-2 ring-amber-100 bg-amber-50/20" : "border-emerald-200 bg-emerald-50/10";
      
      const card = document.createElement("div");
      card.className = `border rounded-2xl p-4 transition duration-300 hover:shadow-lg ${riskClass} cursor-pointer`;
      card.onclick = () => {
        state.activePatientId = id;
        state.currentView = "patient-dashboard";
        saveDatabase();
        renderView();
      };

      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-black text-gray-900 dark:text-gray-100 text-lg">${patient.name}</h4>
            <p class="text-xs text-gray-500">Age: ${patient.age} • ${patient.diagnoses[0]}</p>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-black ${patient.metrics.riskScore === "High" ? "bg-red-100 text-red-800" : patient.metrics.riskScore === "Medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}">${patient.metrics.riskScore} Risk</span>
        </div>

        <!-- Adherence Meter -->
        <div class="mt-4">
          <div class="flex justify-between text-xs font-semibold text-gray-500 mb-1">
            <span>Medication Adherence</span>
            <span>${patient.metrics.adherenceRate}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div class="h-full rounded-full ${patient.metrics.adherenceRate > 90 ? 'bg-emerald-500' : patient.metrics.adherenceRate > 75 ? 'bg-amber-500' : 'bg-red-500'}" style="width: ${patient.metrics.adherenceRate}%"></div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
            <span class="text-[9px] text-gray-400 uppercase font-bold tracking-wider">CareCircle Tasks</span>
            <p class="font-bold text-gray-700 dark:text-gray-300 mt-0.5">${patient.careCircle.tasks.filter(t => !t.completed).length} Pending</p>
          </div>
          <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
            <span class="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Next Appointment</span>
            <p class="font-bold text-gray-700 dark:text-gray-300 mt-0.5 truncate">${patient.appointments[0] ? patient.appointments[0].doctor.split(" ").slice(-1)[0] : "None"}</p>
          </div>
        </div>

        <!-- Dynamic Timeline Alert Banner -->
        <div class="mt-3 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg text-[10px] text-gray-500 flex items-center justify-between border border-gray-100 dark:border-gray-800/60">
          <span class="truncate">Latest Action: ${patient.healthTimeline[0] ? patient.healthTimeline[0].title : "None logged"}</span>
          <span class="font-semibold text-blue-600">View →</span>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }

  // View 3: Emergency Center Renderer
  function renderEmergencyCenter(patient) {
    document.getElementById("emergency-patient-name").innerText = patient.name;
    document.getElementById("emergency-conditions").innerText = patient.criticalInfo.conditions;
    document.getElementById("emergency-allergies").innerText = patient.criticalInfo.allergies.join(", ");
    document.getElementById("emergency-blood-type").innerText = patient.criticalInfo.bloodType;
    document.getElementById("emergency-pharmacy").innerText = patient.criticalInfo.pharmacy;
    
    // Quick active meds list
    const medsList = document.getElementById("emergency-active-meds");
    medsList.innerHTML = patient.medications.map(m => `
      <div class="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-2 rounded-lg">
        <h5 class="font-bold text-red-900 dark:text-red-300 text-xs">${m.name} (${m.dosage})</h5>
        <p class="text-[10px] text-red-700 dark:text-red-400">${m.instructions}</p>
      </div>
    `).join("");

    // Contact List
    const contactsContainer = document.getElementById("emergency-contacts-list");
    contactsContainer.innerHTML = patient.careCircle.members.map(c => `
      <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-800/60 py-2">
        <div>
          <h5 class="font-bold text-sm text-gray-800 dark:text-gray-200">${c.name}</h5>
          <p class="text-xs text-gray-500">${c.relation}</p>
        </div>
        <a href="tel:${c.phone}" class="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 text-xs font-bold rounded-lg transition">${c.phone}</a>
      </div>
    `).join("");
  }

  // View 4: Privacy & Security Dashboard Renderer
  function renderPrivacyDashboard(patient) {
    document.getElementById("toggle-encryption-btn").checked = state.encryptionEnabled;
    document.getElementById("privacy-raw-db-preview").innerText = getRawStoragePreview();
    
    // Dynamic role display
    const roles = ["Patient", "Caregiver", "Doctor", "Responder"];
    const roleContainer = document.getElementById("privacy-role-selector");
    roleContainer.innerHTML = roles.map(r => `
      <button onclick="window.changeAppRole('${r}')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition ${state.role === r ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}">
        ${r}
      </button>
    `).join("");

    // Memory Facts manager
    const memoryFactsList = document.getElementById("privacy-memory-facts");
    memoryFactsList.innerHTML = "";
    patient.memories.forEach(mem => {
      const factCard = document.createElement("div");
      factCard.className = "flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs border border-gray-100 dark:border-gray-800";
      factCard.innerHTML = `
        <div class="flex-1">
          <p class="text-gray-700 dark:text-gray-300 font-medium">${mem.fact}</p>
          <span class="text-[9px] text-gray-400">Learned on ${mem.timestamp}</span>
        </div>
        <button onclick="window.deleteMemoryFact('${mem.id}')" class="text-red-500 hover:text-red-700 font-semibold ml-2">Delete ✕</button>
      `;
      memoryFactsList.appendChild(factCard);
    });
  }

  // View 5: Showcase Page Renderer ("Why SafeLife")
  function renderShowcasePage() {
    // Draws/updates the SVGs and static diagrams in showcase view if needed.
    // SVG collaboration paths are animated using dynamic classes.
  }

  // 3. User Actions Handlers (Exposed globally)
  window.changeActivePatient = function (patientId) {
    state.activePatientId = patientId;
    saveDatabase();
    renderView();
  };

  window.navigate = function (viewName) {
    state.currentView = viewName;
    saveDatabase();
    renderView();
  };

  window.toggleMedicationSession = function (medId, timeKey) {
    const patient = patientsData[state.activePatientId];
    const med = patient.medications.find(m => m.id === medId);
    if (med) {
      med.takenToday[timeKey] = !med.takenToday[timeKey];
      
      // Update health timeline when checked off
      if (med.takenToday[timeKey]) {
        patient.healthTimeline.unshift({
          date: new Date().toISOString().split("T")[0],
          type: "Medication",
          title: `Logged ${med.name} (${timeKey})`,
          details: `Patient marked ${med.name} ${med.dosage} dose as completed at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`
        });
      }
      
      saveDatabase();
      renderView();
    }
  };

  window.toggleMedTakeSimple = function (medId) {
    const patient = patientsData[state.activePatientId];
    const med = patient.medications.find(m => m.id === medId);
    if (med) {
      const times = Object.keys(med.takenToday);
      const isTaken = times.every(t => med.takenToday[t]);
      
      times.forEach(t => {
        med.takenToday[t] = !isTaken;
      });

      if (!isTaken) {
        patient.healthTimeline.unshift({
          date: new Date().toISOString().split("T")[0],
          type: "Medication",
          title: `Logged ${med.name} (All Doses)`,
          details: `Patient marked all doses of ${med.name} as completed via Simple Mode.`
        });
      }

      saveDatabase();
      renderView();
    }
  };

  window.toggleCareCircleTask = function (taskId) {
    const patient = patientsData[state.activePatientId];
    const task = patient.careCircle.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      
      // Trigger metric changes
      if (task.completed) {
        patient.metrics.caregiverHoursSaved += 2; // Simulated efficiency
        patient.metrics.completedAppointments += 1;
        patient.healthTimeline.unshift({
          date: new Date().toISOString().split("T")[0],
          type: "Vitals",
          title: `Task Completed: ${task.title}`,
          details: `Assigned task was checked off successfully.`
        });
      }
      
      saveDatabase();
      renderView();
    }
  };

  window.addCareCircleTask = function (e) {
    e.preventDefault();
    const titleInput = document.getElementById("new-task-title");
    const assignSelect = document.getElementById("new-task-assignee");
    
    if (titleInput && titleInput.value.trim()) {
      const patient = patientsData[state.activePatientId];
      const newTask = {
        id: "t_" + Date.now(),
        title: titleInput.value.trim(),
        assignedTo: assignSelect.value,
        dueDate: new Date().toISOString().split("T")[0],
        completed: false,
        category: "Caregiving"
      };
      
      patient.careCircle.tasks.push(newTask);
      titleInput.value = "";
      saveDatabase();
      renderView();
    }
  };

  window.addCareCircleNote = function (e) {
    e.preventDefault();
    const noteText = document.getElementById("new-note-text");
    if (noteText && noteText.value.trim()) {
      const patient = patientsData[state.activePatientId];
      const newNote = {
        id: "n_" + Date.now(),
        author: state.role === "Caregiver" ? patient.careCircle.owner : patient.name,
        date: new Date().toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'}),
        text: noteText.value.trim()
      };
      
      patient.careCircle.notes.unshift(newNote);
      noteText.value = "";
      saveDatabase();
      renderView();
    }
  };

  window.deleteMemoryFact = function (memId) {
    const patient = patientsData[state.activePatientId];
    patient.memories = patient.memories.filter(m => m.id !== memId);
    saveDatabase();
    renderView();
  };

  window.changeAppRole = function (role) {
    state.role = role;
    saveDatabase();
    renderView();
  };

  window.toggleDatabaseEncryption = function (el) {
    state.encryptionEnabled = el.checked;
    // Overwrite the database with encryption state changed
    saveDatabase();
    renderView();
  };

  window.changeTextScale = function (scale) {
    state.textScale = scale;
    saveDatabase();
    renderView();
  };

  window.toggleHighContrast = function () {
    state.highContrast = !state.highContrast;
    saveDatabase();
    renderView();
  };

  window.toggleSimpleMode = function () {
    state.simpleMode = !state.simpleMode;
    saveDatabase();
    renderView();
  };

  window.goToEmergencyView = function () {
    state.currentView = "emergency";
    saveDatabase();
    renderView();
  };

  // View Transitions API simulation
  window.tryDemoMode = function (patientId) {
    state.activePatientId = patientId;
    state.currentView = "patient-dashboard";
    saveDatabase();
    renderView();
  };

  // OCR Bottle Scanner Logic
  window.triggerBottleOCRUpload = function (fileInput) {
    const indicator = document.getElementById("ocr-scan-indicator");
    const progress = document.getElementById("ocr-scan-progress");
    const label = document.getElementById("ocr-scan-label");
    const resultBox = document.getElementById("ocr-scan-results");
    
    if (fileInput.files.length === 0) return;

    indicator.classList.remove("hidden");
    resultBox.classList.add("hidden");
    
    let currentPct = 0;
    label.innerText = "Analyzing prescription image...";
    
    const timer = setInterval(() => {
      currentPct += 10;
      progress.style.width = `${currentPct}%`;
      if (currentPct >= 100) {
        clearInterval(timer);
        indicator.classList.add("hidden");
        
        // Mock extracted medication details
        label.innerText = "Scanning complete!";
        
        document.getElementById("ocr-drug-name").value = "Metformin";
        document.getElementById("ocr-drug-dosage").value = "500mg";
        document.getElementById("ocr-drug-instructions").value = "Twice daily with meals";
        document.getElementById("ocr-confidence").innerText = "96% Confidence Level";
        
        resultBox.classList.remove("hidden");
      }
    }, 150);
  };

  window.saveOCRMedication = function (e) {
    e.preventDefault();
    const name = document.getElementById("ocr-drug-name").value;
    const dosage = document.getElementById("ocr-drug-dosage").value;
    const inst = document.getElementById("ocr-drug-instructions").value;

    const patient = patientsData[state.activePatientId];
    const newMed = {
      id: "m_" + Date.now(),
      name,
      dosage,
      instructions: inst,
      time: ["08:00 AM", "08:00 PM"],
      count: 60,
      takenToday: { morning: false, evening: false }
    };
    
    patient.medications.push(newMed);
    patient.healthTimeline.unshift({
      date: new Date().toISOString().split("T")[0],
      type: "Medication",
      title: `${name} Added via OCR Scanner`,
      details: `Scanned bottle details successfully logged to profile.`
    });

    // Reset upload component
    document.getElementById("ocr-scan-results").classList.add("hidden");
    document.getElementById("ocr-scan-indicator").classList.add("hidden");
    document.getElementById("ocr-file-input").value = "";

    saveDatabase();
    renderView();
  };

  // Voice Interaction Module
  let recognition;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = function () {
      state.voiceListening = true;
      document.getElementById("voice-mic-status").innerText = "Listening...";
      document.getElementById("voice-mic-pulse").classList.add("bg-red-500", "animate-ping");
      document.getElementById("voice-mic-pulse").classList.remove("bg-blue-600");
    };

    recognition.onresult = function (event) {
      const result = event.results[0][0].transcript;
      document.getElementById("chat-user-input").value = result;
      speakText(`Understood: ${result}`);
      // Auto-submit command
      window.submitAIQuery();
    };

    recognition.onerror = function (event) {
      console.error("Speech recognition error", event);
      stopVoiceListening();
    };

    recognition.onend = function () {
      stopVoiceListening();
    };
  }

  function stopVoiceListening() {
    state.voiceListening = false;
    const statusText = document.getElementById("voice-mic-status");
    const pulseDot = document.getElementById("voice-mic-pulse");
    if (statusText) statusText.innerText = "Click to talk";
    if (pulseDot) {
      pulseDot.classList.remove("bg-red-500", "animate-ping");
      pulseDot.classList.add("bg-blue-600");
    }
  }

  window.toggleVoiceInput = function () {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }
    if (state.voiceListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  function speakText(text) {
    if ('speechSynthesis' in window) {
      // Remove HTML tags for clean TTS reading
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      window.speechSynthesis.speak(utterance);
    }
  }

  // Print Visit Report Helper
  window.printReport = function (patientId) {
    const patient = patientsData[patientId];
    const reportHtml = `
      <div id="print-section" class="p-8 text-black bg-white max-w-4xl mx-auto">
        <div class="flex justify-between items-center border-b-2 border-blue-600 pb-4">
          <div>
            <h1 class="text-3xl font-bold font-display text-blue-800">SafeLife Physician Report</h1>
            <p class="text-sm text-gray-500">Concierge Track Patient summary card</p>
          </div>
          <div class="text-right">
            <h2 class="text-lg font-bold">${patient.name}</h2>
            <p class="text-xs">Age: ${patient.age} • Gender: ${patient.gender}</p>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-6">
          <div>
            <h3 class="font-bold border-b border-gray-300 pb-1 text-sm text-blue-900 uppercase">Active Diagnoses</h3>
            <ul class="list-disc list-inside text-xs mt-2 space-y-1">
              ${patient.diagnoses.map(d => `<li>${d}</li>`).join("")}
            </ul>
          </div>
          <div>
            <h3 class="font-bold border-b border-gray-300 pb-1 text-sm text-blue-900 uppercase">Allergies & Alerts</h3>
            <p class="text-xs mt-2 text-red-600 font-bold">Allergies: ${patient.criticalInfo.allergies.join(", ")}</p>
            <p class="text-xs text-gray-700">Conditions: ${patient.criticalInfo.conditions}</p>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="font-bold border-b border-gray-300 pb-1 text-sm text-blue-900 uppercase">Current Medications & Adherence</h3>
          <p class="text-xs text-gray-600 font-bold mt-1">Calculated Adherence Rate: ${patient.metrics.adherenceRate}%</p>
          <table class="w-full text-left text-xs mt-2 border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2 border">Medication</th>
                <th class="p-2 border">Dosage</th>
                <th class="p-2 border">Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${patient.medications.map(m => `
                <tr>
                  <td class="p-2 border font-bold">${m.name}</td>
                  <td class="p-2 border">${m.dosage}</td>
                  <td class="p-2 border">${m.instructions}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="mt-6">
          <h3 class="font-bold border-b border-gray-300 pb-1 text-sm text-blue-900 uppercase">Physician Checklist & Pre-Visit Logs</h3>
          <ul class="list-disc list-inside text-xs mt-2 space-y-1">
            <li>Bring weight sheets and glucose monitoring reports.</li>
            <li>List of symptoms: Blood Sugar levels stable at 134mg/dL.</li>
            <li>Verify Metformin dose scheduling modifications.</li>
          </ul>
        </div>
        
        <div class="mt-8 border-t pt-4 text-center text-[10px] text-gray-400">
          Generated automatically by SafeLife AI Concierge. Stored locally-first.
        </div>
      </div>
    `;

    // Append to page, print, and remove
    const div = document.createElement("div");
    div.innerHTML = reportHtml;
    document.body.appendChild(div);
    window.print();
    document.body.removeChild(div);
  };

  // AI Submission Trigger (Supervisor Orchestration)
  window.submitAIQuery = async function () {
    const input = document.getElementById("chat-user-input");
    if (!input || !input.value.trim() || state.processingQuery) return;

    const query = input.value.trim();
    state.processingQuery = true;
    
    // UI Loading state
    const agentLogsContainer = document.getElementById("agent-logs-flow");
    const submitBtn = document.getElementById("chat-submit-btn");
    
    if (submitBtn) submitBtn.disabled = true;
    input.value = "";

    // Clear live graph and logs
    resetAgentGraphUI();

    try {
      // Connect agent listeners to update UI live
      window.SafeLifeAgents.clearTimeline();
      
      const responseHtml = await window.SafeLifeAgents.runOrchestrationWorkflow(
        query,
        state.activePatientId,
        { patients: patientsData }
      );

      // Append result to chat panel
      const bubble = document.createElement("div");
      bubble.className = "bg-white/90 dark:bg-gray-800/90 border border-blue-100 dark:border-blue-900 p-4 rounded-2xl shadow-sm text-sm";
      bubble.innerHTML = responseHtml;
      
      const resultsContainer = document.getElementById("ai-concierge-results");
      resultsContainer.innerHTML = "";
      resultsContainer.appendChild(bubble);

      // Speak response summary
      speakText("Orchestration complete. Recommendations rendered on your dashboard.");

    } catch (e) {
      console.error(e);
    } finally {
      state.processingQuery = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  // Reset graph visual lines
  function resetAgentGraphUI() {
    const paths = document.querySelectorAll(".collaboration-path");
    paths.forEach(p => p.classList.remove("flow-line-active"));
    
    const nodes = document.querySelectorAll(".agent-node");
    nodes.forEach(n => {
      n.classList.remove("agent-node-thinking");
      n.classList.add("border-gray-200");
    });
  }

  // Update Agent Visualization Graphic in Real Time
  function updateGraphVisuals(agentName, status) {
    const agentIdMap = {
      "Supervisor Agent": "node-supervisor",
      "Memory Agent": "node-memory",
      "Medication Agent": "node-medication",
      "Appointment Agent": "node-appointment",
      "Health Record Agent": "node-record",
      "Caregiver Agent": "node-caregiver",
      "Emergency Agent": "node-emergency"
    };

    const nodeId = agentIdMap[agentName];
    if (!nodeId) return;

    const el = document.getElementById(nodeId);
    if (!el) return;

    // Remove old classes
    el.classList.remove("agent-node-thinking", "border-blue-500", "border-emerald-500", "border-indigo-500", "border-purple-500");

    if (status === "Thinking") {
      el.classList.add("agent-node-thinking", "border-blue-500");
    } else if (status === "Collaborating") {
      el.classList.add("agent-node-thinking", "border-yellow-500");
      // Find connecting path
      activateCollaborationPath("path-supervisor-memory");
    } else if (status === "Complete") {
      el.classList.add("border-emerald-500");
    } else {
      el.classList.add("border-gray-200");
    }
  }

  function activateCollaborationPath(pathId) {
    const path = document.getElementById(pathId);
    if (path) {
      path.classList.add("flow-line-active");
    }
  }

  // Render reasoning logs
  function renderReasoningTimeline(timeline) {
    const timelineContainer = document.getElementById("reasoning-timeline-list");
    if (!timelineContainer) return;
    
    timelineContainer.innerHTML = "";
    
    if (timeline.length === 0) {
      timelineContainer.innerHTML = `
        <div class="text-center text-xs text-gray-400 dark:text-gray-500 py-6">
          Submit a query above to start the live Agent Reasoning simulation.
        </div>
      `;
      return;
    }

    timeline.forEach(log => {
      const typeColors = {
        "Supervisor Agent": "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600",
        "Medication Agent": "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600",
        "Appointment Agent": "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600",
        "Health Record Agent": "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-600",
        "Caregiver Agent": "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600",
        "Emergency Agent": "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-600",
        "Memory Agent": "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-600"
      };

      const color = typeColors[log.agent] || "border-gray-300";
      
      const payloadString = log.payload ? `
        <pre class="bg-gray-100 dark:bg-gray-900 text-[10px] p-1.5 rounded mt-1.5 font-mono overflow-x-auto text-gray-600 dark:text-gray-400 max-w-full truncate">${JSON.stringify(log.payload, null, 2)}</pre>
      ` : "";

      timelineContainer.innerHTML += `
        <div class="border-l-2 ${color.split(" ")[0]} pl-3 relative text-xs">
          <!-- Timetamp indicator -->
          <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${color.split(" ")[1] || "bg-gray-400"}"></div>
          <div class="flex justify-between font-bold">
            <span class="${color.split(" ")[2]}">${log.agent}</span>
            <span class="text-gray-400 font-normal text-[10px]">${log.timestamp}</span>
          </div>
          <p class="font-semibold text-gray-700 dark:text-gray-200 mt-0.5">${log.action}</p>
          <p class="text-gray-600 dark:text-gray-400 mt-0.5">${log.details}</p>
          ${payloadString}
        </div>
      `;
    });
  }

  // Bind presets for Flow triggers
  window.triggerPresetFlow = function (flowNum) {
    const inputs = {
      1: "My father takes Metformin twice daily and often forgets his evening dose.",
      2: "I need to prepare for a cardiology appointment next week.",
      3: "My mother missed medication for two days."
    };
    
    const input = document.getElementById("chat-user-input");
    if (input) {
      input.value = inputs[flowNum];
      window.submitAIQuery();
    }
  };

  // 4. Initial Hookups
  document.addEventListener("DOMContentLoaded", () => {
    // Read cached settings
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      state.encryptionEnabled = parsed.encryptionEnabled || false;
      state.role = parsed.role || "Caregiver";
      state.simpleMode = parsed.simpleMode || false;
      state.textScale = parsed.textScale || "normal";
      state.highContrast = parsed.highContrast || false;
      state.activePatientId = parsed.activePatientId || "arthur-pendelton";
    }

    initDatabase();

    // Hook agent event listeners
    window.SafeLifeAgents.addStateListener((type, data) => {
      if (type === "reasoning_update") {
        renderReasoningTimeline(data.timeline);
      } else if (type === "agent_status_change") {
        updateGraphVisuals(data.name, data.status);
        // Highlight corresponding SVGs based on status
        if (data.status === "Collaborating") {
          activateCollaborationPath("path-supervisor-medication");
          activateCollaborationPath("path-supervisor-emergency");
          activateCollaborationPath("path-supervisor-caregiver");
          activateCollaborationPath("path-supervisor-appointment");
          activateCollaborationPath("path-supervisor-record");
        }
      } else if (type === "timeline_cleared") {
        renderReasoningTimeline([]);
      } else if (type === "memory_updated") {
        // Sync local DB copy
        const currentPatient = patientsData[state.activePatientId];
        currentPatient.memories = data;
        saveDatabase();
        renderView();
      }
    });

    renderView();
  });

  // Export state variables for debug or inspector tools
  window.SafeLifeApp = {
    getState: () => state,
    getPatients: () => patientsData,
    saveDatabase
  };

})();
