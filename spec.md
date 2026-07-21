====================================================================
PROJECT NAME
====================================================================

CivicShield AI

====================================================================
PROJECT TYPE
====================================================================

Spec-Driven AI-Powered Cyber Defense & SOC Alert Intelligence Platform

====================================================================
PRIMARY OBJECTIVE
====================================================================

Build a complete full-stack AI-powered Cyber Defense Platform that enables
Government Departments, Hospitals, NGOs, Educational Institutions,
Municipal Corporations, and Small & Medium Organizations to detect,
analyze, prioritize, investigate, and respond to cybersecurity threats
without requiring an expensive Security Operations Center (SOC).

The platform must automate the complete lifecycle of security alerts while
keeping human analysts in control of final decisions.

The system must allow organizations to:

1. Register securely.
2. Create their organization.
3. Invite security team members.
4. Connect security data sources.
5. Receive security alerts.
6. Analyze alerts using AI.
7. Calculate threat confidence.
8. Detect false positives.
9. Correlate related alerts.
10. Generate security incidents.
11. Investigate incidents.
12. Generate executive reports.
13. Maintain investigation history.
14. Provide real-time dashboards.
15. Assist security analysts using OpenAI.

IMPORTANT:

This is NOT a chatbot.

This is NOT merely an AI wrapper.

This IS:

• AI-powered SOC Platform
• Threat Intelligence Platform
• Incident Response Platform
• Security Operations Dashboard
• Alert Correlation Engine
• Threat Confidence Evaluation Engine
• Executive Cyber Defense Console
• Public Service Cyber Protection Platform

====================================================================
PROJECT VISION
====================================================================

Traditional SIEM and SOAR platforms are expensive and require dedicated
cybersecurity teams.

Small organizations protecting public services often receive hundreds of
security alerts every day but lack skilled analysts to investigate them.

CivicShield AI acts as an AI Security Analyst that assists human operators
by:

• Reducing alert fatigue
• Prioritizing genuine threats
• Detecting false positives
• Explaining security alerts
• Correlating incidents
• Providing investigation guidance
• Generating executive summaries
• Improving incident response time

The AI never replaces human analysts.

The AI assists human decision making.

====================================================================
TARGET USERS
====================================================================

Primary Users

• Government Departments
• Municipal Offices
• Public Hospitals
• Schools & Universities
• NGOs
• Critical Infrastructure Teams
• Small Enterprises
• Security Operations Centers

System Roles

1. Super Administrator
2. Organization Administrator
3. Security Officer
4. Security Team Member
5. Alert Source (Demo Only)

====================================================================
IMPORTANT PROJECT STRUCTURE
====================================================================

THE PROJECT ROOT ALREADY CONTAINS

client/
server/

DO NOT CREATE

frontend/
backend/

USE ONLY THE EXISTING STRUCTURE.

Maintain a clean modular architecture.

Every module must remain independent.

====================================================================
CORE ARCHITECTURAL PRINCIPLE
====================================================================

ALL SECURITY LOGIC MUST BE SPEC DRIVEN.

Never hardcode:

• Threat confidence calculations
• Risk score calculations
• False positive rules
• Alert correlation rules
• Incident generation logic
• Threat intelligence scoring
• Organization permissions
• AI prompts
• Role permissions
• Dashboard calculations
• Notification events

Every security rule must exist inside this specification.

====================================================================
SYSTEM DESIGN PRINCIPLES
====================================================================

The platform must follow these principles:

AI Assisted

Explainable AI

Human Approval

Role Based Security

Organization Isolation

Scalable Architecture

REST APIs

Modular Backend

Secure Authentication

Auditable Activity

Every action must be traceable.

====================================================================
FINAL TECHNOLOGY STACK
====================================================================

FRONTEND
--------------------------------------------------

Framework

React 18

Bundler

Vite 6

Language

TypeScript

Routing

React Router DOM

State Management

TanStack Query

Context API

Networking

Axios

Realtime

Socket.IO Client

Styling

Tailwind CSS

UI Library

shadcn/ui

Icons

lucide-react

Charts

Recharts

Animation

Framer Motion

Notifications

react-hot-toast

Theme

Dark Mode
Light Mode

==================================================

BACKEND
--------------------------------------------------

Runtime

Node.js

Framework

Express.js

Language

JavaScript

Architecture

Modular MVC

Database

MongoDB Atlas

ODM

Mongoose

Validation

Zod

Authentication

JWT

Password Encryption

bcryptjs

Realtime

Socket.IO

Security

Helmet

CORS

Morgan

Compression

Rate Limiting

Cookie Parser

Environment Variables

dotenv

AI

OpenAI API

Deployment

Frontend

Vercel

Backend

Render

Database

MongoDB Atlas

====================================================================
ENVIRONMENT VARIABLES
====================================================================

SERVER VARIABLES

NODE_ENV

PORT

CLIENT_ORIGIN

MONGODB_URI

JWT_ACCESS_SECRET

JWT_REFRESH_SECRET

ACCESS_TOKEN_EXPIRES_IN

REFRESH_TOKEN_EXPIRES_IN

OPENAI_API_KEY

OPENAI_MODEL

SOCKET_PORT

SERVER_URL

CLIENT VARIABLES

VITE_API_URL

VITE_SOCKET_URL

Production must provide

MONGODB_URI

OPENAI_API_KEY

JWT_ACCESS_SECRET

JWT_REFRESH_SECRET

====================================================================
SYSTEM MODULES
====================================================================

The application consists of the following modules.

1.

Authentication Module

Handles

Registration

Login

JWT Authentication

Role Authorization

Password Reset

Session Validation

==============================================

2.

Organization Module

Handles

Organization Creation

Organization Settings

Organization Members

Organization Profile

Invitation Management

==============================================

3.

