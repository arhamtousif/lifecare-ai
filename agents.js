// LifeCare AI Agent Orchestration & Reasoning System
window.LifeCareAgents = (function () {
  
  // Custom event emitter or listener registry to notify UI of updates
  const listeners = [];
  
  function addStateListener(callback) {
    listeners.push(callback);
  }
  
  function notifyListeners(eventType, data) {
    listeners.forEach(cb => cb(eventType, data));
  }

  // Live log of all agent actions
  let reasoningTimeline = [];
  let currentWorkflow = null;

  function clearTimeline() {
    reasoningTimeline = [];
    notifyListeners("timeline_cleared", reasoningTimeline);
  }

  function logReasoning(agent, action, details, status = "Thinking", payload = null) {
    const logEntry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      agent,
      action,
      details,
      status,
      payload
    };
    reasoningTimeline.push(logEntry);
    console.log(`[${agent}] ${action}: ${details}`, payload);
    notifyListeners("reasoning_update", { entry: logEntry, timeline: reasoningTimeline });
  }

  // Base class for Specialized Agents
  class BaseAgent {
    constructor(name, icon, color) {
      this.name = name;
      this.icon = icon;
      this.color = color;
      this.status = "Idle"; // Idle, Thinking, Collaborating, Complete
    }

    setStatus(status) {
      this.status = status;
      notifyListeners("agent_status_change", { name: this.name, status: this.status });
    }
  }

  // 1. Supervisor Agent
  class SupervisorAgent extends BaseAgent {
    constructor() {
      super("Supervisor Agent", "👑", "blue");
    }

    async processQuery(query, patientId, dataContext) {
      this.setStatus("Thinking");
      logReasoning(this.name, "Decompose Query", `Received query: "${query}". Initiating orchestration plan.`, "Thinking");
      
      const patient = dataContext.patients[patientId] || dataContext.patients["arthur-pendelton"];
      
      // Step 1: Consult Memory Agent for preferences and history
      this.setStatus("Collaborating");
      logReasoning(this.name, "Delegate to Memory Agent", "Retrieve historical context and stored user preferences.", "Collaborating");
      const memoryAgent = new MemoryAgent();
      const preferences = await memoryAgent.retrievePreferences(patient, query);
      
      // Step 2: Route based on query contents
      let response = "";
      const queryLower = query.toLowerCase();
      
      if (queryLower.includes("metformin") || queryLower.includes("forget") || queryLower.includes("dose") || queryLower.includes("missed") || queryLower.includes("medicine") || queryLower.includes("pill") || queryLower.includes("schedule")) {
        // Medication workflow
        response = await this.runMedicationFlow(patient, query, preferences, dataContext);
      } else if (queryLower.includes("cardiology") || queryLower.includes("appointment") || queryLower.includes("doctor") || queryLower.includes("visit") || queryLower.includes("prepare")) {
        // Appointment workflow
        response = await this.runAppointmentFlow(patient, query, preferences, dataContext);
      } else {
        // General workflow
        response = await this.runGeneralFlow(patient, query, preferences, dataContext);
      }

      this.setStatus("Complete");
      logReasoning(this.name, "Synthesize Final Response", "Compiled recommendations into structured medical plan.", "Complete", { output: response });
      return response;
    }

    async runMedicationFlow(patient, query, preferences, dataContext) {
      logReasoning(this.name, "Medication Flow Triggered", "Routing request to Medication, Caregiver, and Emergency Agents.", "Thinking");
      
      // Step A: Medication Agent
      const medAgent = new MedicationAgent();
      const scheduleResult = await medAgent.analyzeSchedule(patient, query);
      
      // Step B: Emergency Agent (Risk Assessment)
      const emergencyAgent = new EmergencyAgent();
      const riskAssessment = await emergencyAgent.assessRisk(patient, scheduleResult);
      
      // Step C: Caregiver Agent (Notification setup)
      const caregiverAgent = new CaregiverAgent();
      const caregiverUpdate = await caregiverAgent.escalateIfNeeded(patient, riskAssessment);
      
      // Step D: Memory Agent (Save pattern)
      const memoryAgent = new MemoryAgent();
      await memoryAgent.storeFact(patient, "Learned preference: Medication reminder escalation configured.");

      // Return synthesized result
      return `
        <div class="space-y-4 text-gray-800 dark:text-gray-100">
          <div class="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <h4 class="font-bold text-lg">LifeCare Medication Orchestration Complete</h4>
          </div>
          <p class="text-sm">The <strong>Supervisor Agent</strong> delegated task analysis to the specialized agents. Here is the action plan developed for <strong>${patient.name}</strong>:</p>
          
          <div class="border-l-4 border-emerald-500 pl-3 py-1 bg-emerald-50/50 dark:bg-emerald-950/20 rounded">
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Medication Schedule Action</span>
            <p class="text-sm font-medium mt-1">${scheduleResult.recommendation}</p>
            <ul class="text-xs list-disc list-inside mt-1 text-gray-600 dark:text-gray-300">
              ${scheduleResult.schedule.map(s => `<li>${s.name} (${s.dosage}): ${s.time}</li>`).join("")}
            </ul>
          </div>

          <div class="border-l-4 border-amber-500 pl-3 py-1 bg-amber-50/50 dark:bg-amber-950/20 rounded">
            <span class="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Smart Risk Engine</span>
            <p class="text-sm mt-1"><strong>Risk Level: ${riskAssessment.level}</strong> (${riskAssessment.score}% Score)</p>
            <p class="text-xs text-gray-600 dark:text-gray-300">${riskAssessment.reason}</p>
          </div>

          <div class="border-l-4 border-indigo-500 pl-3 py-1 bg-indigo-50/50 dark:bg-indigo-950/20 rounded">
            <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">CareCircle Notifications</span>
            <p class="text-xs mt-1 font-medium">${caregiverUpdate.alertMessage}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${caregiverUpdate.actionTaken}</p>
          </div>
          
          <div class="text-xs text-gray-400 dark:text-gray-500 italic mt-2 border-t pt-2 flex items-center space-x-1">
            <span>Memory Agent Context:</span>
            <span class="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">Preference stored locally</span>
          </div>
        </div>
      `;
    }

    async runAppointmentFlow(patient, query, preferences, dataContext) {
      logReasoning(this.name, "Appointment Flow Triggered", "Routing request to Appointment, Health Record, and Caregiver Agents.", "Thinking");
      
      // Step A: Appointment Agent
      const apptAgent = new AppointmentAgent();
      const apptAnalysis = await apptAgent.analyzeAppointment(patient, query);
      
      // Step B: Health Record Agent
      const hrAgent = new HealthRecordAgent();
      const recordSummary = await hrAgent.summarizeHistory(patient, apptAnalysis);
      
      // Step C: Caregiver Agent (Prepare summaries)
      const caregiverAgent = new CaregiverAgent();
      const caregiverSummary = await caregiverAgent.prepareCircleUpdate(patient, apptAnalysis);

      // Return synthesized result
      return `
        <div class="space-y-4 text-gray-800 dark:text-gray-100">
          <div class="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <h4 class="font-bold text-lg">Appointment Pre-Checklist Compiled</h4>
          </div>
          <p class="text-sm">The <strong>Supervisor Agent</strong> gathered patient history, generated customized checklists, and drafted questions to prepare <strong>${patient.name}</strong> for the upcoming cardiology appointment:</p>
          
          <div class="border-l-4 border-indigo-500 pl-3 py-1 bg-indigo-50/50 dark:bg-indigo-950/20 rounded">
            <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Patient History Summary</span>
            <p class="text-xs mt-1 text-gray-700 dark:text-gray-300"><strong>Diagnoses:</strong> ${patient.diagnoses.join(", ")}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300">${recordSummary.summaryText}</p>
          </div>

          <div class="border-l-4 border-emerald-500 pl-3 py-1 bg-emerald-50/50 dark:bg-emerald-950/20 rounded">
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Doctor Visit Checklist</span>
            <ul class="text-xs list-disc list-inside mt-1 text-gray-600 dark:text-gray-300 space-y-1">
              ${apptAnalysis.checklist.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>

          <div class="border-l-4 border-blue-500 pl-3 py-1 bg-blue-50/50 dark:bg-blue-950/20 rounded">
            <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Suggested Questions for Physician</span>
            <ul class="text-xs list-decimal list-inside mt-1 text-gray-600 dark:text-gray-300 space-y-1">
              ${apptAnalysis.suggestedQuestions.map(q => `<li>${q}</li>`).join("")}
            </ul>
          </div>

          <div class="text-xs text-gray-400 dark:text-gray-500 italic mt-2 border-t pt-2 flex justify-between">
            <span>Prepared by Health Record & Appointment Agent</span>
            <button onclick="window.printReport('${patient.id}')" class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-semibold">Print Visit Summary 🖨️</button>
          </div>
        </div>
      `;
    }

    async runGeneralFlow(patient, query, preferences, dataContext) {
      logReasoning(this.name, "General Assistance Flow Triggered", "Checking user query against memory and health records.", "Thinking");
      
      const hrAgent = new HealthRecordAgent();
      const medAgent = new MedicationAgent();
      
      const statusDetails = `Patient ${patient.name} has ${patient.medications.length} active medications and ${patient.appointments.length} upcoming appointments.`;
      
      logReasoning(this.name, "Aggregate Status Info", statusDetails, "Collaborating");

      return `
        <div class="space-y-3 text-gray-800 dark:text-gray-100">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 text-lg flex items-center space-x-2">
            <span>💡 LifeCare AI Response</span>
          </h4>
          <p class="text-sm">Hi, I'm your LifeCare AI Concierge. I've scanned the active profiles and compiled the following update:</p>
          <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-xs space-y-1 border border-gray-100 dark:border-gray-800">
            <p><strong>Patient Name:</strong> ${patient.name}</p>
            <p><strong>Conditions:</strong> ${patient.diagnoses.join(", ")}</p>
            <p><strong>Medication Intake:</strong> ${patient.medications.map(m => m.name).join(", ")}</p>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-300">If you need specific help with setting up medication schedules, preparing for appointments, or reviewing caregiver alerts, please let me know.</p>
        </div>
      `;
    }
  }

  // 2. Medication Agent
  class MedicationAgent extends BaseAgent {
    constructor() {
      super("Medication Agent", "💊", "emerald");
    }

    async analyzeSchedule(patient, query) {
      this.setStatus("Thinking");
      logReasoning(this.name, "Analyze Query", `Analyzing medication profile for ${patient.name}`, "Thinking");
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulated AI delay
      
      let recommendation = "";
      let schedule = [];

      if (query.toLowerCase().includes("metformin")) {
        recommendation = "Metformin twice daily schedule configured. Evening dose reminder set at 8:00 PM with smart reminder escalation via CareCircle.";
        schedule = [
          { name: "Metformin", dosage: "500mg", time: "08:00 AM (With Breakfast)" },
          { name: "Metformin", dosage: "500mg", time: "08:00 PM (With Dinner) - Escalation Active" }
        ];
      } else {
        recommendation = "Current medication schedules verified. No dosing conflicts detected.";
        schedule = patient.medications.map(m => ({ name: m.name, dosage: m.dosage, time: m.time.join(", ") }));
      }

      this.setStatus("Complete");
      logReasoning(this.name, "Generate Plan", "Medication schedule generated and conflicts cleared.", "Complete", { schedule, recommendation });
      return { schedule, recommendation };
    }
  }

  // 3. Appointment Agent
  class AppointmentAgent extends BaseAgent {
    constructor() {
      super("Appointment Agent", "📅", "indigo");
    }

    async analyzeAppointment(patient, query) {
      this.setStatus("Thinking");
      logReasoning(this.name, "Fetch Appointments", "Retrieving upcoming physician visits.", "Thinking");
      
      await new Promise(resolve => setTimeout(resolve, 600));

      const appt = patient.appointments[0] || { doctor: "Dr. Carter", specialty: "Specialist", date: "Next week" };
      
      const checklist = [
        "Record morning blood pressure and heart rate for 7 days leading to the appointment.",
        "Take all current prescription bottles to show the doctor.",
        "Log blood sugar readings (fasting and post-meal) if diabetic.",
        "Ask a family member to review the appointment report card."
      ];

      const suggestedQuestions = [
        "Are there any drug-to-drug interactions between my current blood pressure medications and diabetes medications?",
        "Do my recent blood lab results (A1C, kidney panel) look stable?",
        "Given the recent evening forgetfulness, is it safe to adjust the timing of my evening dose?",
        "What specific symptoms should prompt me to call your clinic immediately?"
      ];

      this.setStatus("Complete");
      logReasoning(this.name, "Generate Checklist", `Compiled checklist and questions for appointment with ${appt.doctor}`, "Complete", { checklist, suggestedQuestions });
      
      return { appt, checklist, suggestedQuestions };
    }
  }

  // 4. Health Record Agent
  class HealthRecordAgent extends BaseAgent {
    constructor() {
      super("Health Record Agent", "🗂️", "cyan");
    }

    async summarizeHistory(patient, apptAnalysis) {
      this.setStatus("Thinking");
      logReasoning(this.name, "Query Health Records", "Retrieving clinical history, laboratory reports, and surgical histories.", "Thinking");
      
      await new Promise(resolve => setTimeout(resolve, 700));

      const summaryText = `Patient is a ${patient.age}-year-old with a clinical history of ${patient.diagnoses.join(", ")}. Last HbA1c lab result was 7.2% (stable). Stent procedure in 2023 was successful, and ventricular ejection fraction remains stable. No recent ER admissions.`;
      
      this.setStatus("Complete");
      logReasoning(this.name, "Summarize Records", "Synthesized clinical history summary for physician review.", "Complete", { summaryText });
      
      return { summaryText };
    }
  }

  // 5. Caregiver Agent
  class CaregiverAgent extends BaseAgent {
    constructor() {
      super("Caregiver Agent", "👥", "purple");
    }

    async escalateIfNeeded(patient, riskAssessment) {
      this.setStatus("Thinking");
      logReasoning(this.name, "Evaluate Escalation Rules", `Reviewing CareCircle settings for ${patient.name}`, "Thinking");
      
      await new Promise(resolve => setTimeout(resolve, 800));

      let alertMessage = "";
      let actionTaken = "";
      
      if (riskAssessment.score > 50) {
        alertMessage = `🚨 ALERT ESCALATION: ${patient.name} missed medication for multiple sessions or has high risk. Caregivers (Robert & Sarah) notified.`;
        actionTaken = "Auto-sent high-priority notification to caregiver devices and logged incident in the family activity feed.";
      } else {
        alertMessage = `🔔 Caregiver Note: Regular reminder dispatched. Action logged.`;
        actionTaken = "Normal notification dispatched.";
      }

      this.setStatus("Complete");
      logReasoning(this.name, "Dispatch Alerts", "CareCircle notifications successfully routed and logged.", "Complete", { alertMessage, actionTaken });
      
      return { alertMessage, actionTaken };
    }

    async prepareCircleUpdate(patient, apptAnalysis) {
      this.setStatus("Thinking");
      logReasoning(this.name, "Prepare Circle Summary", `Formatting update for CareCircle members regarding cardiology checkup.`, "Thinking");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.setStatus("Complete");
      logReasoning(this.name, "Share Update", "Shared appointment pre-checklist with primary caregivers.", "Complete");
    }
  }

  // 6. Emergency Agent
  class EmergencyAgent extends BaseAgent {
    constructor() {
      super("Emergency Agent", "🚨", "red");
    }

    async assessRisk(patient, scheduleResult) {
      this.setStatus("Thinking");
      logReasoning(this.name, "Calculate Risk Score", "Evaluating clinical risk parameters: missed doses, drug conflicts, symptom logs.", "Thinking");
      
      await new Promise(resolve => setTimeout(resolve, 900));

      let score = 35;
      let level = "Low";
      let reason = "All critical medications logged today. Schedule is stable.";

      const missedMetformin = patient.medications.find(m => m.name === "Metformin" && m.takenToday.evening === false);
      if (missedMetformin) {
        score = 65;
        level = "Medium";
        reason = "Metformin evening dose missed today. Chronic omission can trigger glucose spikes (above 180 mg/dL). CareCircle intervention recommended.";
      }

      // If user query mentions 'missed medication for two days'
      if (reasoningTimeline.some(log => log.details && log.details.toLowerCase().includes("two days"))) {
        score = 88;
        level = "High";
        reason = "Critically high risk. Blood sugar could spike above 250 mg/dL, increasing diabetic ketoacidosis risk. Alerting all emergency contacts immediately.";
      }

      this.setStatus("Complete");
      logReasoning(this.name, "Risk Analysis Complete", `Calculated clinical risk score: ${score}% (${level} Risk)`, "Complete", { score, level, reason });
      
      return { score, level, reason };
    }
  }

  // 7. Memory Agent
  class MemoryAgent extends BaseAgent {
    constructor() {
      super("Memory Agent", "🧠", "pink");
    }

    async retrievePreferences(patient, query) {
      this.setStatus("Thinking");
      logReasoning(this.name, "Query Long-Term Memory", `Searching patient memory indices for: "${query}"`, "Thinking");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Pull patient memories
      const facts = patient.memories.map(m => m.fact);
      
      this.setStatus("Complete");
      logReasoning(this.name, "Recall Memory Nodes", `Found ${facts.length} stored facts/preferences.`, "Complete", { facts });
      
      return facts;
    }

    async storeFact(patient, fact) {
      this.setStatus("Thinking");
      logReasoning(this.name, "Index New Fact", `Saving new fact into memory index: "${fact}"`, "Thinking");
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newMemory = {
        id: "mem_" + Date.now(),
        fact,
        timestamp: new Date().toISOString().split("T")[0]
      };
      
      patient.memories.push(newMemory);
      
      this.setStatus("Complete");
      logReasoning(this.name, "Persist Fact", "Memory database synchronized.", "Complete");
      notifyListeners("memory_updated", patient.memories);
      return newMemory;
    }
  }

  // Orchestrator Coordinator that runs workflows with visual delays to mimic active collaboration
  async function runOrchestrationWorkflow(query, patientId, dataContext) {
    clearTimeline();
    
    // Instantiate agents
    const supervisor = new SupervisorAgent();
    const memory = new MemoryAgent();
    const med = new MedicationAgent();
    const emergency = new EmergencyAgent();
    const caregiver = new CaregiverAgent();
    const appt = new AppointmentAgent();
    const hr = new HealthRecordAgent();

    // Reset status to Idle for all
    [supervisor, memory, med, emergency, caregiver, appt, hr].forEach(a => a.setStatus("Idle"));

    // supervisor starts
    notifyListeners("workflow_started", { query, patientId });
    
    const result = await supervisor.processQuery(query, patientId, dataContext);
    
    notifyListeners("workflow_finished", { query, patientId, result });
    
    // Set all to Complete
    [supervisor, memory, med, emergency, caregiver, appt, hr].forEach(a => a.setStatus("Idle"));
    return result;
  }

  return {
    SupervisorAgent,
    MedicationAgent,
    AppointmentAgent,
    HealthRecordAgent,
    CaregiverAgent,
    EmergencyAgent,
    MemoryAgent,
    runOrchestrationWorkflow,
    addStateListener,
    getTimeline: () => reasoningTimeline,
    clearTimeline
  };
})();
console.log("LifeCare AI Agents loaded successfully:", window.LifeCareAgents);
