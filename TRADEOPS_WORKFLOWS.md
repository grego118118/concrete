# TradeOps Command Center Workflows

This document outlines the operational workflows for the TradeOps Command Center, designed for Pioneer Concrete Coatings. These workflows integrate the automated lead scraper, website forms, and the proposed CRM system features.

## 1. Lead Acquisition & Qualification Workflow

**Goal:** Capture, centralize, and qualify all inbound and outbound leads.

### 1.1 Inbound Leads (Website)
1.  **Lead Submission**: Customer fills out the "Get a Free Quote" form on `pioneerconcretecoatings.com`.
    -   **Data Captured**: Name, Email, Phone, Project Type (Garage/Basement/Patio), Estimated Sq Ft, Timeline.
2.  **CRM Ingestion**:
    -   Web form webhook triggers CRM API.
    -   **Action**: Create new "Lead" record in CRM.
    -   **Status**: Set to `New`.
    -   **Notification**: Instant email/SMS alert sent to Sales Rep/Admin.
3.  **Auto-Response**:
    -   CRM sends an automated "Receipt Confirmation" email to the lead.
    -   **Content**: "Thanks for your interest! A project manager will contact you within 24 hours."

### 1.2 Outbound Prospects (Scraper)
1.  **Data Collection**:
    -   Operator runs `scraper/scraper.py` targeting specific categories (e.g., "Auto body shop", "Warehouse") in target cities.
    -   **Data Captured**: Business Name, Phone, Website, Email (if available).
    -   **Output**: `leads.csv`.
2.  **Data Import & Deduplication**:
    -   Import `leads.csv` into CRM "Prospects" list.
    -   **Auto-Filter**: Remove duplicates based on Phone/Email/Business Name against existing database.
3.  **Enrichment (Optional)**:
    -   Manual or automated look-up of decision-maker names (LinkedIn/Website).
4.  **Status Assignment**: Set to `Prospect - Uncontacted`.

### 1.3 Lead Qualification (Triage)
1.  **Initial Contact**:
    -   **Inbound**: Sales Rep calls lead within 1 hour.
    -   **Outbound**: Sales Rep initiates cold call or email sequence.
2.  **Qualification Criteria**:
    -   Confirm project scope (Residential vs. Commercial).
    -   Verify timeline (Immediate need vs. Future planning).
    -   Assess budget/authority.
3.  **Outcome & Status Update**:
    -   *Qualified*: Set status to `Qualified`. Schedule **On-Site Estimation**.
    -   *Not Ready*: Set status to `Nurture` (add to monthly newsletter).
    -   *Disqualified*: Set status to `Lost` (Reason: Out of area, Budget, etc.).

---

## 2. Sales Pipeline & Estimation Workflow

**Goal:** Convert qualified leads into signed contracts efficiently.

### 2.1 On-Site Estimation
1.  **Scheduling**:
    -   Rep opens CRM Calendar.
    -   Selects available slot for "Site Assessment".
    -   **Notification**: Confirmation email + Calendar Invite sent to Lead.
    -   **Reminder**: 24h SMS reminder sent automatically.
2.  **Site Visit**:
    -   Rep arrives at customer location.
    -   **Measurement**: Measures square footage of the area.
    -   **Assessment**: Checks concrete condition (cracks, pitting, moisture).
    -   **Consultation**: Shows samples (Color flakes, Polyaspartic vs Epoxy).

### 2.2 Quote Generation
1.  **Drafting Quote (CRM)**:
    -   Rep opens "Quote Generator" in CRM App (Mobile/Tablet).
    -   **Inputs**:
        -   Measured Sq Ft.
        -   Base Price per Sq Ft (auto-calculated).
        -   Add-ons: Crack Repair (Lin Ft), Vertical Walls, Moisture Barrier.
        -   Selected Flake Color/System.
    -   **Discount**: Rep applies any active promotions.