Security Integration Module

Handles

Security Data Sources

Connection Validation

API Integrations

Log Sources

Future Database Connectors

==============================================

4.

Alert Ingestion Engine

Receives alerts.

Validates alerts.

Stores alerts.

Triggers AI Analysis.

==============================================

5.

Threat Confidence Engine

Calculates

Threat Confidence Score

Risk Score

False Positive Likelihood

Classification

==============================================

6.

Threat Intelligence Engine

Matches

Malicious IP

Known Domains

Malware Hashes

Threat Feeds

Indicators of Compromise

==============================================

7.

Alert Correlation Engine

Groups related alerts.

Creates incidents.

Maintains investigation chains.

==============================================

8.

Incident Intelligence Engine

Generates

Executive Summary

Business Impact

Technical Summary

Recommended Actions

Investigation Notes

==============================================

9.

Investigation Workspace

Allows analysts to

Review alerts

View evidence

Track timeline

Resolve incidents

==============================================

10.

Executive Dashboard

Displays

Alert Statistics

Incident Statistics

Risk Distribution

Threat Confidence

Security Posture

==============================================

11.

Notification Engine

Publishes

Real-time updates

Incident creation

Alert updates

Incident resolution

==============================================

12.

Audit Logging Module

Stores

User Activity

Authentication Logs

Configuration Changes

Investigation History

====================================================================
PROJECT WORKFLOW
====================================================================

The complete platform workflow must follow this sequence.

Organization Registration

↓

User Authentication

↓

Organization Creation

↓

Security Source Configuration

↓

Alert Generation

↓

Alert Validation

↓

Alert Storage

↓

Threat Confidence Evaluation

↓

Threat Intelligence Matching

↓

Alert Correlation

↓

Incident Generation

↓

OpenAI Analysis

↓

Executive Report Generation

↓

SOC Investigation

↓

Containment Recommendation

↓

Incident Resolution

↓

Audit Logging

====================================================================
HIGH LEVEL SYSTEM ARCHITECTURE
====================================================================

                    Security Tools
                          │
         ───────────────────────────────────
         │             │            │
         │             │            │
     Firewall        EDR        Cloud Security
         │             │            │
         ──────────────┬────────────
                       │
               Alert Ingestion Engine
                       │
              Threat Confidence Engine
                       │
           Threat Intelligence Matching
                       │
             Alert Correlation Engine
                       │
              Incident Intelligence
                       │
                 OpenAI AI Analysis
                       │
              Investigation Workspace
                       │
              Executive Dashboard
                       │
                Organization Users

====================================================================
SUPPORTED SECURITY SOURCES
====================================================================

Demo Sources

Microsoft Defender

CrowdStrike

SentinelOne

Palo Alto Firewall

Cisco Secure

Splunk

Microsoft Sentinel

AWS GuardDuty

Google Security Command Center

Cloudflare

Email Security Gateway

Identity Provider

VPN Gateway

Future Connectors

Elastic SIEM

QRadar

Wazuh

Azure Sentinel

AWS Security Hub

Custom REST APIs

Syslog

Webhook Integrations

Database Connectors

====================================================================
SUPPORTED ATTACK TYPES
====================================================================

Brute Force Login

Credential Stuffing

Password Spray

Phishing Email

Business Email Compromise

Malware Execution

Ransomware

Privilege Escalation

Command & Control

Lateral Movement

Data Exfiltration

Suspicious PowerShell

SQL Injection

Cross Site Scripting

Remote Code Execution

Unauthorized Access

Impossible Travel

Credential Theft

Insider Threat

Cloud Misconfiguration

====================================================================
AUTHENTICATION & AUTHORIZATION
====================================================================

The system must implement enterprise-grade authentication.

Every authenticated user belongs to exactly one organization.

Every organization owns its own:

• Users
• Alerts
• Incidents
• Investigation Reports
• Security Integrations
• Dashboard Statistics

Organization data must never be visible to another organization.

====================================================================
AUTHENTICATION FEATURES
====================================================================

The authentication module must support:

• User Registration
• Secure Login
• JWT Access Tokens
• JWT Refresh Tokens
• Refresh Token Rotation
• Logout
• Session Validation
• Password Hashing
• Email Verification (Future)
• Forgot Password (Future)
• Reset Password (Future)
• Protected Backend APIs
• Protected Frontend Routes

====================================================================
REGISTRATION FLOW
====================================================================

When a new user registers:

Step 1

Validate

• Name
• Email
• Password
• Organization Name

↓

Step 2

Check whether email already exists.

↓

Step 3

Hash password using bcrypt.

↓

Step 4

Create Organization.

↓

Step 5

Create User.

↓

Step 6

Assign Organization Administrator role.

↓

Step 7

Generate JWT Access Token.

↓

Step 8

Generate Refresh Token.

↓

Step 9

Return authenticated session.

====================================================================
LOGIN FLOW
====================================================================

Login Process

User enters

Email

Password

↓

Server validates credentials.

↓

Password compared using bcrypt.

↓

Generate Access Token.

↓

Generate Refresh Token.

↓

Store Refresh Token securely.

↓

Return authenticated session.

====================================================================
LOGOUT FLOW
====================================================================

Logout must

Invalidate refresh token.

Clear cookies.

Destroy client session.

Record audit log.

====================================================================
PASSWORD REQUIREMENTS
====================================================================

Passwords must satisfy:

Minimum

8 characters

Recommended

12+

Must contain

Uppercase

Lowercase

Number

Special Character

Passwords must NEVER be stored in plain text.

Only bcrypt hashes are stored.

====================================================================
JWT STRUCTURE
====================================================================

Access Token Payload

User ID

Organization ID

Role

Issued Time

Expiration Time

Refresh Token Payload

User ID

Token Version

Issued Time

Expiration Time

