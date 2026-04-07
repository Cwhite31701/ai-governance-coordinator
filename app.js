/* ============================================================
   AIGC — AI Governance Coordinator  |  app.js
   ============================================================ */

// ─── Navigation ─────────────────────────────────────────────
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  const navItem = document.getElementById('nav-' + pageId);
  if (navItem) navItem.classList.add('active');

  // Trigger page-specific animations
  if (pageId === 'dashboard') animateKPIs();
  if (pageId === 'opportunities') renderOpportunities();
  if (pageId === 'pipeline') renderFullKanban();
  if (pageId === 'governance') initGovernance();
  if (pageId === 'processes') renderProcessMap('sales');
  if (pageId === 'reports') animateGauge();
}

// Wire up nav clicks
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    switchPage(item.dataset.page);
  });
});

// ─── KPI Counter Animations ──────────────────────────────────
function animateKPIs() {
  // Animate AI Opportunity Score (special treatment)
  animateNumber('opp-score', 0, 78, 1200, v => {
    document.getElementById('score-fill').style.width = (v * 0.78) + '%';
  });

  // Animate all count-animate spans
  document.querySelectorAll('.count-animate').forEach(el => {
    const target = parseInt(el.dataset.target, 10) || 0;
    animateNumber(el.id || null, 0, target, 1400, null, el);
  });
}

