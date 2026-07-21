# 🚨 CivicShield AI
**Securing Public Services Through Intelligent Defense**

An AI-powered Cyber Defense Platform designed specifically for organizations that protect society—Government Departments, NGOs, Schools, Hospitals, and Small Municipal Offices.

Unlike enterprise SOC platforms that require expensive infrastructure and cybersecurity experts, CivicShield AI enables organizations with limited cybersecurity resources to automatically detect, analyze, prioritize, and respond to cyber threats using AI.

## 🎯 Purpose
Most organizations that serve the public cannot afford enterprise SOC solutions or dedicated cybersecurity teams. They rely on small IT teams that become overwhelmed by phishing attacks, ransomware, suspicious logins, malware, unauthorized access, and unusual system activity.

CivicShield AI automatically performs intelligent cyber defense using AI, reducing alert fatigue and accelerating incident response without the complexity of traditional SIEM/SOAR platforms.

## 🔄 System Workflow
1. **Connect Existing Data Source**
2. **Validate Connection**
3. **Enable Secure Ingestion**
4. **Receive Security Events**
5. **AI Analysis**
6. **Risk Scoring**
7. **Threat Classification**
8. **Incident Correlation**
9. **MITRE ATT&CK Mapping**
10. **Business Impact Analysis**
11. **Executive Summary**
12. **Containment Recommendations**
13. **Investigation Workspace**
14. **Incident Resolution**

## 👥 User Roles
- **Organization Administrator**: Manages the organization, users, and global settings.
- **Security Officer**: Oversees security posture, handles incident escalation.
- **Security Team Member**: Daily alert triage and incident investigation.
- **Alert Source**: Automated service/system that ingests alerts.
- **Super Admin**: System-wide administration.

## 🏗️ Architecture
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express + MongoDB with JWT auth and Socket.IO
- **AI Layer**: OpenAI API for Incident Intelligence & Alert Analysis

## ✨ Key Features
- Automated alert ingestion
- AI-powered alert explanation & risk scoring (0–100)
- Automatic alert-to-incident correlation
- AI Incident Intelligence (MITRE mapping, Business impact, Containment steps)
- Real-time Cyber Defense dashboard metrics
- Role-based authentication & Row Level Security (RLS)