====================================================================
SESSION MANAGEMENT
====================================================================

Every authenticated session stores

User

Organization

Role

Login Time

Last Activity

Refresh Token

Device Information (Future)

====================================================================
ROLE BASED ACCESS CONTROL
====================================================================

Supported Roles

1.

Super Administrator

System-wide administration.

Can

Manage every organization.

View global statistics.

Delete organizations.

Manage platform settings.

Manage AI settings.

Manage users.

===============================================

2.

Organization Administrator

Own organization only.

Can

Invite users.

Manage users.

Configure integrations.

View all alerts.

Resolve incidents.

Manage dashboard.

===============================================

3.

Security Officer

Can

View alerts.

Investigate incidents.

Approve containment.

View reports.

Manage investigations.

===============================================

4.

Security Team Member

Can

View alerts.

Investigate assigned incidents.

Update investigation notes.

Resolve assigned incidents.

===============================================

5.

Alert Source

Demo only.

Cannot login.

Can only generate demo alerts.

====================================================================
ROLE PERMISSIONS
====================================================================

Authentication APIs

Accessible by

Everyone

---------------------------------------

Organization APIs

Admin

Super Admin

---------------------------------------

User Management

Admin

Super Admin

---------------------------------------

Dashboard

Authenticated Users

---------------------------------------

Alerts

Security Officer

Security Team

Admin

---------------------------------------

Incident Resolution

Security Officer

Admin

---------------------------------------

Organization Settings

Admin

---------------------------------------

Platform Settings

Super Admin

====================================================================
AUTHORIZATION MIDDLEWARE
====================================================================

Every protected API must execute

Authentication Middleware

↓

Authorization Middleware

↓

Business Logic

If token is invalid

Return

401 Unauthorized

If user lacks permission

Return

403 Forbidden

====================================================================
USER MANAGEMENT
====================================================================

The platform must support

Create User

Update User

Delete User

Deactivate User

Activate User

Reset Password

Assign Roles

View Activity

Search Users

====================================================================
USER PROFILE
====================================================================

Each user profile contains

Full Name

Email

Role

Organization

Department

Phone Number

Profile Photo (Future)

Status

Last Login

Created Date

Updated Date

====================================================================
ORGANIZATION MANAGEMENT
====================================================================

Every organization represents one customer.

Organizations must be isolated.

No organization may access another organization's data.

====================================================================
ORGANIZATION FEATURES
====================================================================

Organization Registration

Organization Profile

Organization Members

Organization Logo

Security Settings

Subscription Information (Future)

Security Integrations

Audit History

====================================================================
ORGANIZATION PROFILE
====================================================================

Store

Organization Name

Industry

Country

State

City

Address

Organization Size

Email

Phone

Website

Logo

Security Contact

Created By

Created Date

====================================================================
TEAM MANAGEMENT
====================================================================

Organization Administrators can

Invite Users

Assign Roles

Remove Users

Deactivate Users

Transfer Ownership

Reset Passwords

====================================================================
INVITATION FLOW
====================================================================

Admin creates invitation.

↓

Invitation token generated.

↓

User receives invitation.

↓

Accept invitation.

↓

Account created.

↓

Assigned organization.

↓

Assigned role.

====================================================================
USER STATUS
====================================================================

Possible values

Active

Inactive

Pending Invitation

Suspended

Deleted

====================================================================
ACCOUNT SECURITY
====================================================================

The platform should support

Login Attempt Tracking

Failed Login Counter

Account Lock (Future)

MFA (Future)

Password Expiration (Future)

Device History (Future)

====================================================================
AUDIT LOGGING
====================================================================

Every authentication event must be logged.

Examples

Login

Logout

Registration

Password Change

Role Assignment

Profile Update

Organization Update

Failed Login

Token Refresh

====================================================================
DATABASE COLLECTIONS
====================================================================

MongoDB Collections

organizations

users

alerts

incidents

alertMappings

investigationReports

securityIntegrations

threatIntel

notifications

auditLogs

dashboardMetrics

activityLogs

====================================================================
COLLECTION

organizations
====================================================================

Fields

_id

organizationName

industry

country

state

city

address

email

phone

website

logo

securityContact

subscriptionPlan

status

createdBy

createdAt

updatedAt

====================================================================
COLLECTION

users
====================================================================

Fields

_id

organizationId

name

email

passwordHash

role

department

phone

status

lastLogin

refreshToken

createdAt

updatedAt

====================================================================
COLLECTION

securityIntegrations
====================================================================

Fields

_id

organizationId

integrationName

provider

connectionType

apiEndpoint

authenticationMethod

status

lastSync

createdBy

createdAt

updatedAt

====================================================================
COLLECTION RELATIONSHIPS
====================================================================

Organization

↓

Users

↓

Alerts

↓

Incidents

↓

Investigation Reports

↓

Notifications

↓

Audit Logs

Every document references

organizationId

to guarantee data isolation.

====================================================================
INDEXING REQUIREMENTS
====================================================================

Create indexes on

users.email

users.organizationId

alerts.organizationId

alerts.timestamp

alerts.severity

alerts.status

incidents.organizationId

incidents.priority

auditLogs.organizationId

notifications.organizationId

====================================================================
ALERT INGESTION ENGINE
====================================================================

The Alert Ingestion Engine is responsible for receiving, validating,
normalizing, enriching, and storing incoming security alerts before
they enter the Threat Confidence Evaluation Engine.

The ingestion pipeline must support both demo mode and production mode.

====================================================================
OBJECTIVES
====================================================================

The Alert Ingestion Engine must:

• Receive alerts from multiple security sources.
• Validate alert structure.
• Normalize incoming data.
• Remove duplicate alerts.
• Enrich alerts with organization context.
• Store alerts securely.
• Trigger Threat Confidence Evaluation.
• Trigger Threat Intelligence Matching.
• Trigger Alert Correlation.
• Generate incidents when necessary.
• Notify connected analysts.