2.  **Review & Send**:
    -   CRM generates PDF Quote with Pioneer branding.
    -   **Action**: "Send Quote" button triggers email with secure view link.
    -   **Status**: Lead moves to `Proposal Sent`.

### 2.3 Closing
1.  **Follow-Up Automation**:
    -   **Day 1**: If not viewed, resend email.
    -   **Day 3**: Automated "Do you have any questions?" email.
    -   **Day 7**: Task created for Rep to call.
2.  **Customer Action**:
    -   Customer clicks "Approve Quote" in the email.
    -   Customer e-signs the contract.
    -   Customer pays Deposit (e.g., 50%) via integrated payment link (Stripe/Square).
3.  **Deal Won**:
    -   CRM Status updates to `Won / Deposit Paid`.
    -   **Notification**: "New Job Sold!" alert to team.
    -   **Trigger**: Move to **Project Fulfillment Workflow**.

---

## 3. Job Fulfillment & Operations Workflow

**Goal:** Deliver high-quality installation on time and on budget.

### 3.1 Pre-Job Planning
1.  **Job Scheduling**:
    -   Ops Manager receives "New Job" alert.
    -   Checks CRM "Installation Calendar" for crew availability.
    -   Assigns Crew Lead and installation dates.
    -   **Status**: Project moves to `Scheduled`.
2.  **Material Procurement**:
    -   System calculates required materials based on Quote (e.g., 2 kits of Basecoat, 50lbs Flake).
    -   **Inventory Check**: Auto-deduct from stock or create "Order List" if low.
3.  **Customer Notification**:
    -   Automated "Project Confirmation" email sending:
        -   Installation Dates.
        -   "How to Prep" guide (Clear items, etc.).
        -   Crew Arrival Time.

### 3.2 Installation Execution
1.  **Day 1 (Prep & Base)**:
    -   Crew arrives, checks in via CRM Mobile App.
    -   **Safety Check**: Verify concrete moisture/hardness.
    -   **Execution**: Grind floor, repair cracks, apply basecoat + chip broadcast.
    -   **Progress**: Upload "Before" and "During" photos to Project Record.
2.  **Day 2 (Topcoat)**:
    -   **Execution**: Scrape excess chips, apply clear polyaspartic topcoat.
    -   **Completion**: Upload "After" photos.
    -   **Customer Walkthrough**: Crew Lead walks customer through finished floor.
    -   **Sign-Off**: Customer signs "Completion Certificate" on tablet.
3.  **Payment Collection**:
    -   CRM auto-sends Final Invoice (Remaining 50%).
    -   Rep collects payment on-site or customer pays online.

### 3.3 Project Closeout
1.  **Status Update**: Project moves to `Completed`.
2.  **Costing Analysis**:
    -   Compare Estimated vs Actual materials used.
    -   Log labor hours.
    -   Calculate Job Profitability Report.

---

## 4. Post-Job & Retention Workflow

**Goal:** Generate reviews, referrals, and repeat business.

### 4.1 Implementation & Review
1.  **Review Request**:
    -   **Trigger**: 24 hours after `Completed` status.
    -   **Action**: Automated email/SMS: "How do you love your new floor?"
    -   **Flow**:
        -   *Positive (4-5 Star)*: Redirect to Google Business Profile for public review.
        -   *Negative (1-3 Star)*: Redirect to internal feedback form (Sales Manager alert).
2.  **Referral Prompt**:
    -   **Trigger**: 7 days after completion.
    -   **Action**: Send "Refer a Friend" offer ($100 referral bonus).

### 4.2 Long-Term Nurture
1.  **Maintenance Reminders**:
    -   **Trigger**: 12 months after completion.
    -   **Action**: Email "Annual Maintenance Tips" + "Referral Reminder".
2.  **Cross-Sell**:
    -   If Garage done -> Suggest Basement/Patio after 6 months.
    -   Send "Seasonal Discount" for returning customers.

