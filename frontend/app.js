const elements = {
  ideaInput: document.getElementById("ideaInput"),
  opportunityType: document.getElementById("opportunityType"),
  stage: document.getElementById("stage"),
  goal: document.getElementById("goal"),
  constraintsInput: document.getElementById("constraintsInput"),
  contextInput: document.getElementById("contextInput"),
  buildBtn: document.getElementById("buildBtn"),
  refineBtn: document.getElementById("refineBtn"),
  refineCommand: document.getElementById("refineCommand"),
  chipRow: document.getElementById("chipRow"),
  status: document.getElementById("status"),
  liveCard: document.getElementById("liveCard"),
  output: document.getElementById("output"),
  outputSection: document.getElementById("outputSection")
};

const state = {
  currentSystem: null,
  busy: false
};

initialize();

function initialize() {
  const previewTargets = [
    elements.ideaInput,
    elements.opportunityType,
    elements.stage,
    elements.goal
  ];

  previewTargets.forEach((target) => {
    target.addEventListener("input", renderLiveCardPreview);
    target.addEventListener("change", renderLiveCardPreview);
  });

  elements.buildBtn.addEventListener("click", handleBuild);
  elements.refineBtn.addEventListener("click", handleRefine);

  elements.chipRow.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const command = target.getAttribute("data-command");
    if (!command) {
      return;
    }

    elements.refineCommand.value = command;
    elements.refineCommand.focus();
  });

  renderLiveCardPreview();
  checkApiHealth();
}

async function checkApiHealth() {
  const apiBase = resolveApiBase();

  if (!apiBase) {
    setStatus("Set apiBase in env.js", "warning");
    return;
  }

  try {
    const response = await fetch(`${apiBase}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed (${response.status})`);
    }

    setStatus("API connected", "success");
  } catch (error) {
    setStatus(error.message || "API not reachable", "error");
  }
}

async function handleBuild() {
  const idea = String(elements.ideaInput.value || "").trim();
  if (!idea) {
    setStatus("Describe the opportunity first", "warning");
    elements.ideaInput.focus();
    return;
  }

  const payload = {
    idea,
    opportunityTypeHint: elements.opportunityType.value,
    stage: elements.stage.value,
    goal: elements.goal.value,
    constraints: String(elements.constraintsInput.value || "").trim(),
    context: String(elements.contextInput.value || "").trim(),
    allowAssumptions: true
  };

  try {
    setBusy(true, "Building system");
    const data = await postJson("/api/build", payload);
    if (!data.ok || !data.system) {
      throw new Error(data.message || "Build failed");
    }

    state.currentSystem = data.system;
    renderSystem(data.system);
    setStatus(
      `Built ${data.system.system_card.output_pathway} (confidence ${data.system.system_card.confidence_level})`,
      "success"
    );
  } catch (error) {
    setStatus(error.message || "Build failed", "error");
  } finally {
    setBusy(false, "Idle");
  }
}

async function handleRefine() {
  if (!state.currentSystem) {
    setStatus("Build the first system before refining", "warning");
    return;
  }

  const command = String(elements.refineCommand.value || "").trim();
  if (!command) {
    setStatus("Type or select a refinement command", "warning");
    return;
  }

  try {
    setBusy(true, "Refining current system");
    const data = await postJson("/api/refine", {
      command,
      userDeltaContext: String(elements.contextInput.value || "").trim(),
      currentSystem: state.currentSystem
    });

    if (!data.ok || !data.system) {
      throw new Error(data.message || "Refine failed");
    }

    state.currentSystem = data.system;
    renderSystem(data.system);
    setStatus(`Updated to revision ${data.system.version.revision}`, "success");
  } catch (error) {
    setStatus(error.message || "Refine failed", "error");
  } finally {
    setBusy(false, "Idle");
  }
}

async function postJson(path, payload) {
  const apiBase = resolveApiBase();
  if (!apiBase) {
    throw new Error("Missing apiBase in env.js");
  }

  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function resolveApiBase() {
  const configured =
    window.O2O_CONFIG && typeof window.O2O_CONFIG.apiBase === "string"
      ? window.O2O_CONFIG.apiBase.trim()
      : "";

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://127.0.0.1:8787";
  }

  return "";
}

function setBusy(isBusy, statusText) {
  state.busy = isBusy;
  elements.buildBtn.disabled = isBusy;
  elements.refineBtn.disabled = isBusy;
  if (statusText) {
    setStatus(statusText, isBusy ? "loading" : "neutral");
  }
}