====================================================================
SUPPORTED ALERT SOURCES
====================================================================

Demo Sources

• Microsoft Defender
• CrowdStrike
• SentinelOne
• Palo Alto Firewall
• Cisco Secure
• Splunk
• Microsoft Sentinel
• AWS GuardDuty
• Google Security Command Center
• Cloudflare
• Email Security Gateway

Future Sources

• Elastic SIEM
• IBM QRadar
• Wazuh
• Azure Sentinel
• AWS Security Hub
• Syslog
• REST APIs
• Webhooks
• Database Connectors

====================================================================
ALERT STRUCTURE
====================================================================

Every incoming alert must contain

alertId

organizationId

source

alertType

severity

timestamp

asset

hostname

deviceId

username

sourceIP

destinationIP

description

metadata

status

====================================================================
SUPPORTED ALERT TYPES
====================================================================

Authentication

• Failed Login
• Successful Login
• Impossible Travel
• Password Spray
• Credential Stuffing
• Brute Force Login

Endpoint

• Malware Detection
• Ransomware
• PowerShell Execution
• Registry Modification
• Privilege Escalation

Email

• Phishing Email
• Malicious Attachment
• Business Email Compromise

Network

• Port Scan
• Command & Control
• Data Exfiltration
• Lateral Movement
• DNS Tunneling

Cloud

• IAM Abuse
• New Admin User
• Public Bucket Exposure
• Unauthorized API Access

====================================================================
ALERT LIFECYCLE
====================================================================

Alert Received

↓

Validation

↓

Normalization

↓

Duplicate Detection

↓

Store Alert

↓

Threat Confidence Evaluation

↓

Threat Intelligence Matching

↓

Alert Correlation

↓

Incident Creation

↓

OpenAI Analysis

↓

SOC Dashboard

↓

Investigation

↓

Resolution

====================================================================
VALIDATION ENGINE
====================================================================

Every alert must be validated.

Required fields

organizationId

source

severity

timestamp

alertType

asset

description

Validation rules

• Severity must be valid.
• Timestamp must be valid.
• Organization must exist.
• Source must be supported.
• Alert Type must be supported.

Invalid alerts must be rejected.

====================================================================
NORMALIZATION ENGINE
====================================================================

Normalize

Severity

Critical

High

Medium

Low

Normalize

Source

Normalize

Hostname

Normalize

Username

Normalize

IP Address

Normalize

Timestamp

Store normalized values only.

====================================================================
DUPLICATE DETECTION
====================================================================

Duplicate alerts are detected using

organizationId

source

alertType

hostname

username

sourceIP

timestamp

Duplicate alerts should increase occurrence count instead of creating
new documents whenever appropriate.

====================================================================
ALERT STORAGE
====================================================================

Collection

alerts

Fields

_id

organizationId

alertId

source

severity

alertType

asset

hostname

deviceId

username

sourceIP

destinationIP

timestamp

description

metadata

status

riskScore

confidenceScore

falsePositiveLikelihood

classification

incidentId

createdAt

updatedAt

====================================================================
THREAT CONFIDENCE ENGINE
====================================================================

The Threat Confidence Engine evaluates every incoming alert.

It never claims absolute certainty.

Instead it calculates

Threat Confidence Score

Risk Score

False Positive Likelihood

Classification

====================================================================
OBJECTIVES
====================================================================

Reduce

Alert Fatigue

False Positives

Analyst Workload

Increase

Threat Accuracy

Incident Prioritization

Explainability

====================================================================
INPUTS
====================================================================

Severity

Source Reliability

Historical Incidents

Threat Intelligence

User Behaviour

Alert Correlation

Asset Criticality

Attack Pattern

False Positive Indicators

====================================================================
SEVERITY SCORING
====================================================================

Critical

+20

High

+15

Medium

+10

Low

+5

====================================================================
SOURCE RELIABILITY
====================================================================

Trusted Enterprise Vendors

Microsoft Defender

CrowdStrike

SentinelOne

Palo Alto

Cisco Secure

Microsoft Sentinel

AWS GuardDuty

Google SCC

Splunk

Trusted Sources

+10

Unknown Sources

+0

====================================================================
ASSET CRITICALITY
====================================================================

Critical Assets

Domain Controller

Financial Server

Production Database

Identity Server

Hospital Server

+20

High Value Assets

CEO Laptop

HR System

Finance System

+15

Normal Assets

Employee Laptop

Development Server

+8

Test Systems

+3

====================================================================
ATTACK PATTERN MATCHING
====================================================================

Known Patterns

Brute Force

Credential Stuffing

Password Spray

Malware

Privilege Escalation

Ransomware

Command & Control

PowerShell Abuse

Lateral Movement

Data Exfiltration

Pattern Match

+15

====================================================================
USER & ENTITY BEHAVIOR
====================================================================

Increase confidence if

Unusual Login Country

Outside Business Hours

Impossible Travel

Multiple Failed Logins

New Device

Privilege Changes

Abnormal Data Download

Maximum

+15

====================================================================
HISTORICAL INCIDENTS
====================================================================

Increase confidence if

Same User

Same Host

Same IP

Same Device

Same Malware

Same Attack Technique

Maximum

+15

====================================================================
THREAT INTELLIGENCE
====================================================================

Known Malicious IP

+10

Known Domain

+10

Known URL

+10

Known Malware Hash

+15

Known CVE Exploitation

+10

====================================================================
FALSE POSITIVE INDICATORS
====================================================================

Reduce confidence if

Whitelisted IP

Approved Maintenance Window

Known Backup Process

Security Scanner

Duplicate Alert

Trusted Automation

Approved Penetration Test