function animateNumber(id, from, to, duration, onTick, directEl) {
  const el = directEl || document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const current = Math.round(from + (to - from) * eased);
    el.textContent = to >= 1000 ? current.toLocaleString() : current;
    if (onTick) onTick(current);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Opportunity Cards ───────────────────────────────────────
const OPPORTUNITIES = [
  {
    icon: '📧',
    title: 'Email Follow-Up Automation',
    dept: 'Sales',
    role: 'Account Executive',
    hrsSaved: 6,
    savings: 1800,
    impact: 'HIGH',
    difficulty: 'MEDIUM',
    risk: 2,
    tag: 'Quick Win',
    tools: 'Make.com + OpenAI → HubSpot',
    compliance: 'No PII involved — low risk',
    status: 'approved',
    category: 'email',
    deptKey: 'sales'
  },
  {
    icon: '🗂',
    title: 'CRM Data Entry Bot',
    dept: 'Sales',
    role: 'SDR',
    hrsSaved: 5,
    savings: 1500,
    impact: 'HIGH',
    difficulty: 'LOW',
    risk: 2,
    tag: 'Quick Win',
    tools: 'Zapier + Claude API → Salesforce',
    compliance: 'No PII involved — low risk',
    status: 'in-pipeline',
    category: 'crm',
    deptKey: 'sales'
  },
  {
    icon: '🎙',
    title: 'Meeting Notes Extractor',
    dept: 'Operations',
    role: 'All Roles',
    hrsSaved: 3,
    savings: 900,
    impact: 'MEDIUM',
    difficulty: 'LOW',
    risk: 1,
    tag: 'Quick Win',
    tools: 'Zoom → Whisper API → Notion',
    compliance: 'Internal only — compliant',
    status: 'approved',
    category: 'meetings',
    deptKey: 'ops'
  },
  {
    icon: '📄',
    title: 'Invoice Classification AI',
    dept: 'Finance',
    role: 'Analyst',
    hrsSaved: 2,
    savings: 600,
    impact: 'MEDIUM',
    difficulty: 'MEDIUM',
    risk: 3,
    tag: null,
    tools: 'Gmail → Claude API → QuickBooks',
    compliance: 'Financial data — moderate risk',
    status: 'identified',
    category: 'documents',
    deptKey: 'finance'
  },
  {
    icon: '👤',
    title: 'Candidate Screening Pre-Filter',
    dept: 'HR',
    role: 'Recruiter',
    hrsSaved: 3,
    savings: 900,
    impact: 'MEDIUM',
    difficulty: 'HIGH',
    risk: 7,
    tag: 'Strategic Bet',
    tools: 'Greenhouse → Claude API → Slack',
    compliance: '⚠ EEOC compliance required — human must decide',
    status: 'identified',
    category: 'documents',
    deptKey: 'hr'
  },
  {
    icon: '🎫',
    title: 'Customer Support Ticket Triage',
    dept: 'Operations',
    role: 'Support Rep',
    hrsSaved: 4,
    savings: 1200,
    impact: 'HIGH',
    difficulty: 'MEDIUM',
    risk: 3,
    tag: null,
    tools: 'Zendesk → Claude API → Slack',
    compliance: 'Customer data — review PII policy',
    status: 'identified',
    category: 'email',
    deptKey: 'ops'
  },
  {
    icon: '🤖',
    title: 'Internal Policy Chatbot',
    dept: 'HR',
    role: 'All Employees',
    hrsSaved: 2,
    savings: 600,
    impact: 'MEDIUM',
    difficulty: 'HIGH',
    risk: 2,
    tag: 'Strategic Bet',
    tools: 'Slack → Claude + Pinecone → HR docs',
    compliance: 'No PII stored — compliant',
    status: 'identified',
    category: 'crm',
    deptKey: 'hr'
  }
];

function impactClass(impact) {
  return impact === 'HIGH' ? 'high' : impact === 'MEDIUM' ? 'medium' : 'low';
}
function riskClass(risk) {
  if (risk <= 3) return 'low';
  if (risk <= 6) return 'med';
  return 'high';
}
function riskLabel(risk) {
  if (risk <= 3) return `${risk}/10 — LOW`;
  if (risk <= 6) return `${risk}/10 — MEDIUM`;
  return `${risk}/10 — HIGH`;
}

function renderOpportunities() {
  const deptFilter = document.getElementById('opp-filter-dept')?.value || 'all';
  const impactFilter = document.getElementById('opp-filter-impact')?.value || 'all';

  const filtered = OPPORTUNITIES.filter(o => {
    const deptMatch = deptFilter === 'all' || o.deptKey === deptFilter;
    const impactMatch = impactFilter === 'all' || o.impact.toLowerCase() === impactFilter;
    return deptMatch && impactMatch;
  });

  const grid = document.getElementById('opp-cards-grid');
  if (!grid) return;

  grid.innerHTML = filtered.map((opp, i) => `
    <div class="opp-card" data-index="${i}">
      <div class="opp-card-header">
        <span class="opp-card-icon">${opp.icon}</span>
        <div>
          <div class="opp-card-title">${opp.title}</div>
          <div class="opp-card-sub">${opp.dept} · ${opp.role}</div>
        </div>
        ${opp.tag ? `<span class="opp-tag ${opp.tag === 'Quick Win' ? 'tag-qw' : 'tag-sb'}">${opp.tag}</span>` : ''}
      </div>
      <div class="opp-card-stats">
        <div class="opp-stat">
          <span class="stat-label">⏱ Time Saved</span>
          <span class="stat-val">${opp.hrsSaved} hrs/wk</span>
        </div>
        <div class="opp-stat">
          <span class="stat-label">💰 Est. Savings</span>
          <span class="stat-val">$${opp.savings.toLocaleString()}/mo</span>
        </div>
        <div class="opp-stat">
          <span class="stat-label">⚡ Impact</span>
          <span class="impact ${impactClass(opp.impact)}">${opp.impact}</span>
        </div>
        <div class="opp-stat">
          <span class="stat-label">🔧 Difficulty</span>
          <span class="stat-val">${opp.difficulty}</span>
        </div>
        <div class="opp-stat full">
          <span class="stat-label">🛡 Risk Score</span>
          <span class="risk-badge ${riskClass(opp.risk)}">${riskLabel(opp.risk)}</span>
        </div>
      </div>
      <div class="opp-card-tools">
        <span class="tools-label">Suggested:</span> ${opp.tools}
      </div>
      <div class="opp-card-compliance">${opp.compliance}</div>
      <div class="opp-card-actions">
        <button class="btn btn-sm btn-ghost" onclick="showToast('Viewing details for: ${opp.title} 📋')">View Details</button>
        <button class="btn btn-sm btn-primary" onclick="addToPipeline(this, '${opp.title}')">Add to Plan ▶</button>
      </div>
    </div>
  `).join('');

  // Wire up filters
  document.getElementById('opp-filter-dept')?.addEventListener('change', renderOpportunities);
  document.getElementById('opp-filter-impact')?.addEventListener('change', renderOpportunities);
}

function addToPipeline(btn, title) {
  btn.textContent = '✓ In Pipeline';
  btn.classList.remove('btn-primary');
  btn.classList.add('btn-success');
  btn.disabled = true;
  showToast(`"${title}" added to Automation Pipeline! 🚀`);
}

// ─── Full Kanban Board ───────────────────────────────────────
const KANBAN_DATA = {
  identified: [
    { dept: 'Sales', title: 'LinkedIn lead enrichment', risk: 'low' },
    { dept: 'HR', title: 'Onboarding task automation', risk: 'med' },
    { dept: 'Marketing', title: 'Ad performance reporter', risk: 'low' },
    { dept: 'Finance', title: 'Expense categorization', risk: 'low' },
    { dept: 'Ops', title: 'Inventory alert system', risk: 'med' },
    { dept: 'Sales', title: 'Proposal generation bot', risk: 'low' },
    { dept: 'HR', title: 'Benefits FAQ chatbot', risk: 'low' },
    { dept: 'Ops', title: 'Vendor contract summarizer', risk: 'med' }
  ],
  approved: [
    { dept: 'Ops', title: 'Invoice classification AI', risk: 'low' },
    { dept: 'Marketing', title: 'Social post scheduling', risk: 'low' },
    { dept: 'Sales', title: 'Follow-up sequence builder', risk: 'low' },
    { dept: 'Finance', title: 'Budget variance alert', risk: 'low' }
  ],
  building: [
    { dept: 'Sales', title: 'CRM data entry bot', risk: 'med' },
    { dept: 'HR', title: 'Candidate screening AI', risk: 'high' },
    { dept: 'Ops', title: 'Support ticket classifier', risk: 'med' }
  ],
  live: [
    { dept: 'Sales', title: 'Email follow-up automation', risk: 'low', live: true },
    { dept: 'Ops', title: 'Meeting notes extractor', risk: 'low', live: true },
    { dept: 'Finance', title: 'Invoice classifier', risk: 'low', live: true },
    { dept: 'Ops', title: 'Ticket triage bot', risk: 'med', live: true },
    { dept: 'HR', title: 'Policy Q&A chatbot', risk: 'low', live: true },
    { dept: 'Sales', title: 'Deal priority scorer', risk: 'low', live: true },
    { dept: 'Marketing', title: 'Content brief generator', risk: 'low', live: true },
    { dept: 'Sales', title: 'Contract summary AI', risk: 'med', live: true },
    { dept: 'Finance', title: 'Payroll anomaly detector', risk: 'med', live: true },
    { dept: 'Ops', title: 'SLA breach predictor', risk: 'low', live: true },
    { dept: 'HR', title: 'Onboarding guide bot', risk: 'low', live: true },
    { dept: 'Marketing', title: 'Campaign ROI reporter', risk: 'low', live: true }
  ]
};

const STAGE_META = {
  identified: { label: 'Identified', dot: 'dot-gray', count: 8 },
  approved:   { label: 'Approved',   dot: 'dot-blue', count: 4 },
  building:   { label: 'Building',   dot: 'dot-yellow', count: 3 },
  live:       { label: 'Live',       dot: 'dot-green', count: 12, highlighted: true }
};

function tagClass(dept) {
  const map = { Sales: 'tag-sales', HR: 'tag-hr', Ops: 'tag-ops', Finance: 'tag-finance', Marketing: 'tag-marketing' };
  return map[dept] || 'tag-ops';
}

function renderFullKanban() {
  const container = document.getElementById('full-kanban');
  if (!container) return;
  container.innerHTML = Object.entries(KANBAN_DATA).map(([stage, cards]) => {
    const meta = STAGE_META[stage];
    return `
      <div class="kanban-col ${meta.highlighted ? 'highlighted' : ''}" id="kanban-${stage}"
           ondragover="event.preventDefault()" ondrop="dropCard(event,'${stage}')">
        <div class="pipeline-label">
          <span class="dot ${meta.dot}"></span> ${meta.label}
          <span class="col-count">${cards.length}</span>
        </div>
        <div class="kanban-cards">
          ${cards.map(c => `
            <div class="pipeline-card ${c.live ? 'live' : ''}" draggable="true"
                 ondragstart="dragStart(event)" data-stage="${stage}" data-title="${c.title}">
              <span class="card-tag ${tagClass(c.dept)}">${c.dept}</span>
              <p>${c.title}</p>
              ${c.live
                ? '<span class="live-badge">● Live</span>'
                : `<span class="risk-chip ${c.risk}">${c.risk === 'low' ? 'Low' : c.risk === 'med' ? 'Med' : 'High'} Risk</span>`
              }
            </div>
          `).join('')}
        </div>
      </div>`;
  }).join('');
}

let draggedCard = null;
function dragStart(e) {
  draggedCard = e.currentTarget;
  e.dataTransfer.effectAllowed = 'move';
}
function dropCard(e, targetStage) {
  if (!draggedCard) return;
  const targetCol = document.getElementById(`kanban-${targetStage}`);
  const cardsContainer = targetCol?.querySelector('.kanban-cards');
  if (cardsContainer && draggedCard) {
    draggedCard.dataset.stage = targetStage;
    cardsContainer.appendChild(draggedCard);
    // Update count badges
    document.querySelectorAll('.kanban-col').forEach(col => {
      const stage = col.id.replace('kanban-', '');
      col.querySelector('.col-count').textContent = col.querySelectorAll('.pipeline-card').length;
    });
    showToast(`Moved to ${STAGE_META[targetStage].label} 📦`);
  }
  draggedCard = null;
}

// ─── Governance Panel ────────────────────────────────────────
const GOV_DATA = [
  {
    name: 'Email Follow-Up Bot',
    dept: 'Sales',
    status: 'Live',
    dataClass: 'Internal',
    hitl: 'On-exception',
    approvers: 'Sales Manager → CMO',
    riskScore: 2,
    rollback: 'Disable Make.com trigger. Review last 24h emails.',
    maxDaily: 200,
    auditLog: [
      { time: '2 min ago',  actor: 'AI Agent',     action: 'Sent follow-up email to lead #4412', outcome: 'success' },
      { time: '8 min ago',  actor: 'AI Agent',     action: 'Sent follow-up email to lead #4398', outcome: 'success' },
      { time: '1 hr ago',   actor: 'Chandler W.',  action: 'Approved: "Contract Summary" email draft', outcome: 'approved' },
      { time: '3 hrs ago',  actor: 'AI Agent',     action: 'Flagged lead #4210 for human review (confidence < 80%)', outcome: 'pending' },
      { time: 'Yesterday',  actor: 'System',       action: 'Policy updated: max daily actions 150 → 200', outcome: 'success' }
    ]
  },
  {
    name: 'Meeting Notes Extractor',
    dept: 'Operations',
    status: 'Live',
    dataClass: 'Internal',
    hitl: 'Always',
    approvers: 'Meeting Organizer',
    riskScore: 1,
    rollback: 'Disable Zoom webhook. Notes revert to manual.',
    maxDaily: 50,
    auditLog: [
      { time: '42 min ago', actor: 'AI Agent',    action: 'Extracted action items from "Q2 Planning" call', outcome: 'success' },
      { time: '2 hrs ago',  actor: 'Sarah M.',    action: 'Reviewed and approved meeting summary', outcome: 'approved' },
      { time: '4 hrs ago',  actor: 'AI Agent',    action: 'Extracted action items from "Sales Sync" call', outcome: 'success' },
      { time: 'Yesterday',  actor: 'AI Agent',    action: 'Sent summary to 6 attendees', outcome: 'success' }
    ]
  },
  {
    name: 'Candidate Screening AI',
    dept: 'HR',
    status: 'Building',
    dataClass: 'Confidential',
    hitl: 'Always',
    approvers: 'HR Lead → Legal',
    riskScore: 7,
    rollback: 'Stop Greenhouse webhook. Alert recruiters immediately.',
    maxDaily: 30,
    auditLog: [
      { time: '1 hr ago',   actor: 'System',      action: 'EEOC compliance review requested', outcome: 'pending' },
      { time: '2 hrs ago',  actor: 'Legal Team',  action: 'Flagged: bias monitoring checklist incomplete', outcome: 'failure' },
      { time: '1 day ago',  actor: 'Chandler W.', action: 'Policy draft created', outcome: 'success' }
    ]
  },
  {
    name: 'Invoice Classifier',
    dept: 'Finance',
    status: 'Live',
    dataClass: 'Confidential',
    hitl: 'On-exception',
    approvers: 'Finance Analyst → CFO',
    riskScore: 3,
    rollback: 'Disable Gmail watcher. Invoices route to manual inbox.',
    maxDaily: 100,
    auditLog: [
      { time: '30 min ago', actor: 'AI Agent',    action: 'Classified 3 invoices → QuickBooks', outcome: 'success' },
      { time: '2 hrs ago',  actor: 'AI Agent',    action: 'Flagged invoice #8821 (confidence 74%)', outcome: 'pending' },
      { time: '3 hrs ago',  actor: 'Jane R.',     action: 'Reviewed and approved flagged invoice', outcome: 'approved' },
      { time: 'Yesterday',  actor: 'AI Agent',    action: 'Processed 18 invoices without issues', outcome: 'success' }
    ]
  }
];

function initGovernance() {
  selectAutomation(document.getElementById('gov-0'), 0);
}

function selectAutomation(el, index) {
  document.querySelectorAll('.gov-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  renderGovDetail(index);
  renderAuditLog(index);
}
window.selectAutomation = selectAutomation;

function outcomeClass(outcome) {
  if (outcome === 'success' || outcome === 'approved') return 'icon-success';
  if (outcome === 'pending') return 'icon-warning';
  return 'icon-danger';
}
function outcomeSymbol(outcome) {
  if (outcome === 'success') return '✓';
  if (outcome === 'approved') return '✓';
  if (outcome === 'pending') return '⏳';
  return '✗';
}

function renderGovDetail(index) {
  const d = GOV_DATA[index];
  const detail = document.getElementById('gov-detail');
  if (!detail) return;
  detail.innerHTML = `
    <div class="gov-detail-header">
      <div>
        <h3>${d.name}</h3>
        <span class="gov-status-chip ${d.status === 'Live' ? 'chip-green' : d.status === 'Building' ? 'chip-yellow' : 'chip-gray'}">${d.status}</span>
      </div>
      <button class="btn btn-sm btn-danger" onclick="killSwitch('${d.name}')">⏹ Kill Switch</button>
    </div>

    <div class="policy-grid">
      <div class="policy-row">
        <span class="policy-label">📁 Data Classification</span>
        <span class="policy-val">${d.dataClass}</span>
      </div>
      <div class="policy-row">
        <span class="policy-label">👤 Human-in-the-Loop</span>
        <span class="policy-val">${d.hitl}</span>
      </div>
      <div class="policy-row">
        <span class="policy-label">✅ Approval Chain</span>
        <span class="policy-val">${d.approvers}</span>
      </div>
      <div class="policy-row">
        <span class="policy-label">🛡 Risk Score</span>
        <span class="risk-badge ${riskClass(d.riskScore)}">${riskLabel(d.riskScore)}</span>
      </div>
      <div class="policy-row">
        <span class="policy-label">⚡ Max Daily Actions</span>
        <span class="policy-val">${d.maxDaily}</span>
      </div>
      <div class="policy-row full">
        <span class="policy-label">🔄 Rollback Procedure</span>
        <span class="policy-val muted">${d.rollback}</span>
      </div>
    </div>
  `;
}

function renderAuditLog(index) {
  const d = GOV_DATA[index];
  const log = document.getElementById('audit-log');
  if (!log) return;
  log.innerHTML = d.auditLog.map(entry => `
    <div class="audit-entry">
      <div class="activity-icon ${outcomeClass(entry.outcome)}">${outcomeSymbol(entry.outcome)}</div>
      <div class="audit-body">
        <p>${entry.action}</p>
        <span><strong>${entry.actor}</strong> · ${entry.time}</span>
      </div>
      <span class="audit-outcome outcome-${entry.outcome}">${entry.outcome}</span>
    </div>
  `).join('');
}

function killSwitch(name) {
  showToast(`⏹ "${name}" paused immediately. All actions halted.`, 'danger');
}
window.killSwitch = killSwitch;

// ─── Process Maps ────────────────────────────────────────────
const PROCESS_MAPS = {
  sales: [
    { id: 'lead', label: 'New Lead Captured', type: 'trigger', x: 60, y: 60, time: '—', automation: 90 },
    { id: 'enrich', label: 'Lead Enrichment', type: 'repetitive', x: 280, y: 60, time: '45 min/wk', automation: 95 },
    { id: 'email', label: 'Follow-Up Email Drafted', type: 'repetitive', x: 500, y: 60, time: '6 hrs/wk', automation: 90 },
    { id: 'approve', label: 'Rep Reviews & Sends', type: 'strategic', x: 500, y: 200, time: '2 hrs/wk', automation: 10 },
    { id: 'crm', label: 'CRM Updated', type: 'repetitive', x: 280, y: 200, time: '5 hrs/wk', automation: 85 },
    { id: 'dealdone', label: 'Deal Won / Lost', type: 'strategic', x: 60, y: 200, time: '—', automation: 0 }
  ],
  ops: [
    { id: 'ticket', label: 'Support Ticket Submitted', type: 'trigger', x: 60, y: 60, time: '—', automation: 90 },
    { id: 'triage', label: 'Ticket Classification', type: 'repetitive', x: 280, y: 60, time: '8 hrs/wk', automation: 95 },
    { id: 'route', label: 'Route to Team', type: 'repetitive', x: 500, y: 60, time: '2 hrs/wk', automation: 85 },
    { id: 'resolve', label: 'Agent Resolves', type: 'strategic', x: 500, y: 200, time: '—', automation: 10 },
    { id: 'kb', label: 'KB Article Suggested', type: 'repetitive', x: 280, y: 200, time: '3 hrs/wk', automation: 80 },
    { id: 'close', label: 'Ticket Closed', type: 'strategic', x: 60, y: 200, time: '—', automation: 0 }
  ],
  hr: [
    { id: 'app', label: 'Candidate Applies', type: 'trigger', x: 60, y: 60, time: '—', automation: 90 },
    { id: 'screen', label: 'Resume Screened', type: 'repetitive', x: 280, y: 60, time: '3 hrs/wk', automation: 80 },
    { id: 'score', label: 'AI Scores Candidate', type: 'semi', x: 500, y: 60, time: '2 hrs/wk', automation: 70 },
    { id: 'review', label: 'Recruiter Review', type: 'strategic', x: 500, y: 200, time: '4 hrs/wk', automation: 0 },
    { id: 'interview', label: 'Interview Scheduled', type: 'semi', x: 280, y: 200, time: '1 hr/wk', automation: 75 },
    { id: 'hire', label: 'Hire / Reject Decision', type: 'strategic', x: 60, y: 200, time: '—', automation: 0 }
  ],
  finance: [
    { id: 'invoice', label: 'Invoice Email Received', type: 'trigger', x: 60, y: 60, time: '—', automation: 90 },
    { id: 'classify', label: 'Document Classified', type: 'repetitive', x: 280, y: 60, time: '2 hrs/wk', automation: 90 },
    { id: 'extract', label: 'Fields Extracted', type: 'repetitive', x: 500, y: 60, time: '3 hrs/wk', automation: 85 },
    { id: 'review', label: 'Analyst Confirms', type: 'strategic', x: 500, y: 200, time: '1 hr/wk', automation: 0 },
    { id: 'route', label: 'Routed to QuickBooks', type: 'repetitive', x: 280, y: 200, time: '1 hr/wk', automation: 85 },
    { id: 'paid', label: 'Payment Approved', type: 'strategic', x: 60, y: 200, time: '—', automation: 0 }
  ],
  marketing: [
    { id: 'brief', label: 'Campaign Brief Created', type: 'trigger', x: 60, y: 60, time: '—', automation: 70 },
    { id: 'copy', label: 'Copy Generated', type: 'semi', x: 280, y: 60, time: '4 hrs/wk', automation: 75 },
    { id: 'schedule', label: 'Posts Scheduled', type: 'repetitive', x: 500, y: 60, time: '3 hrs/wk', automation: 90 },
    { id: 'publish', label: 'Published', type: 'repetitive', x: 500, y: 200, time: '—', automation: 90 },
    { id: 'report', label: 'Performance Reported', type: 'repetitive', x: 280, y: 200, time: '2 hrs/wk', automation: 80 },
    { id: 'iterate', label: 'Strategy Adjusted', type: 'strategic', x: 60, y: 200, time: '—', automation: 0 }
  ]
};

const CONNECTIONS = [
  ['lead','enrich'],['enrich','email'],['email','approve'],
  ['approve','crm'],['crm','dealdone'],
  ['ticket','triage'],['triage','route'],['route','resolve'],
  ['resolve','kb'],['kb','close'],
  ['app','screen'],['screen','score'],['score','review'],
  ['review','interview'],['interview','hire'],
  ['invoice','classify'],['classify','extract'],['extract','review'],
  ['review','route'],['route','paid'],
  ['brief','copy'],['copy','schedule'],['schedule','publish'],
  ['publish','report'],['report','iterate']
];

function nodeColor(type) {
  if (type === 'trigger') return 'var(--accent)';
  if (type === 'repetitive') return 'var(--danger)';
  if (type === 'semi') return 'var(--warning)';
  return 'var(--success)';
}
function nodeLabel(type) {
  if (type === 'trigger') return 'Trigger';
  if (type === 'repetitive') return '🟥 Repetitive';
  if (type === 'semi') return '🟨 Semi-Structured';
  return '🟩 Strategic';
}

function renderProcessMap(deptKey) {
  const nodes = PROCESS_MAPS[deptKey];
  if (!nodes) return;

  const canvas = document.getElementById('process-canvas');
  if (!canvas) return;

  // Build SVG arrows
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);
  const arrows = CONNECTIONS
    .filter(([a, b]) => nodeMap[a] && nodeMap[b])
    .map(([a, b]) => {
      const na = nodeMap[a], nb = nodeMap[b];
      const x1 = na.x + 70, y1 = na.y + 25;
      const x2 = nb.x, y2 = nb.y + 25;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--border)" stroke-width="2" marker-end="url(#arrow)"/>`;
    }).join('');

  canvas.innerHTML = `
    <svg width="700" height="320" style="position:absolute;top:0;left:0;pointer-events:none">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--border)"/>
        </marker>
      </defs>
      ${arrows}
    </svg>
    ${nodes.map(n => `
      <div class="process-node" id="pnode-${n.id}"
           style="left:${n.x}px;top:${n.y}px;border-top:3px solid ${nodeColor(n.type)}"
           onclick="inspectNode('${n.id}','${n.label}','${n.type}','${n.time}',${n.automation})">
        <div class="node-label">${n.label}</div>
        <div class="node-type" style="color:${nodeColor(n.type)}">${n.type === 'trigger' ? 'Trigger' : n.type === 'repetitive' ? 'Repetitive' : n.type === 'semi' ? 'Semi-Struct.' : 'Strategic'}</div>
        ${n.automation > 0 ? `<div class="node-score">${n.automation}% auto potential</div>` : ''}
      </div>
    `).join('')}
  `;
}

function inspectNode(id, label, type, time, automation) {
  const inspector = document.getElementById('process-inspector');
  if (!inspector) return;

  // Highlight selected node
  document.querySelectorAll('.process-node').forEach(n => n.classList.remove('selected'));
  document.getElementById('pnode-' + id)?.classList.add('selected');

  inspector.innerHTML = `
    <div class="inspector-header">Node Inspector</div>
    <div class="inspector-content">
      <h4>${label}</h4>
      <div class="inspect-row">
        <span>Classification</span>
        <span style="color:${nodeColor(type)}">${nodeLabel(type)}</span>
      </div>
      <div class="inspect-row">
        <span>Time / Week</span>
        <span>${time || '—'}</span>
      </div>
      <div class="inspect-row">
        <span>Automation Potential</span>
        <span class="${automation >= 80 ? 'success' : automation >= 50 ? 'warning' : 'muted'}">${automation}%</span>
      </div>
      ${automation >= 70 ? `
        <div class="inspect-cta">
          <button class="btn btn-sm btn-primary" onclick="showToast('Opportunity added for: ${label} 🤖')">
            + Add to Opportunities
          </button>
        </div>` : ''}
    </div>
  `;
}
window.inspectNode = inspectNode;

function selectDept(el, deptKey) {
  document.querySelectorAll('.process-dept').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
  renderProcessMap(deptKey);
}
window.selectDept = selectDept;

// ─── Reports: Gauge Animation ────────────────────────────────
function animateGauge() {
  const circle = document.getElementById('gauge-circle');
  if (!circle) return;
  const r = 50;
  const circumference = 2 * Math.PI * r;
  circle.style.strokeDasharray = circumference;

  let progress = 0;
  const target = 0.78;
  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    progress = eased * target;
    const offset = circumference * (1 - progress);
    circle.style.strokeDashoffset = offset;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Discovery Chat ──────────────────────────────────────────
const AI_RESPONSES = [
  'Great insight! Follow-up emails and CRM updates are classic high-ROI automation opportunities. How many Account Executives are on your team?',
  'Perfect. With 5 AEs, we\'re looking at significant potential time savings. Do any of those tasks currently cause errors or require rework?',
  'Understood. I\'m now mapping those tasks. Your  Sales team automation potential score is coming in at 78%. Let\'s move to Marketing next — what does your content team spend most of their time on?',
  'Got it! I\'ll add those to your Discovery Summary. You\'re almost done — just 2 more departments to go. You can review your full opportunity report when complete.'
];
let chatTurn = 0;

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const msg = input?.value?.trim();
  if (!msg) return;

  const feed = document.querySelector('.discovery-chat');
  if (!feed) return;

  // Append user message before the input row
  const inputRow = document.querySelector('.chat-input-row');
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.innerHTML = `<div class="chat-content"><p>${msg}</p></div><div class="chat-avatar">CW</div>`;
  feed.insertBefore(userBubble, inputRow);
  input.value = '';

  // AI responds after short delay
  setTimeout(() => {
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai';
    const response = AI_RESPONSES[chatTurn % AI_RESPONSES.length];
    aiBubble.innerHTML = `<div class="chat-avatar">🤖</div><div class="chat-content"><p>${response}</p></div>`;
    feed.insertBefore(aiBubble, inputRow);
    chatTurn++;
    inputRow.scrollIntoView({ behavior: 'smooth' });
  }, 800);
}
window.sendChatMessage = sendChatMessage;

document.getElementById('chat-input')?.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendChatMessage();
});

