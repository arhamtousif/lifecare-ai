# LifeCare AI - Multi-Agent Family Healthcare Platform

LifeCare AI is a production-ready, client-side, local-first AI Concierge web application designed for the Kaggle AI Agent Competition (Concierge Track). It provides a family health and care management system designed for elderly patients, patients with chronic conditions, and remote caregivers.

---

## Key Innovation: Supervisor Multi-Agent Architecture

LifeCare AI uses a hierarchical agent orchestration pattern where the **Supervisor Agent** delegates medical coordination tasks to specialized sub-agents:

```
                  ┌────────────────────┐
                  │  Supervisor Agent  │
                  └─────────┬──────────┘
                            │ (Task Delegation)
     ┌──────────────┬───────┼───────┬──────────────┐
     ▼              ▼       ▼       ▼              ▼
┌──────────┐   ┌─────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
│Medication│   │Emergency│ │Caregiver│ │ Memory │ │  Health  │
│  Agent   │   │  Agent  │ │  Agent  │ │ Agent  │ │  Record  │
└──────────┘   └─────────┘ └─────────┘ └────────┘ └──────────┘
```

1. **Supervisor Agent**: Decomposes user requests, sequences agent activations, routes task inputs, and synthesizes final responses.
2. **Medication Agent**: Creates schedules, tracks adherence, monitors pill metrics, and checks dosing instructions.
3. **Appointment Agent**: Tracks doctor visits, builds appointment checklists, and suggests custom questions for clinics.
4. **Health Record Agent**: Summarizes clinical histories, compiles lab records (e.g. A1C tests), and formats timelines.
5. **Caregiver Agent**: Relays notifications, assigns CareCircle team tasks, and coordinates alerts for remote families.
6. **Emergency Agent**: Evaluates clinical risk metrics (Low/Medium/High) and generates printable paramedic emergency cards.
7. **Memory Agent**: Extracts and stores patient preferences (e.g. "takes pills with juice") locally.

---

## Core Features & Advanced Enhancements

* **Family Command Center**: Monitor multiple relatives (e.g., Arthur, Eleanor, David) side-by-side. Inspect adherence metrics, active alerts, and doctor schedules on one unified panel.
* **Agent Reasoning Timeline & Collaboration Graph**: Real-time visualization of agent states ("Thinking", "Collaborating"), activation order, decisions, and JSON payloads.
* **CareCircle Collaboration Panel**: Interactive family task board. Assign tasks (e.g. refill prescriptions), check off accomplishments, and share updates.
* **Impact Dashboard**: Dynamic visual reporting metrics—Medication Adherence rates, completed appointments, caregiver hours saved, and risk reduction score.
* **Voice-First Accessibility**: Speech-to-text input (Web Speech Recognition) and Text-to-speech reading output (SpeechSynthesis). Large visual elements and high-contrast modes for elderly accessibility.
* **Medication Photo Recognition**: Drag-and-drop uploader. Simulates OCR label scanning, details extraction (drug name, strength, timing), and confidence reporting.
* **Physician visit report card generator**: Exports formatted one-page clinical summaries including current diagnostics, active medications, adherence charts, and lab results.

---

## Privacy & Security Architecture

* **Local-First Storage**: User data remains entirely within the browser sandbox (`localStorage`).
* **Client-Side Encryption Wrapper**: Toggling encryption on the Privacy Dashboard scrambles active databases in local storage using reverse-salted Base64 encoding.
* **Role-Based Access Control**: Filter dashboard options and access privileges by selecting Patient, Caregiver, Primary Doctor, or Emergency Responder roles.
* **Memory Fact Manager**: Review and delete individual learned preferences at any time to guarantee full data control.

---

## Deployment & Running Instructions

Since LifeCare AI is built as a static client-side web application, it does not require Node.js or active databases to run. It can be served instantly with Python:

1. Open your terminal in this workspace.
2. Launch a local HTTP server using Python:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)
4. Click **Try Demo Now** or select a preset scenario to test the multi-agent flows!