Previously Verified Safe Activity

Maximum Reduction

-30

====================================================================
THREAT CONFIDENCE CALCULATION
====================================================================

Threat Confidence Score

0–100

Risk Score

0–100

False Positive Likelihood

0–100%

The engine combines all weighted conditions.

Scores are normalized before storage.

====================================================================
CLASSIFICATION RULES
====================================================================

Confidence

85–100

Classification

Likely Genuine Threat

--------------------------------------------

Confidence

60–84

Classification

Requires Analyst Review

--------------------------------------------

Confidence

0–59

Classification

Likely False Positive

====================================================================
ALERT CORRELATION ENGINE
====================================================================

Related alerts should be grouped into one incident.

Correlation Conditions

Same User

Same Host

Same Device

Same Source IP

Same Destination IP

Same Attack Technique

Similar Timestamp

Same Organization

====================================================================
CORRELATION WINDOW
====================================================================

Default Window

30 Minutes

Configurable by Organization.

====================================================================
INCIDENT CREATION RULES
====================================================================

Create incident when

Threat Confidence

≥85

OR

Three or more correlated alerts exist.

Otherwise

Attach alert to existing incident.

====================================================================
INCIDENT PRIORITY
====================================================================

Critical

Risk Score ≥90

High

75–89

Medium

50–74

Low

Below 50

====================================================================
INCIDENT STATUS
====================================================================

Open

Investigating

Contained

Resolved

Closed

====================================================================
INCIDENT DOCUMENT
====================================================================

incidentId

organizationId

priority

status

alerts

summary

affectedAssets

confidenceScore

riskScore

assignedAnalyst

createdAt

updatedAt

====================================================================
OPENAI ANALYSIS ENGINE
====================================================================

OpenAI is NOT responsible for calculating scores.

The backend calculates

Threat Confidence

Risk Score

False Positive Likelihood

Correlation

Threat Intelligence

Behavior Analysis

OpenAI receives structured evidence.

====================================================================
OPENAI INPUT
====================================================================

Alert Metadata

Threat Confidence

Risk Score

Correlation Summary

Historical Context

Threat Intelligence

Asset Information

User Behaviour

====================================================================
OPENAI OUTPUT
====================================================================

Executive Summary

Technical Summary

AI Reasoning

Business Impact

Evidence Used

MITRE ATT&CK Technique

Recommended Analyst Actions

Containment Steps

Investigation Guidance

Executive Report

====================================================================
TRANSPARENCY REQUIREMENTS
====================================================================

Every AI response must explain

Why confidence increased.

Why confidence decreased.

Why the alert was classified.

Which evidence was used.

Never provide unexplained conclusions.

====================================================================
AI INVESTIGATION WORKSPACE
====================================================================

The AI Investigation Workspace is the primary environment where Security
Analysts investigate, analyze, document, contain, and resolve security
incidents.

The workspace must provide all investigation information in one unified
dashboard.

The AI must assist analysts but never automatically resolve incidents.

====================================================================
OBJECTIVES
====================================================================

The Investigation Workspace must allow analysts to:

• View incident details
• View correlated alerts
• Review AI reasoning
• Understand business impact
• View affected assets
• View attack timeline
• Track investigation progress
• Assign incidents
• Add investigation notes
• Record containment actions
• Resolve incidents
• Generate investigation reports

====================================================================
INCIDENT DETAILS PANEL
====================================================================

Display

Incident ID

Priority

Status

Threat Confidence Score

Risk Score

False Positive Likelihood

Classification

Created Time

Last Updated

Assigned Analyst

Organization

Affected Assets

Attack Type

Alert Count

====================================================================
CORRELATED ALERTS PANEL
====================================================================

Display

Alert ID

Alert Source

Severity

Alert Type

Timestamp

Source IP

Destination IP

Username

Hostname

Classification

Status

Allow analysts to

Expand alert

View metadata

Compare alerts

Open raw evidence

====================================================================
AI INVESTIGATION REPORT
====================================================================

OpenAI must generate

Executive Summary

Technical Summary

Attack Narrative

Threat Confidence Explanation

Business Impact

Evidence Summary

MITRE ATT&CK Mapping

Affected Assets

Likely Attack Stage

Potential Objectives

Containment Recommendations

Investigation Recommendations

Priority Justification

Analyst Checklist

====================================================================
INVESTIGATION TIMELINE
====================================================================

Timeline should display

Alert Generated

↓

Alert Ingested

↓

Threat Confidence Evaluated

↓

Threat Intelligence Matched

↓

Alert Correlated

↓

Incident Created

↓

AI Investigation Generated

↓

Analyst Assigned

↓

Containment Started

↓

Incident Resolved

Each event must display

Timestamp

User

Action

Notes

====================================================================
INVESTIGATION NOTES
====================================================================

Analysts can create

Private Notes

Shared Notes

Evidence Notes

Containment Notes

Resolution Notes

Every note stores

Author

Timestamp

Content

Attachments (Future)

====================================================================
CONTAINMENT ACTIONS
====================================================================

Possible containment actions

Block IP

Disable User

Reset Password

Force MFA

Quarantine Device

Block Domain

Remove Malware

Disable Service

Isolate Endpoint

Escalate Incident

Each action must record

Action

Executed By

Timestamp

Result

Comments

====================================================================
INCIDENT RESOLUTION
====================================================================

Resolution workflow

Open

↓

Investigating

↓

Contained

↓

Resolved

↓

Closed

Resolution must require

Resolution Summary

Root Cause

Lessons Learned

Analyst Confirmation

====================================================================
EXECUTIVE REPORTS
====================================================================

Generate reports for

Executive Teams

Security Officers

Organization Administrators

PDF reports must contain

Organization

Incident Summary

Incident Timeline

Business Impact

Affected Systems

