import test from "node:test";
import assert from "node:assert/strict";
import { __testables } from "../src/worker.js";

const {
  resolveGenerationMode,
  buildPipelineStatusMessage,
  classifyQualityFailureTypes,
  routeDeepRetryAction,
  validateClaudeDiagnosticOutput,
  detectDiagnosticAlignmentIssues,
  qualityScoreFromIssueCount
} = __testables;

const strongDiagnostic = {
  evidence_from_brief: [
    "Role requires owning APAC enterprise pipeline quality with weekly conversion reporting.",
    "Hiring manager noted candidate drop-off after panel stages due to weak stakeholder alignment."
  ],
  likely_hidden_risks: [
    "Role brief overweights years of experience and underweights operating discipline.",
    "Panel scoring drift may reject strong operators who communicate concisely."
  ],
  assumptions_to_label: [
    "Compensation band can attract enterprise recruiters with APAC depth.",
    "Decision SLA can be reduced to less than 5 days if panel ownership is clarified."
  ],
  missing_information: [
    "Final non-negotiable outcomes in first 90 days.",
    "Interview owner for final stage decisions."
  ],
  corrected_search_thesis:
    "Prioritize recruiters who have delivered enterprise APAC pipeline outcomes with evidence of stakeholder calibration, conversion recovery, and weekly operating cadence under ambiguity.",
  candidate_failure_modes: [
    "Strong sourcing activity but weak debrief alignment across interviewers.",
    "High response volume but low shortlist quality against scorecard evidence."
  ],
  recruiter_verification_questions: [
    "Which enterprise funnel metric must improve first in the next 30 days?",
    "Which stakeholder owns final pass/fail decisions for shortlist progression?"
  ],
  confidence_notes:
    "Confidence is medium-high because brief evidence is concrete but compensation and final scope boundaries still require confirmation."
};

test("resolveGenerationMode defaults to fast and accepts deep", () => {
  assert.equal(resolveGenerationMode(undefined), "fast");
  assert.equal(resolveGenerationMode(""), "fast");
  assert.equal(resolveGenerationMode("deep"), "deep");
  assert.equal(resolveGenerationMode("FAST"), "fast");
});

test("pipeline status messages stay user-neutral", () => {
  const deep = buildPipelineStatusMessage("deep").toLowerCase();
  const fast = buildPipelineStatusMessage("fast").toLowerCase();

  assert.ok(deep.includes("deep diagnosis"));
  assert.ok(fast.includes("multi-pass diagnostic validation"));
  assert.equal(deep.includes("gpt"), false);
  assert.equal(deep.includes("claude"), false);
});

test("classifyQualityFailureTypes maps issues to retry classes", () => {
  const types = classifyQualityFailureTypes([
    "contains excessive generic consulting filler",
    "Recruitment contract missing keys: screening_rubric.",
    "contradiction with diagnostic thesis on corrected_search_thesis",
    "unsupported claim language detected without evidence/assumption labels"
  ]);

  assert.ok(types.includes("generic_output"));
  assert.ok(types.includes("missing_sections"));
  assert.ok(types.includes("contradiction"));
  assert.ok(types.includes("unsupported_claim"));
});

test("routeDeepRetryAction prefers Claude rerun for weak diagnosis", () => {
  const route = routeDeepRetryAction(
    { failure_types: ["weak_diagnosis", "generic_output"] },
    { canRerunClaude: true }
  );

  assert.equal(route.action, "rerun_claude");
});

test("routeDeepRetryAction selects GPT structure retry for missing sections", () => {
  const route = routeDeepRetryAction(
    { failure_types: ["missing_sections"] },
    { canRerunClaude: false }
  );

  assert.equal(route.action, "retry_gpt_structure");
});

test("validateClaudeDiagnosticOutput passes strong thesis", () => {
  const validation = validateClaudeDiagnosticOutput(strongDiagnostic, {
    sourceInput: "enterprise APAC recruiter pipeline conversion stakeholder calibration"
  });

  assert.equal(validation.ok, true);
  assert.equal(validation.score > 70, true);
});

test("validateClaudeDiagnosticOutput fails weak generic thesis", () => {
  const weak = {
    evidence_from_brief: ["Need recruiter"],
    likely_hidden_risks: ["General risk"],
    assumptions_to_label: ["Maybe budget"],
    missing_information: ["TBD"],
    corrected_search_thesis: "Use best practices across industries.",
    candidate_failure_modes: ["General mismatch"],
    recruiter_verification_questions: ["Any concerns?"],
    confidence_notes: "Low confidence"
  };

  const validation = validateClaudeDiagnosticOutput(weak, {
    sourceInput: "enterprise APAC recruiter pipeline conversion stakeholder calibration"
  });

  assert.equal(validation.ok, false);
  assert.ok(validation.failure_types.includes("weak_diagnosis"));
});

test("detectDiagnosticAlignmentIssues flags thesis contradiction", () => {
  const system = {
    recruitment_operating_system: {
      blind_spot_diagnosis: {
        corrected_search_thesis:
          "Focus on junior recruiters who can do high-volume outbound regardless of stakeholder complexity."
      },
      red_flags: ["Weak process ownership"]
    },
    system_card: {
      key_assumptions: ["Panel can decide quickly"]
    },
    risks_and_controls: [
      {
        risk: "Limited process rigor"
      }
    ]
  };

  const issues = detectDiagnosticAlignmentIssues(system, strongDiagnostic);
  assert.ok(issues.some((item) => item.includes("contradiction with diagnostic thesis")));
});

test("qualityScoreFromIssueCount degrades score", () => {
  assert.equal(qualityScoreFromIssueCount(0), 100);
  assert.equal(qualityScoreFromIssueCount(3), 64);
});