// ─── Slider Updates ──────────────────────────────────────────
function updateSlider(sliderId, valId) {
  const slider = document.getElementById(sliderId);
  const val = document.getElementById(valId);
  if (slider && val) val.textContent = slider.value + ' hrs/wk';
}
window.updateSlider = updateSlider;

// ─── Approval Actions ────────────────────────────────────────
function approveItem(btn, message) {
  const row = btn.closest('.approval-item');
  row.style.opacity = '0.5';
  row.style.pointerEvents = 'none';
  showToast(message);
}
function rejectItem(btn) {
  const row = btn.closest('.approval-item');
  row.style.opacity = '0.4';
  row.style.pointerEvents = 'none';
  showToast('Approval rejected. Requester has been notified. ❌');
}
window.approveItem = approveItem;
window.rejectItem = rejectItem;

// ─── Toast Notifications ─────────────────────────────────────
let toastTimer;
function showToast(message, type = 'default') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
window.showToast = showToast;

// ─── Theme Toggle ────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
});

// ─── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  animateKPIs();
  renderOpportunities();
  renderFullKanban(); // pre-render for instant switch
  initGovernance();
  renderProcessMap('sales');
});

// Also animate immediately if DOM already loaded
if (document.readyState !== 'loading') {
  animateKPIs();
  renderOpportunities();
  renderFullKanban();
  initGovernance();
  renderProcessMap('sales');
}