Threat Confidence

Risk Score

Containment Actions

Resolution Summary

Recommendations

Generated Time

Generated By

====================================================================
DASHBOARD MODULE
====================================================================

The dashboard provides a real-time overview of the organization's
cybersecurity posture.

====================================================================
DASHBOARD CARDS
====================================================================

Display

Total Alerts

Critical Alerts

Open Incidents

Resolved Incidents

Threat Confidence Average

Average Risk Score

False Positive Rate

Incident Response Time

Security Health Score

Protected Assets

====================================================================
CHARTS
====================================================================

Severity Distribution

Incident Trend

Alert Trend

Threat Confidence Distribution

Risk Score Distribution

False Positive Trend

Incident Resolution Trend

Top Attack Types

Top Affected Assets

Alert Sources

====================================================================
RECENT ALERTS TABLE
====================================================================

Columns

Alert ID

Severity

Source

Alert Type

Risk Score

Threat Confidence

Classification

Timestamp

Status

Actions

====================================================================
RECENT INCIDENTS TABLE
====================================================================

Columns

Incident ID

Priority

Status

Alert Count

Assigned Analyst

Threat Confidence

Risk Score

Created

Updated

Actions

====================================================================
THREAT INTELLIGENCE DASHBOARD
====================================================================

Display

Known Malicious IPs

Known Domains

Known URLs

Known Malware Hashes

Known CVEs

Threat Feed Status

IOC Matches Today

Threat Feed Last Updated

====================================================================
NOTIFICATION SYSTEM
====================================================================

Generate notifications when

Alert Created

Incident Created

Threat Confidence Updated

Incident Assigned

Containment Started

Incident Resolved

User Invited

Integration Connected

Organization Created

Notifications contain

Title

Description

Priority

Timestamp

Read Status

Related Entity

====================================================================
REALTIME COMMUNICATION
====================================================================

Socket.IO must broadcast

new_alert

alert_updated

incident_created

incident_updated

incident_assigned

incident_resolved

dashboard_updated

notification_created

organization_updated

====================================================================
SOCKET.IO CLIENT BEHAVIOR
====================================================================

When an event is received

Show toast notification

Refresh dashboard

Refresh alerts

Refresh incidents

Refresh investigation page

Refresh notifications

Invalidate React Query cache

====================================================================
FRONTEND ROUTES
====================================================================

Public Routes

/login

/register

====================================================================

Protected Routes

/dashboard

/alerts

/alerts/:id

/incidents

/incidents/:id

/investigation/:id

/reports

/integrations

/organizations

/users

/settings

/profile

====================================================================
MAIN APPLICATION LAYOUT
====================================================================

Protected layout includes

Sidebar

Top Navigation

Organization Switcher (Future)

Notifications

Search

Dark Mode Toggle

Profile Menu

Logout

====================================================================
SIDEBAR MODULES
====================================================================

Dashboard

Alerts

Incidents

Investigation

Threat Intelligence

Reports

Users

Organizations

Integrations

Audit Logs

Settings

====================================================================
BACKEND API ROUTES
====================================================================

Health

GET /health

====================================================================

Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/refresh

POST /api/auth/logout

GET /api/auth/me

====================================================================

Organizations

GET /api/organizations

POST /api/organizations

PUT /api/organizations/:id

DELETE /api/organizations/:id

====================================================================

Users

GET /api/users

POST /api/users

PUT /api/users/:id

DELETE /api/users/:id

====================================================================

Alerts

GET /api/alerts

GET /api/alerts/:id

POST /api/alerts

PUT /api/alerts/:id

DELETE /api/alerts/:id

POST /api/alerts/simulate

====================================================================

Threat Confidence

POST /api/threat-confidence/evaluate

GET /api/threat-confidence/:alertId

====================================================================

Threat Intelligence

GET /api/threat-intelligence

POST /api/threat-intelligence/sync

====================================================================

Incidents

GET /api/incidents

GET /api/incidents/:id

PUT /api/incidents/:id

POST /api/incidents/assign

POST /api/incidents/resolve

====================================================================

Investigation

POST /api/investigation/analyze

GET /api/investigation/:incidentId

POST /api/investigation/report

====================================================================

Dashboard

GET /api/dashboard

====================================================================

Reports

GET /api/reports

POST /api/reports

GET /api/reports/:id

GET /api/reports/:id/download

====================================================================

Notifications

GET /api/notifications

PUT /api/notifications/:id/read

====================================================================

Audit Logs

GET /api/audit-logs

====================================================================
MONGODB SCHEMAS
====================================================================

The backend must use Mongoose ODM.

Every collection must include

createdAt

updatedAt

using timestamps.

Every organization-owned document must contain

organizationId

for strict multi-tenant isolation.

====================================================================
USER SCHEMA
====================================================================

Fields

organizationId

name

email

passwordHash

role

department

phone

status

lastLogin

refreshToken

avatar

createdAt

updatedAt

====================================================================
ORGANIZATION SCHEMA
====================================================================

Fields

organizationName

industry

country

state

city

address

website

email

phone

logo

securityContact

status

createdBy

createdAt

updatedAt

====================================================================
ALERT SCHEMA
====================================================================

Fields

organizationId

alertId

source

severity

alertType

hostname

deviceId

username

sourceIP

destinationIP

asset

description

metadata

riskScore

threatConfidenceScore

falsePositiveLikelihood

classification

incidentId

status

createdAt

updatedAt

====================================================================
INCIDENT SCHEMA
====================================================================

Fields

organizationId

incidentId

title

priority

status

summary

affectedAssets

alerts

assignedAnalyst

riskScore

threatConfidenceScore

classification

containmentActions

resolutionSummary

createdAt

updatedAt

====================================================================
INVESTIGATION REPORT SCHEMA
====================================================================