function setStatus(text, tone) {
  elements.status.textContent = text;
  elements.status.dataset.tone = tone;
}

function renderLiveCardPreview() {
  const idea = String(elements.ideaInput.value || "").trim();
  const selectedType = elements.opportunityType.value;
  const stage = elements.stage.value;
  const goal = elements.goal.value;

  const opportunityType = selectedType === "Auto" ? inferOpportunityType(idea) : selectedType;
  const clarity = inferClarity(idea);
  const pathway = inferPathway(idea, stage, goal);
  const confidence = inferConfidence(idea, clarity);

  elements.liveCard.innerHTML = `
    <div class="preview-grid">
      <div class="preview-row">
        <h4>Opportunity Type</h4>
        <p>${escapeHtml(opportunityType)}</p>
      </div>
      <div class="preview-row">
        <h4>Clarity Level</h4>
        <p>${escapeHtml(clarity)}</p>
      </div>
      <div class="preview-row">
        <h4>Output Pathway</h4>
        <p>${escapeHtml(pathway)}</p>
      </div>
      <div class="preview-row">
        <h4>Confidence</h4>
        <p>${escapeHtml(confidence)}</p>
      </div>
      <div class="preview-row">
        <h4>Recommended Next Step</h4>
        <p>${escapeHtml(pathway === "Discovery System" ? "Run 14-day discovery sprint" : "Build pilot workflow and quality gates")}</p>
      </div>
    </div>
  `;
}

