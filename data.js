// LifeCare AI Preloaded Demo Data
window.LifeCareData = {
  patients: {
    "arthur-pendelton": {
      id: "arthur-pendelton",
      name: "Arthur Pendelton",
      age: 78,
      gender: "Male",
      diagnoses: ["Type 2 Diabetes", "Mild Hypertension", "Early-stage Osteoarthritis"],
      criticalInfo: {
        bloodType: "O-Positive",
        allergies: ["Penicillin", "Sulfa Drugs"],
        conditions: "Type 2 Diabetes, Hypertension, Coronary Heart Stent (2023)",
        pharmacy: "Walgreens #1034 (Phone: 555-0199)"
      },
      medications: [
        { id: "m1", name: "Metformin", dosage: "500mg", instructions: "Twice daily with meals (Breakfast/Dinner)", time: ["08:00 AM", "08:00 PM"], count: 60, takenToday: { morning: true, evening: false } },
        { id: "m2", name: "Lisinopril", dosage: "10mg", instructions: "Once daily in the morning", time: ["08:00 AM"], count: 30, takenToday: { morning: true } },
        { id: "m3", name: "Atorvastatin", dosage: "20mg", instructions: "Once daily at bedtime", time: ["10:00 PM"], count: 30, takenToday: { evening: false } }
      ],
      appointments: [
        { id: "a1", doctor: "Dr. Evelyn Carter", specialty: "Cardiologist", date: "2026-07-14", time: "10:00 AM", location: "Heart & Vascular Center, Suite 400", reason: "6-Month Post-Stent Follow-up", status: "Upcoming", checklist: ["Bring blood pressure logs", "Fast 12 hours prior", "Prepare list of current supplements"] },
        { id: "a2", doctor: "Dr. Marcus Vance", specialty: "Primary Care Physician", date: "2026-08-03", time: "02:00 PM", location: "Metro Medical Plaza", reason: "Routine Diabetes Checkup & A1C lab", status: "Upcoming", checklist: ["Get blood test done 3 days before", "Request Metformin refill"] }
      ],
      careCircle: {
        owner: "Robert Pendelton",
        members: [
          { name: "Robert Pendelton", relation: "Son (Primary Caregiver)", phone: "+1 (555) 123-4567", role: "Caregiver", active: true },
          { name: "Sarah Pendelton", relation: "Daughter (Secondary Caregiver)", phone: "+1 (555) 765-4321", role: "Caregiver", active: true },
          { name: "Dr. Marcus Vance", relation: "Primary Care Doctor", phone: "+1 (555) 888-0123", role: "Doctor", active: false }
        ],
        tasks: [
          { id: "t1", title: "Refill Metformin prescription", assignedTo: "Robert Pendelton", dueDate: "2026-07-10", completed: false, category: "Medication" },
          { id: "t2", title: "Verify morning Lisinopril dose", assignedTo: "Sarah Pendelton", dueDate: "2026-07-07", completed: true, category: "Medication" },
          { id: "t3", title: "Help clean and organize pill box", assignedTo: "Sarah Pendelton", dueDate: "2026-07-09", completed: false, category: "Caregiving" },
          { id: "t4", title: "Print blood pressure logs for cardiologist", assignedTo: "Robert Pendelton", dueDate: "2026-07-13", completed: false, category: "Admin" }
        ],
        notes: [
          { id: "n1", author: "Robert Pendelton", date: "2026-07-06 08:30 PM", text: "Dad missed his evening Metformin dose today. I called him and reminded him, but he was already asleep. Will coordinate with Sarah to check on him tomorrow morning." },
          { id: "n2", author: "Sarah Pendelton", date: "2026-07-06 09:15 AM", text: "Visited Dad. Blood sugar reading was 134 mg/dL. He took his Lisinopril on time. Pill organizer setup is working well, but evening dose remains an issue." }
        ]
      },
      healthTimeline: [
        { date: "2026-07-06", type: "Alert", title: "Missed Evening Metformin", details: "System detected no logging for Metformin 500mg evening dose by 9:30 PM." },
        { date: "2026-07-06", type: "Vitals", title: "Blood Glucose Logged", details: "Blood glucose measured at 134 mg/dL (Sarah verified)." },
        { date: "2026-07-05", type: "Medication", title: "Medication Schedule Updated", details: "Atorvastatin bedtime dose changed to 10:00 PM." },
        { date: "2026-06-15", type: "Lab", title: "Lab Results Received", details: "HbA1c level: 7.2% (Improved from 7.5% in March). Kidney function stable." }
      ],
      metrics: {
        adherenceRate: 85,
        completedAppointments: 14,
        caregiverHoursSaved: 22,
        riskReduction: 38,
        riskScore: "Medium",
        riskReason: "Metformin evening dose missed 3 times in the last 7 days. Risk of blood glucose spikes."
      },
      memories: [
        { id: "mem1", fact: "Arthur prefers taking pills with apple juice because he finds it easier to swallow.", timestamp: "2026-06-20" },
        { id: "mem2", fact: "Usually goes to bed around 9:30 PM, making 10:00 PM medications difficult to remember without pre-alerts.", timestamp: "2026-07-02" },
        { id: "mem3", fact: "Has mild knee pain that worsens on rainy days, affecting his walking schedule.", timestamp: "2026-07-04" }
      ]
    },
    "eleanor-vance": {
      id: "eleanor-vance",
      name: "Eleanor Vance",
      age: 72,
      gender: "Female",
      diagnoses: ["Congestive Heart Failure", "Coronary Artery Disease"],
      criticalInfo: {
        bloodType: "A-Positive",
        allergies: ["Sulfa Drugs", "Aspirin"],
        conditions: "Congestive Heart Failure, Hypertension, Chronic Kidney Disease Stage 2",
        pharmacy: "CVS Pharmacy #0892 (Phone: 555-0244)"
      },
      medications: [
        { id: "m4", name: "Carvedilol", dosage: "6.25mg", instructions: "Twice daily with meals", time: ["09:00 AM", "09:00 PM"], count: 60, takenToday: { morning: true, evening: true } },
        { id: "m5", name: "Furosemide", dosage: "40mg", instructions: "Once daily in the morning", time: ["09:00 AM"], count: 30, takenToday: { morning: true } },
        { id: "m6", name: "Spironolactone", dosage: "25mg", instructions: "Once daily in the morning", time: ["09:00 AM"], count: 30, takenToday: { morning: true } }
      ],
      appointments: [
        { id: "a3", doctor: "Dr. Alan Chen", specialty: "Cardiologist", date: "2026-07-15", time: "11:00 AM", location: "Mercy Cardiology Wing B", reason: "Congestive Heart Failure assessment", status: "Upcoming", checklist: ["Bring weight logs of the past 2 weeks", "Perform blood work for Potassium levels", "Note down any chest tightness"] }
      ],
      careCircle: {
        owner: "Sarah Vance",
        members: [
          { name: "Sarah Vance", relation: "Daughter (Primary Caregiver)", phone: "+1 (555) 234-5678", role: "Caregiver", active: true },
          { name: "Dr. Alan Chen", relation: "Cardiologist", phone: "+1 (555) 777-1234", role: "Doctor", active: false }
        ],
        tasks: [
          { id: "t5", title: "Submit weight log to Cardiologist portal", assignedTo: "Sarah Vance", dueDate: "2026-07-14", completed: false, category: "Caregiving" },
          { id: "t6", title: "Pick up Carvedilol refill at CVS", assignedTo: "Sarah Vance", dueDate: "2026-07-12", completed: true, category: "Medication" }
        ],
        notes: [
          { id: "n3", author: "Sarah Vance", date: "2026-07-05 06:00 PM", text: "Mom's weight is stable at 154 lbs. No breathing difficulties today during her evening walk. She took all medications." }
        ]
      },
      healthTimeline: [
        { date: "2026-07-06", type: "Vitals", title: "Weight Logged", details: "Weight recorded as 154.2 lbs. Safe range maintained (+/- 2 lbs)." },
        { date: "2026-07-05", type: "Medication", title: "Refill Completed", details: "Carvedilol 6.25mg refilled at CVS." }
      ],
      metrics: {
        adherenceRate: 98,
        completedAppointments: 8,
        caregiverHoursSaved: 30,
        riskReduction: 55,
        riskScore: "Low",
        riskReason: "Perfect medication adherence. Weight logs indicate no fluid retention. Appointments attended."
      },
      memories: [
        { id: "mem4", fact: "Prefers to weigh herself immediately after waking up and using the restroom.", timestamp: "2026-06-18" },
        { id: "mem5", fact: "Exhibits shortness of breath if fluid retention exceeds 3 lbs in 48 hours.", timestamp: "2026-06-25" }
      ]
    },
    "david-miller": {
      id: "david-miller",
      name: "David Miller",
      age: 54,
      gender: "Male",
      diagnoses: ["Chronic Back Pain", "Hypertension"],
      criticalInfo: {
        bloodType: "A-Negative",
        allergies: ["Codeine"],
        conditions: "Chronic Lower Lumbar Pain, Hypertension",
        pharmacy: "Costco Pharmacy #22 (Phone: 555-8900)"
      },
      medications: [
        { id: "m7", name: "Gabapentin", dosage: "300mg", instructions: "Three times daily", time: ["08:00 AM", "02:00 PM", "08:00 PM"], count: 90, takenToday: { morning: true, afternoon: true, evening: true } },
        { id: "m8", name: "Amlodipine", dosage: "5mg", instructions: "Once daily in the morning", time: ["08:00 AM"], count: 30, takenToday: { morning: true } }
      ],
      appointments: [
        { id: "a4", doctor: "Dr. Sarah Jenkins", specialty: "Pain Management Specialist", date: "2026-07-22", time: "09:30 AM", location: "Jenkins Pain Center", reason: "Gabapentin dosage review", status: "Upcoming", checklist: ["Log pain scale (1-10) daily", "List any drowsiness side effects"] }
      ],
      careCircle: {
        owner: "David Miller",
        members: [
          { name: "David Miller", relation: "Self", phone: "+1 (555) 444-9999", role: "Patient", active: true },
          { name: "Linda Miller", relation: "Wife", phone: "+1 (555) 444-8888", role: "Caregiver", active: true }
        ],
        tasks: [
          { id: "t7", title: "Complete pain log for Jenkins appointment", assignedTo: "David Miller", dueDate: "2026-07-21", completed: false, category: "Admin" }
        ],
        notes: [
          { id: "n4", author: "David Miller", date: "2026-07-06 09:00 PM", text: "Back pain was a 4/10 today. Gabapentin took edge off. Blood pressure was 128/82 in evening." }
        ]
      },
      healthTimeline: [
        { date: "2026-07-06", type: "Vitals", title: "Blood Pressure Logged", details: "Blood pressure reading: 128/82 mmHg." }
      ],
      metrics: {
        adherenceRate: 92,
        completedAppointments: 6,
        caregiverHoursSaved: 10,
        riskReduction: 20,
        riskScore: "Low",
        riskReason: "Consistent medication intake. Blood pressure is within normal hypertensive range."
      },
      memories: [
        { id: "mem6", fact: "Experiences morning drowsiness if Gabapentin evening dose is taken after 9:00 PM.", timestamp: "2026-06-30" }
      ]
    }
  }
};
console.log("LifeCare AI Data loaded successfully:", window.LifeCareData);