Fields

organizationId

incidentId

executiveSummary

technicalSummary

businessImpact

aiReasoning

evidenceUsed

mitreMapping

containmentRecommendations

recommendedActions

generatedBy

generatedAt

====================================================================
THREAT INTELLIGENCE SCHEMA
====================================================================

Fields

organizationId

indicatorType

indicator

source

confidence

severity

description

firstSeen

lastSeen

status

====================================================================
SECURITY INTEGRATION SCHEMA
====================================================================

Fields

organizationId

provider

integrationName

authenticationType

apiEndpoint

connectionStatus

lastSync

createdBy

createdAt

updatedAt

====================================================================
NOTIFICATION SCHEMA
====================================================================

Fields

organizationId

userId

title

message

priority

type

relatedEntity

isRead

createdAt

====================================================================
AUDIT LOG SCHEMA
====================================================================

Fields

organizationId

userId

action

resource

description

ipAddress

userAgent

createdAt

====================================================================
SYSTEM SERVICES
====================================================================

The backend must be modular.

Required Services

Authentication Service

Organization Service

Alert Ingestion Service

Threat Confidence Engine

Threat Intelligence Service

Alert Correlation Engine

Incident Service

Investigation Service

Notification Service

Dashboard Service

Audit Service

OpenAI Service

====================================================================
APPLICATION FOLDER STRUCTURE
====================================================================

Client

src

components

pages

layouts

hooks

contexts

services

api

utils

assets

types

styles

====================================================================

Server

src

config

controllers

routes

middlewares

models

services

engines

utils

validators

prompts

socket

database

scripts

====================================================================
AI SERVICE
====================================================================

OpenAI must be used only for reasoning.

OpenAI must NEVER

Authenticate users

Store data

Create incidents

Calculate risk scores

Calculate threat confidence

Create database records

The backend always remains the source of truth.

====================================================================
OPENAI RESPONSIBILITIES
====================================================================

Generate

Executive Summary

Technical Summary

Incident Narrative

Business Impact

MITRE ATT&CK Mapping

Containment Recommendations

Investigation Guidance

Executive Report

Analyst Notes

====================================================================
AI PROMPT RULES
====================================================================

Every prompt must include

Alert Metadata

Risk Score

Threat Confidence

Correlation Summary

Historical Context

Threat Intelligence

Asset Information

Behavior Analysis

The AI response must always explain

Why the alert appears malicious.

Which evidence supports the conclusion.

Which evidence reduced confidence.

Never fabricate evidence.

Never claim certainty.

====================================================================
SECURITY REQUIREMENTS
====================================================================

Passwords

bcrypt hashing

JWT

Access Token

Refresh Token

Refresh Token Rotation

HTTP-only Cookies

Role-based Authorization

Helmet

Compression

CORS

Rate Limiting

Input Validation

Zod Validation

Environment Variable Validation

Never expose secrets.

Never expose MongoDB URI.

Never expose OpenAI API Key.

Never expose JWT secrets.

====================================================================
ENVIRONMENT VARIABLES
====================================================================

Backend

NODE_ENV

PORT

CLIENT_URL

MONGODB_URI

JWT_ACCESS_SECRET

JWT_REFRESH_SECRET

ACCESS_TOKEN_EXPIRES_IN

REFRESH_TOKEN_EXPIRES_IN

OPENAI_API_KEY

SOCKET_PORT

====================================================================

Frontend

VITE_API_URL

VITE_SOCKET_URL

====================================================================
ERROR HANDLING
====================================================================

Every API response must follow

success

message

data

errors

timestamp

Example

{
 success: true,
 message: "...",
 data: {},
 errors: [],
 timestamp: "..."
}

====================================================================
LOGGING
====================================================================

Log

Authentication

Alert Ingestion

Incident Creation

Threat Evaluation

Threat Intelligence

OpenAI Calls

Errors

Socket Events

Audit Events

====================================================================
SEED DATA
====================================================================

Create

Demo Organization

Organization Administrator

Security Officer

Security Team Member

Sample Alerts

Sample Incidents

Sample Threat Intelligence

Sample Notifications

Demo Login

Email

admin@civicshield.ai

Password

Admin@123

====================================================================
UI REQUIREMENTS
====================================================================

The application must look like a professional Security Operations Center.

Avoid consumer-style interfaces.

Must support

Dark Theme

Light Theme

Responsive Design

Loading States

Error States

Skeleton Loaders

Charts

Data Tables

Status Badges

Toast Notifications

Search

Filtering

Sorting

Pagination

====================================================================
DESIGN PRINCIPLES
====================================================================

The interface should prioritize

Operational Efficiency

Clear Visibility

Minimal Clicks

Fast Navigation

Readable Data

Professional Appearance

====================================================================
FINAL USER JOURNEY
====================================================================

A new organization should be able to

Register

↓

Login

↓

Create Organization

↓

Invite Team Members

↓

Configure Security Integration

↓

Generate Demo Alerts

↓

Receive Security Alerts

↓

Run Threat Confidence Evaluation

↓

View AI Analysis

↓

Review Correlated Incidents

↓

Investigate Incident

↓

Execute Containment

↓

Resolve Incident

↓

Generate Executive Report

↓

Review Dashboard Analytics

====================================================================
SECURITY INTEGRATION MODULE
====================================================================

The Security Integration Module enables organizations to securely connect
their existing cybersecurity infrastructure to CivicShield AI.

The objective is to eliminate manual alert uploads by automatically
ingesting security events from the organization's existing security
products.

This is a production feature.

====================================================================
SUPPORTED INTEGRATIONS
====================================================================

Organizations can connect

• PostgreSQL
• MySQL
• MongoDB
• Microsoft SQL Server
• REST APIs
• Webhooks
• SIEM Platforms
• EDR Platforms
• Cloud Security Platforms