function renderSystem(system) {
  const card = system.system_card || {};
  const diagnosis = system.diagnosis || {};
  const clarification = system.clarification || {};
  const responsibility = system.responsibility_contract || {};
  const knownAssumedUnknown = system.known_assumed_unknown || {};
  const opportunityMap = system.opportunity_map || {};
  const executionPlan = system.execution_plan || {};
  const operatingCadence = system.operating_cadence || {};
  const pilotPlan = system.pilot_plan || {};

  const workflowSteps = toArray(system.workflow_blueprint);
  const aiUseCases = toArray(system.ai_use_case_map);
  const controls = toArray(system.human_in_the_loop_controls);
  const teamRoles = toArray(system.team_roles);
  const sopDrafts = toArray(system.sop_drafts);
  const metrics = toArray(system.metrics);
  const risks = toArray(system.risks_and_controls);
  const prioritization = toArray(system.prioritization);
  const nextActions = toArray(system.next_actions);
  const groundingNotes = toArray(system.grounding_notes);

  const version = system.version || { revision: 1, generated_at: "" };

  elements.outputSection.hidden = false;
  elements.output.innerHTML = `
    <div class="result-grid">
      <article class="result-card">
        <h3>System Card</h3>
        <div class="kv-grid">
          <div class="kv"><strong>Opportunity Type</strong><span>${escapeHtml(card.opportunity_type)}</span></div>
          <div class="kv"><strong>Clarity Level</strong><span>${escapeHtml(card.clarity_level)}</span></div>
          <div class="kv"><strong>Output Pathway</strong><span>${escapeHtml(card.output_pathway)}</span></div>
          <div class="kv"><strong>Confidence</strong><span>${renderBadge(card.confidence_level)}</span></div>
          <div class="kv"><strong>Revision</strong><span>${escapeHtml(String(version.revision || "1"))}</span></div>
          <div class="kv"><strong>Generated At</strong><span>${escapeHtml(version.generated_at || "")}</span></div>
        </div>
        <h4>Key Assumptions</h4>
        ${renderList(card.key_assumptions)}
        <h4>Missing Information</h4>
        ${renderList(card.missing_information)}
        <h4>Recommended Next Step</h4>
        <p>${escapeHtml(card.recommended_next_step || "")}</p>
      </article>

      <article class="result-card">
        <h3>Diagnosis</h3>
        <h4>Executive Summary</h4>
        <p>${escapeHtml(system.executive_summary || "")}</p>
        <h4>Opportunity Type Rationale</h4>
        <p>${escapeHtml(diagnosis.opportunity_type_rationale || "")}</p>
        <h4>Clarity Rationale</h4>
        <p>${escapeHtml(diagnosis.clarity_rationale || "")}</p>
        <h4>Pathway Rationale</h4>
        <p>${escapeHtml(diagnosis.pathway_rationale || "")}</p>
        <h4>Confidence Rationale</h4>
        <p>${escapeHtml(diagnosis.confidence_rationale || "")}</p>
      </article>

      <article class="result-card">
        <h3>Clarification Protocol</h3>
        <div class="kv-grid">
          <div class="kv"><strong>Needs Clarification</strong><span>${escapeHtml(String(Boolean(clarification.needs_clarification)))}</span></div>
          <div class="kv"><strong>Assumption Draft Used</strong><span>${escapeHtml(String(Boolean(clarification.assumption_based_draft_used)))}</span></div>
        </div>
        <h4>Clarifying Questions</h4>
        ${renderList(clarification.questions)}
        <h4>Known</h4>
        ${renderList(knownAssumedUnknown.known)}
        <h4>Assumed</h4>
        ${renderList(knownAssumedUnknown.assumed)}
        <h4>Unknown</h4>
        ${renderList(knownAssumedUnknown.unknown)}
      </article>

      <article class="result-card">
        <h3>Responsibility Contract</h3>
        <div class="kv-grid">
          <div class="kv"><strong>Decision Support Mode</strong><span>${escapeHtml(responsibility.decision_support_mode || "")}</span></div>
          <div class="kv"><strong>Smallest Safe Test</strong><span>${escapeHtml(responsibility.smallest_safe_test || "")}</span></div>
        </div>
        <h4>Non-prescriptive Notice</h4>
        <p>${escapeHtml(responsibility.non_prescriptive_notice || "")}</p>
        <h4>Context Attachment Checks</h4>
        ${renderList(responsibility.context_attachment_checks)}
        <h4>Constraint Acknowledgement</h4>
        ${renderList(responsibility.constraint_acknowledgement)}
        <h4>Escalation Triggers</h4>
        ${renderList(responsibility.escalation_triggers)}
      </article>

      <article class="result-card">
        <h3>Opportunity Map</h3>
        <h4>Value</h4>
        ${renderList(opportunityMap.value)}
        <h4>Risks</h4>
        ${renderList(opportunityMap.risks)}
        <h4>Bottlenecks</h4>
        ${renderList(opportunityMap.bottlenecks)}
        <h4>Leverage Points</h4>
        ${renderList(opportunityMap.leverage_points)}
      </article>

      <article class="result-card">
        <h3>Workflow Blueprint</h3>
        ${renderWorkflowSteps(workflowSteps)}
      </article>

      <article class="result-card">
        <h3>AI Use Case Map</h3>
        ${renderAiUseCases(aiUseCases)}
      </article>

      <article class="result-card">
        <h3>Human-in-the-Loop Controls</h3>
        ${renderControls(controls)}
        <h4>Team Roles</h4>
        ${renderTeamRoles(teamRoles)}
      </article>

      <article class="result-card">
        <h3>SOP Drafts</h3>
        ${renderSopDrafts(sopDrafts)}
      </article>

      <article class="result-card">
        <h3>Pilot Plan</h3>
        <div class="kv-grid">
          <div class="kv"><strong>Duration (days)</strong><span>${escapeHtml(String(pilotPlan.duration_days || ""))}</span></div>
          <div class="kv"><strong>Objective</strong><span>${escapeHtml(pilotPlan.objective || "")}</span></div>
        </div>
        <h4>Week Plan</h4>
        ${renderList(pilotPlan.week_plan)}
        <h4>Validation Steps</h4>
        ${renderList(pilotPlan.validation_steps)}

        <h4>Operating Cadence: Weekly Rhythm</h4>
        ${renderList(operatingCadence.weekly_rhythm)}
        <h4>Meetings</h4>
        ${renderList(operatingCadence.meetings)}
        <h4>Reviews</h4>
        ${renderList(operatingCadence.reviews)}
        <h4>Reporting</h4>
        ${renderList(operatingCadence.reporting)}
      </article>

      <article class="result-card">
        <h3>Execution Plan</h3>
        ${renderTimeline(executionPlan.timeline)}
        <h4>Templates</h4>
        ${renderList(executionPlan.templates)}
        <h4>Scripts</h4>
        ${renderList(executionPlan.scripts)}
        <h4>Prompts</h4>
        ${renderList(executionPlan.prompts)}
        <h4>Checklists</h4>
        ${renderList(executionPlan.checklists)}
      </article>

      <article class="result-card">
        <h3>Metrics</h3>
        ${renderMetrics(metrics)}
        <h4>Risks and Controls</h4>
        ${renderRisks(risks)}
      </article>

      <article class="result-card">
        <h3>Prioritization Engine</h3>
        ${renderPrioritization(prioritization)}
      </article>

      <article class="result-card">
        <h3>Next Actions</h3>
        ${renderList(nextActions)}
        <h4>Grounding Notes</h4>
        ${renderList(groundingNotes)}
      </article>
    </div>
  `;

  elements.outputSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderWorkflowSteps(steps) {
  if (!steps.length) {
    return "<p>No workflow steps provided.</p>";
  }

  return steps
    .map((step, index) => {
      return `
      <div class="kv">
        <strong>Step ${index + 1}</strong>
        <span>${escapeHtml(step.step || "")}</span>
        <h4>AI Responsibilities</h4>
        ${renderList(step.ai_responsibilities)}
        <h4>Human Responsibilities</h4>
        ${renderList(step.human_responsibilities)}
        <h4>Tools</h4>
        ${renderList(step.tools)}
        <h4>Quality Checks</h4>
        ${renderList(step.quality_checks)}
      </div>
    `;
    })
    .join("");
}

function renderAiUseCases(items) {
  if (!items.length) {
    return "<p>No AI use cases provided.</p>";
  }

  return items
    .map((item) => {
      return `
      <div class="kv">
        <strong>${escapeHtml(item.use_case || "Use case")}</strong>
        <span>${escapeHtml(item.function || "")}</span>
        <h4>Data Inputs</h4>
        ${renderList(item.data_inputs)}
        <h4>AI Output</h4>
        <p>${escapeHtml(item.ai_output || "")}</p>
        <h4>Human Oversight</h4>
        <p>${escapeHtml(item.human_oversight || "")}</p>
        <p>${renderBadge(item.priority_label)}</p>
      </div>
    `;
    })
    .join("");
}

function renderControls(items) {
  if (!items.length) {
    return "<p>No control points provided.</p>";
  }

  return items
    .map((item) => {
      return `
      <div class="kv">
        <strong>${escapeHtml(item.control_point || "Control")}</strong>
        <span>${escapeHtml(item.human_role || "")}</span>
        <h4>Approval Rule</h4>
        <p>${escapeHtml(item.approval_rule || "")}</p>
        <h4>Override Rule</h4>
        <p>${escapeHtml(item.override_rule || "")}</p>
      </div>
    `;
    })
    .join("");
}

function renderTeamRoles(items) {
  if (!items.length) {
    return "<p>No team roles provided.</p>";
  }

  return items
    .map((item) => {
      return `
      <div class="kv">
        <strong>${escapeHtml(item.role || "Role")}</strong>
        ${renderList(item.responsibilities)}
      </div>
    `;
    })
    .join("");
}

function renderSopDrafts(items) {
  if (!items.length) {
    return "<p>No SOP drafts provided.</p>";
  }

  return items
    .map((item) => {
      return `
      <div class="kv">
        <strong>${escapeHtml(item.sop_name || "SOP")}</strong>
        <h4>Purpose</h4>
        <p>${escapeHtml(item.purpose || "")}</p>
        <h4>Trigger</h4>
        <p>${escapeHtml(item.trigger || "")}</p>
        <h4>Steps</h4>
        ${renderList(item.steps)}
        <h4>Quality Gate</h4>
        <p>${escapeHtml(item.quality_gate || "")}</p>
      </div>
    `;
    })
    .join("");
}

function renderTimeline(items) {
  const timeline = toArray(items);
  if (!timeline.length) {
    return "<p>No timeline provided.</p>";
  }

  return timeline
    .map((item) => {
      return `
      <div class="kv">
        <strong>${escapeHtml(item.window || "Window")}</strong>
        <h4>Tasks</h4>
        ${renderList(item.tasks)}
        <h4>Owner</h4>
        <p>${escapeHtml(item.owner || "")}</p>
        <h4>Output</h4>
        <p>${escapeHtml(item.output || "")}</p>
      </div>
    `;
    })
    .join("");
}

function renderMetrics(items) {
  if (!items.length) {
    return "<p>No metrics provided.</p>";
  }

  return items
    .map((item) => {
      return `
      <div class="kv">
        <strong>${escapeHtml(item.metric || "Metric")}</strong>
        <h4>Definition</h4>
        <p>${escapeHtml(item.definition || "")}</p>
        <h4>Target</h4>
        <p>${escapeHtml(item.target || "")}</p>
        <h4>Owner</h4>
        <p>${escapeHtml(item.owner || "")}</p>
        <h4>Cadence</h4>
        <p>${escapeHtml(item.cadence || "")}</p>
      </div>
    `;
    })
    .join("");
}

function renderRisks(items) {
  if (!items.length) {
    return "<p>No risks provided.</p>";
  }

  return items
    .map((item) => {
      return `
      <div class="kv">
        <strong>${escapeHtml(item.risk || "Risk")}</strong>
        <p>${renderBadge(item.likelihood_label)} ${renderBadge(item.impact_label)}</p>
        <h4>Control</h4>
        <p>${escapeHtml(item.control || "")}</p>
        <h4>Owner</h4>
        <p>${escapeHtml(item.owner || "")}</p>
      </div>
    `;
    })
    .join("");
}

function renderPrioritization(items) {
  if (!items.length) {
    return "<p>No prioritization entries provided.</p>";
  }

  return items
    .map((item) => {
      return `
      <div class="kv">
        <strong>${escapeHtml(item.recommendation || "Recommendation")}</strong>
        <p>
          ${renderBadge(item.priority_label)}
          ${renderBadge(item.impact)}
          ${renderBadge(item.effort)}
          ${renderBadge(item.risk)}
          ${renderBadge(item.time_to_test)}
          ${renderBadge(item.ai_suitability)}
          ${renderBadge(item.human_oversight_required)}
        </p>
      </div>
    `;
    })
    .join("");
}

function renderList(items) {
  const list = toArray(items);
  if (!list.length) {
    return "<p>None provided.</p>";
  }

  return `<ul class="result-list">${list
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function renderBadge(value) {
  const text = String(value || "LOW").toUpperCase();
  const kind = text === "HIGH" ? "high" : text === "MEDIUM" ? "medium" : "low";
  return `<span class="badge ${kind}">${escapeHtml(text)}</span>`;
}

function inferOpportunityType(input) {
  const text = String(input || "").toLowerCase();

  if (/(factory|warehouse|logistics|inventory|fulfillment|fleet)/.test(text)) {
    return "Physical Operations";
  }
  if (/(product|feature|roadmap|release|sprint|prototype)/.test(text)) {
    return "Product Build";
  }
  if (/(content|campaign|brand|video|newsletter|creative)/.test(text)) {
    return "Creative / Content";
  }
  if (/(team|manager|handoff|training|performance|leadership)/.test(text)) {
    return "Team Performance";
  }
  if (/(customer|support|ticket|onboarding|retention|nps)/.test(text)) {
    return "Customer / Support";
  }
  if (/(strategy|market|positioning|discovery|research)/.test(text)) {
    return "Strategy / Discovery";
  }
  if (/(automation|ai|agent|workflow automation|llm|copilot)/.test(text)) {
    return "Automation / AI Enablement";
  }

  return "Strategy / Discovery";
}

function inferClarity(input) {
  const text = String(input || "").trim();

  if (text.length < 60) {
    return "Vague";
  }

  const hasNumbers = /\d/.test(text);
  const hasConstraintWords = /(deadline|budget|team|hours|weeks|days|kpi|target|limit)/i.test(text);

  if (text.length > 220 && hasNumbers && hasConstraintWords) {
    return "Clear";
  }

  if (text.length > 140) {
    return "Semi-clear";
  }

  return "Needs Discovery";
}

function inferPathway(input, stage, goal) {
  const text = String(input || "").trim();
  const clarity = inferClarity(text);

  if (goal === "Build full operating system") {
    return "Full Operating System";
  }

  if (goal === "Build workflow system") {
    return "Workflow System";
  }

  if (clarity === "Vague" || clarity === "Needs Discovery" || stage === "Discovery") {
    return "Discovery System";
  }

  if (stage === "Pilot" || stage === "Scale") {
    return "Full Operating System";
  }

  return "Workflow System";
}

function inferConfidence(input, clarity) {
  const text = String(input || "").trim();

  if (!text) {
    return "LOW";
  }

  if (clarity === "Clear") {
    return "HIGH";
  }

  if (clarity === "Semi-clear") {
    return "MEDIUM";
  }

  return "LOW";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item === null || item === undefined) {
        return "";
      }
      return item;
    })
    .filter((item) => {
      if (typeof item === "string") {
        return item.trim().length > 0;
      }
      return true;
    });
}