Future

• Splunk
• Microsoft Sentinel
• Elastic SIEM
• IBM QRadar
• Wazuh
• AWS Security Hub

====================================================================
CONNECTION WORKFLOW
====================================================================

Organization Administrator

↓

Open Integrations Page

↓

Select Integration Type

↓

Enter Connection Details

↓

Validate Connection

↓

Save Secure Configuration

↓

Enable Scheduled Synchronization

↓

Background Scheduler Starts

↓

Security Alerts Imported

↓

Threat Confidence Engine Starts

↓

Alert Correlation Engine Starts

↓

Incident Created

====================================================================
DATABASE CONNECTION DETAILS
====================================================================

The administrator may configure

Integration Name

Database Type

Host

Port

Database Name

Username

Encrypted Password

SSL Enabled

Collection or Table Name

Alert Query

Synchronization Enabled

Synchronization Interval

====================================================================
CONNECTION VALIDATION
====================================================================

Before saving

Validate

Database Reachability

Authentication

Table Exists

Required Fields Exist

Read Permissions

If validation fails

Return detailed validation error.

Never save invalid configurations.

====================================================================
SCHEDULED SYNCHRONIZATION
====================================================================

The backend scheduler periodically checks connected data sources.

Default Interval

Every 60 Seconds

Configurable

30 Seconds

1 Minute

5 Minutes

15 Minutes

Every synchronization

Reads only new alerts.

Duplicate alerts must never be imported.

====================================================================
INGESTION RULES
====================================================================

Imported alerts immediately enter

Validation

↓

Normalization

↓

Threat Confidence Evaluation

↓

Threat Intelligence

↓

Correlation

↓

Incident Creation

↓

Dashboard

Organizations never manually analyze alerts.

The entire workflow is automated.

====================================================================
ALERT SOURCE (HACKATHON DEMO MODULE)
====================================================================

The Alert Source module exists exclusively for demonstration purposes
during the hackathon.

Real organizations will not use this module.

Instead, production deployments will receive alerts directly from
connected security databases and security products.

====================================================================
PURPOSE
====================================================================

Because judges do not have access to enterprise security systems,
the Alert Source module generates realistic synthetic security alerts.

This demonstrates the complete CivicShield AI workflow without requiring
external integrations.

====================================================================
FEATURES
====================================================================

The module allows users to

Generate Single Alert

Generate Multiple Alerts

Generate Attack Chain

Generate Random Alerts

Clear Demo Alerts

Reset Demo Environment

====================================================================
SUPPORTED DEMO ALERTS
====================================================================

Brute Force Login

Credential Stuffing

Phishing Email

Malware Detection

Ransomware Activity

PowerShell Execution

Privilege Escalation

Suspicious Login

Impossible Travel

Data Exfiltration

Lateral Movement

Command and Control

DNS Tunneling

Unauthorized USB Device

Cloud Misconfiguration

====================================================================
RANDOM ALERT GENERATION
====================================================================

The generator randomly creates

Severity

Timestamp

Source

User

Asset

Hostname

IP Address

Attack Type

Metadata

The generated alerts closely resemble alerts produced by enterprise
security products.

====================================================================
DEMO WORKFLOW
====================================================================

User clicks

Generate Alerts

↓

Alert Source inserts alerts into MongoDB

↓

Background Scheduler detects new alerts

↓

Alert Ingestion Engine validates alerts

↓

Threat Confidence Engine evaluates alerts

↓

Threat Intelligence Matching

↓

Alert Correlation

↓

Incident Creation

↓

OpenAI Investigation Report

↓

Dashboard Updates

↓

Socket.IO broadcasts live events

====================================================================
IMPORTANT NOTE
====================================================================

The Alert Source module is enabled only for demonstration and testing.

Production organizations are expected to receive alerts exclusively
through configured Security Integrations.

This module can be disabled through application configuration.

====================================================================
VERIFICATION CHECKLIST
====================================================================

Before considering the project complete

✓ MongoDB Atlas connection succeeds

✓ Express server starts successfully

✓ Client builds successfully

✓ Authentication works

✓ JWT authentication works

✓ Organization creation works

✓ User registration works

✓ User login works

✓ Role-based authorization works

✓ Protected APIs reject unauthorized requests

✓ Demo alert generation works

✓ Alert ingestion works

✓ Threat Confidence Engine works

✓ Risk Score calculation works

✓ False Positive calculation works

✓ Alert Correlation Engine works

✓ Incident creation works

✓ OpenAI investigation report generation works

✓ Dashboard loads live metrics

✓ Notifications work

✓ Socket.IO real-time updates work

✓ Investigation workspace functions correctly

✓ Executive PDF reports generate successfully

✓ Audit logs are recorded

✓ Multi-tenant organization isolation works

✓ All API endpoints return standardized responses

✓ No hardcoded credentials exist

✓ No secrets are exposed

✓ Project deploys successfully on production

====================================================================
FINAL EXPECTED OUTCOME
====================================================================

CivicShield AI should function as a complete AI-powered Cyber Defense
Platform built for Government Departments, Educational Institutions,
Hospitals, NGOs, Small Businesses, Municipal Offices, and other public
service organizations that lack dedicated Security Operations Centers.

The platform must intelligently ingest security alerts, evaluate threat
confidence using deterministic backend logic, correlate related alerts
into incidents, generate explainable AI-powered investigation reports,
assist analysts with transparent recommendations, and provide a
real-time Security Operations dashboard.

The system must remain human-in-the-loop, where AI augments analyst
decision-making rather than replacing it, ensuring every conclusion is
explainable, evidence-backed, auditable, and suitable for real-world
cybersecurity operations.

====================================================================
END OF SPECIFICATION
CivicShield AI
Spec Version 1.0
====================================================================