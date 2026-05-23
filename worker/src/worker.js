const OPPORTUNITY_TYPES = [
  "Physical Operations",
  "Product Build",
  "Creative / Content",
  "Team Performance",
  "Customer / Support",
  "Strategy / Discovery",
  "Automation / AI Enablement"
];

const CLARITY_LEVELS = [
  "Clear",
  "Semi-clear",
  "Vague",
  "Broad",
  "Needs Discovery",
  "Needs Constraints"
];

const OUTPUT_PATHWAYS = [
  "Discovery System",
  "Workflow System",
  "Full Operating System"
];

const IMPACT_LABELS = ["HIGH", "MEDIUM", "LOW"];
const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const PLAN_LIMITS = {
  starter: {
    plan: "starter",
    label: "Starter",
    monthly_generations: 100,
    max_image_bytes: 1 * 1024 * 1024,
    max_images_per_generation: 1
  },
  pro: {
    plan: "pro",
    label: "Pro",
    monthly_generations: 500,
    max_image_bytes: 4 * 1024 * 1024,
    max_images_per_generation: 2
  },
  scale: {
    plan: "scale",
    label: "Scale",
    monthly_generations: 2000,
    max_image_bytes: 8 * 1024 * 1024,
    max_images_per_generation: 4
  }
};
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);
const SESSION_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

const OUTPUT_SCHEMA = {
  name: "o2o_system_contract",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "system_card",
      "diagnosis",
      "clarification",
      "executive_summary",
      "recruitment_operating_system",
      "opportunity_map",
      "workflow_blueprint",
      "ai_use_case_map",
      "human_in_the_loop_controls",
      "team_roles",
      "sop_drafts",
      "pilot_plan",
      "operating_cadence",
      "execution_plan",
      "metrics",
      "risks_and_controls",
      "prioritization",
      "next_actions",
      "known_assumed_unknown",
      "pathway_payload",
      "grounding_notes",
      "responsibility_contract",
      "version"
    ],
    properties: {
      system_card: {
        type: "object",
        additionalProperties: false,
        required: [
          "opportunity_type",
          "clarity_level",
          "output_pathway",
          "confidence_level",
          "key_assumptions",
          "missing_information",
          "recommended_next_step"
        ],
        properties: {
          opportunity_type: { type: "string", enum: OPPORTUNITY_TYPES },
          clarity_level: { type: "string", enum: CLARITY_LEVELS },
          output_pathway: { type: "string", enum: OUTPUT_PATHWAYS },
          confidence_level: { type: "string", enum: IMPACT_LABELS },
          key_assumptions: {
            type: "array",
            items: { type: "string" }
          },
          missing_information: {
            type: "array",
            items: { type: "string" }
          },
          recommended_next_step: { type: "string" }
        }
      },
      diagnosis: {
        type: "object",
        additionalProperties: false,
        required: [
          "opportunity_type_rationale",
          "clarity_rationale",
          "pathway_rationale",
          "missing_information_detail",
          "confidence_rationale"
        ],
        properties: {
          opportunity_type_rationale: { type: "string" },
          clarity_rationale: { type: "string" },
          pathway_rationale: { type: "string" },
          missing_information_detail: {
            type: "array",
            items: { type: "string" }
          },
          confidence_rationale: { type: "string" }
        }
      },
      clarification: {
        type: "object",
        additionalProperties: false,
        required: [
          "needs_clarification",
          "questions",
          "assumption_based_draft_used"
        ],
        properties: {
          needs_clarification: { type: "boolean" },
          questions: {
            type: "array",
            maxItems: 5,
            items: { type: "string" }
          },
          assumption_based_draft_used: { type: "boolean" }
        }
      },
      executive_summary: { type: "string" },
      recruitment_operating_system: {
        type: "object",
        additionalProperties: false,
        required: [
          "job_ad_diagnosis",
          "blind_spot_diagnosis",
          "hidden_success_profile",
          "ideal_candidate_persona",
          "wildcard_adjacent_profiles",
          "sourcing_strategy",
          "boolean_search_strings",
          "screening_rubric",
          "interview_questions",
          "red_flags",
          "outreach_message",
          "shortlist_scorecard",
          "search_sprint_21_day_plan",
          "client_briefing_notes",
          "hiring_operating_cadence"
        ],
        properties: {
          job_ad_diagnosis: { type: "string" },
          blind_spot_diagnosis: {
            type: "object",
            additionalProperties: false,
            required: [
              "stated_need",
              "likely_real_need",
              "false_assumptions",
              "hidden_failure_modes",
              "wrong_candidate_risks",
              "missing_success_definition",
              "compensation_or_level_mismatch",
              "passive_candidate_reality",
              "corrected_search_thesis"
            ],
            properties: {
              stated_need: { type: "string" },
              likely_real_need: { type: "string" },
              false_assumptions: { type: "array", items: { type: "string" } },
              hidden_failure_modes: { type: "array", items: { type: "string" } },
              wrong_candidate_risks: { type: "array", items: { type: "string" } },
              missing_success_definition: { type: "array", items: { type: "string" } },
              compensation_or_level_mismatch: { type: "array", items: { type: "string" } },
              passive_candidate_reality: { type: "string" },
              corrected_search_thesis: { type: "string" }
            }
          },
          hidden_success_profile: { type: "string" },
          ideal_candidate_persona: {
            type: "object",
            additionalProperties: false,
            required: [
              "mission",
              "must_have_competencies",
              "domain_context",
              "first_90_day_outcomes"
            ],
            properties: {
              mission: { type: "string" },
              must_have_competencies: { type: "array", items: { type: "string" } },
              domain_context: { type: "array", items: { type: "string" } },
              first_90_day_outcomes: { type: "array", items: { type: "string" } }
            }
          },
          wildcard_adjacent_profiles: { type: "array", items: { type: "string" } },
          sourcing_strategy: {
            type: "object",
            additionalProperties: false,
            required: ["channels", "weekly_targets", "messaging_angles"],
            properties: {
              channels: { type: "array", items: { type: "string" } },
              weekly_targets: { type: "array", items: { type: "string" } },
              messaging_angles: { type: "array", items: { type: "string" } }
            }
          },
          boolean_search_strings: { type: "array", items: { type: "string" } },
          screening_rubric: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["category", "weight", "what_to_look_for"],
              properties: {
                category: { type: "string" },
                weight: { type: "string" },
                what_to_look_for: { type: "string" }
              }
            }
          },
          interview_questions: {
            type: "object",
            additionalProperties: false,
            required: ["technical", "behavioral", "execution", "stakeholder"],
            properties: {
              technical: { type: "array", items: { type: "string" } },
              behavioral: { type: "array", items: { type: "string" } },
              execution: { type: "array", items: { type: "string" } },
              stakeholder: { type: "array", items: { type: "string" } }
            }
          },
          red_flags: { type: "array", items: { type: "string" } },
          outreach_message: { type: "string" },
          shortlist_scorecard: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["dimension", "description"],
              properties: {
                dimension: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          search_sprint_21_day_plan: {
            type: "object",
            additionalProperties: false,
            required: ["week1", "week2", "week3"],
            properties: {
              week1: { type: "array", items: { type: "string" } },
              week2: { type: "array", items: { type: "string" } },
              week3: { type: "array", items: { type: "string" } }
            }
          },
          client_briefing_notes: { type: "string" },
          hiring_operating_cadence: {
            type: "object",
            additionalProperties: false,
            required: ["weekly", "monthly"],
            properties: {
              weekly: { type: "array", items: { type: "string" } },
              monthly: { type: "array", items: { type: "string" } }
            }
          }
        }
      },
      opportunity_map: {
        type: "object",
        additionalProperties: false,
        required: ["value", "risks", "bottlenecks", "leverage_points"],
        properties: {
          value: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          bottlenecks: { type: "array", items: { type: "string" } },
          leverage_points: { type: "array", items: { type: "string" } }
        }
      },
      workflow_blueprint: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "step",
            "ai_responsibilities",
            "human_responsibilities",
            "tools",
            "quality_checks"
          ],
          properties: {
            step: { type: "string" },
            ai_responsibilities: { type: "array", items: { type: "string" } },
            human_responsibilities: { type: "array", items: { type: "string" } },
            tools: { type: "array", items: { type: "string" } },
            quality_checks: { type: "array", items: { type: "string" } }
          }
        }
      },
      ai_use_case_map: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "use_case",
            "function",
            "data_inputs",
            "ai_output",
            "human_oversight",
            "priority_label"
          ],
          properties: {
            use_case: { type: "string" },
            function: { type: "string" },
            data_inputs: { type: "array", items: { type: "string" } },
            ai_output: { type: "string" },
            human_oversight: { type: "string" },
            priority_label: { type: "string", enum: IMPACT_LABELS }
          }
        }
      },
      human_in_the_loop_controls: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["control_point", "human_role", "approval_rule", "override_rule"],
          properties: {
            control_point: { type: "string" },
            human_role: { type: "string" },
            approval_rule: { type: "string" },
            override_rule: { type: "string" }
          }
        }
      },
      team_roles: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["role", "responsibilities"],
          properties: {
            role: { type: "string" },
            responsibilities: { type: "array", items: { type: "string" } }
          }
        }
      },
      sop_drafts: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["sop_name", "purpose", "trigger", "steps", "quality_gate"],
          properties: {
            sop_name: { type: "string" },
            purpose: { type: "string" },
            trigger: { type: "string" },
            steps: { type: "array", items: { type: "string" } },
            quality_gate: { type: "string" }
          }
        }
      },
      pilot_plan: {
        type: "object",
        additionalProperties: false,
        required: ["duration_days", "objective", "week_plan", "validation_steps"],
        properties: {
          duration_days: { type: "number" },
          objective: { type: "string" },
          week_plan: { type: "array", items: { type: "string" } },
          validation_steps: { type: "array", items: { type: "string" } }
        }
      },
      operating_cadence: {
        type: "object",
        additionalProperties: false,
        required: ["weekly_rhythm", "meetings", "reviews", "reporting"],
        properties: {
          weekly_rhythm: { type: "array", items: { type: "string" } },
          meetings: { type: "array", items: { type: "string" } },
          reviews: { type: "array", items: { type: "string" } },
          reporting: { type: "array", items: { type: "string" } }
        }
      },
      execution_plan: {
        type: "object",
        additionalProperties: false,
        required: ["timeline", "templates", "scripts", "prompts", "checklists"],
        properties: {
          timeline: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["window", "tasks", "owner", "output"],
              properties: {
                window: { type: "string" },
                tasks: { type: "array", items: { type: "string" } },
                owner: { type: "string" },
                output: { type: "string" }
              }
            }
          },
          templates: { type: "array", items: { type: "string" } },
          scripts: { type: "array", items: { type: "string" } },
          prompts: { type: "array", items: { type: "string" } },
          checklists: { type: "array", items: { type: "string" } }
        }
      },
      metrics: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["metric", "definition", "target", "owner", "cadence"],
          properties: {
            metric: { type: "string" },
            definition: { type: "string" },
            target: { type: "string" },
            owner: { type: "string" },
            cadence: { type: "string" }
          }
        }
      },
      risks_and_controls: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["risk", "likelihood_label", "impact_label", "control", "owner"],
          properties: {
            risk: { type: "string" },
            likelihood_label: { type: "string", enum: IMPACT_LABELS },
            impact_label: { type: "string", enum: IMPACT_LABELS },
            control: { type: "string" },
            owner: { type: "string" }
          }
        }
      },
      prioritization: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "recommendation",
            "impact",
            "effort",
            "risk",
            "time_to_test",
            "ai_suitability",
            "human_oversight_required",
            "priority_label"
          ],
          properties: {
            recommendation: { type: "string" },
            impact: { type: "string", enum: IMPACT_LABELS },
            effort: { type: "string", enum: IMPACT_LABELS },
            risk: { type: "string", enum: IMPACT_LABELS },
            time_to_test: { type: "string", enum: IMPACT_LABELS },
            ai_suitability: { type: "string", enum: IMPACT_LABELS },
            human_oversight_required: { type: "string", enum: IMPACT_LABELS },
            priority_label: { type: "string", enum: IMPACT_LABELS }
          }
        }
      },
      next_actions: { type: "array", items: { type: "string" } },
      known_assumed_unknown: {
        type: "object",
        additionalProperties: false,
        required: ["known", "assumed", "unknown"],
        properties: {
          known: { type: "array", items: { type: "string" } },
          assumed: { type: "array", items: { type: "string" } },
          unknown: { type: "array", items: { type: "string" } }
        }
      },
      pathway_payload: {
        type: "object",
        additionalProperties: false,
        required: ["mode", "discovery_system", "workflow_system", "full_operating_system"],
        properties: {
          mode: { type: "string", enum: OUTPUT_PATHWAYS },
          discovery_system: {
            type: "object",
            additionalProperties: false,
            required: [
              "assumptions",
              "unknowns",
              "risks",
              "research_questions",
              "first_experiments",
              "validation_steps",
              "plan_14_day"
            ],
            properties: {
              assumptions: { type: "array", items: { type: "string" } },
              unknowns: { type: "array", items: { type: "string" } },
              risks: { type: "array", items: { type: "string" } },
              research_questions: { type: "array", items: { type: "string" } },
              first_experiments: { type: "array", items: { type: "string" } },
              validation_steps: { type: "array", items: { type: "string" } },
              plan_14_day: { type: "array", items: { type: "string" } }
            }
          },
          workflow_system: {
            type: "object",
            additionalProperties: false,
            required: [
              "workflow_blueprint_notes",
              "ai_use_cases",
              "human_roles",
              "sop_focus",
              "quality_gates",
              "execution_steps"
            ],
            properties: {
              workflow_blueprint_notes: { type: "array", items: { type: "string" } },
              ai_use_cases: { type: "array", items: { type: "string" } },
              human_roles: { type: "array", items: { type: "string" } },
              sop_focus: { type: "array", items: { type: "string" } },
              quality_gates: { type: "array", items: { type: "string" } },
              execution_steps: { type: "array", items: { type: "string" } }
            }
          },
          full_operating_system: {
            type: "object",
            additionalProperties: false,
            required: [
              "opportunity_map_notes",
              "workflow_notes",
              "ai_use_case_notes",
              "controls",
              "team_roles",
              "sop_list",
              "pilot_30_day",
              "cadence_notes",
              "metrics_notes",
              "risk_notes",
              "next_actions",
              "execution_plan_notes"
            ],
            properties: {
              opportunity_map_notes: { type: "array", items: { type: "string" } },
              workflow_notes: { type: "array", items: { type: "string" } },
              ai_use_case_notes: { type: "array", items: { type: "string" } },
              controls: { type: "array", items: { type: "string" } },
              team_roles: { type: "array", items: { type: "string" } },
              sop_list: { type: "array", items: { type: "string" } },
              pilot_30_day: { type: "array", items: { type: "string" } },
              cadence_notes: { type: "array", items: { type: "string" } },
              metrics_notes: { type: "array", items: { type: "string" } },
              risk_notes: { type: "array", items: { type: "string" } },
              next_actions: { type: "array", items: { type: "string" } },
              execution_plan_notes: { type: "array", items: { type: "string" } }
            }
          }
        }
      },
      responsibility_contract: {
        type: "object",
        additionalProperties: false,
        required: [
          "decision_support_mode",
          "context_attachment_checks",
          "constraint_acknowledgement",
          "smallest_safe_test",
          "non_prescriptive_notice",
          "escalation_triggers"
        ],
        properties: {
          decision_support_mode: {
            type: "string",
            enum: ["Context-attached decision support"]
          },
          context_attachment_checks: {
            type: "array",
            items: { type: "string" }
          },
          constraint_acknowledgement: {
            type: "array",
            items: { type: "string" }
          },
          smallest_safe_test: { type: "string" },
          non_prescriptive_notice: { type: "string" },
          escalation_triggers: {
            type: "array",
            items: { type: "string" }
          }
        }
      },
      grounding_notes: { type: "array", items: { type: "string" } },
      version: {
        type: "object",
        additionalProperties: false,
        required: ["system_id", "revision", "generated_at"],
        properties: {
          system_id: { type: "string" },
          revision: { type: "number" },
          generated_at: { type: "string" }
        }
      }
    }
  }
};

const SYSTEM_PROMPT = [
  "You are O2O for Recruiters (Opportunity-to-Operating-System Engine for recruitment).",
  "You transform recruiter role briefs into structured recruitment operating systems.",
  "MVP vertical focus is Recruitment / Headhunting. Produce recruiter-ready content that can be used immediately.",
  "Always diagnose first, then route, then generate.",
  "",
  "Hard requirements:",
  "1) Classify Opportunity Type into one of the allowed categories.",
  "2) Classify Clarity Level into one of the allowed levels.",
  "3) Choose exactly one Output Pathway: Discovery System, Workflow System, Full Operating System.",
  "4) Fill System Card fields with explicit assumptions, missing info, and a next step.",
  "5) Apply anti-generic rule: ground recommendations in user language, context, constraints, and implied environment.",
  "6) If vague or broad, set clarification.needs_clarification true, ask up to 5 questions, and still produce an assumption-based draft.",
  "7) Prioritize recommendations with HIGH/MEDIUM/LOW labels across impact, effort, risk, time_to_test, ai_suitability, human_oversight_required.",
  "8) Keep output consulting-grade, concise, actionable, and deterministic.",
  "9) For non-selected pathways, keep arrays present but minimal.",
  "10) Return strict JSON only, no markdown.",
  "10a) For refinement mode, return the FULL JSON contract object, never a diff, patch, or partial update.",
  "11) Do not issue blind prescriptions. Frame output as structured decision support with options, assumptions, and controls.",
  "12) Explicitly acknowledge limits, constraints, and uncertainty where present.",
  "13) Always include a smallest safe test before recommending scale actions.",
  "14) For recruitment outputs, include blind_spot_diagnosis BEFORE persona, sourcing, boolean strings, screening rubric, outreach, and sprint planning.",
  "15) In blind_spot_diagnosis, explicitly expose hidden flaw(s) in the role brief and produce a corrected_search_thesis that reframes who should actually be hired.",
  "",
  "Content quality requirements:",
  "- Include concrete pilot actions and quality gates.",
  "- Define where humans approve, review, and override.",
  "- Add practical SOP drafts with triggers and steps.",
  "- Include metrics that can be measured weekly.",
  "- Keep recommendations testable within 2-4 weeks where possible.",
  "- If image context is attached, extract concrete observations from it and tie recommendations to those observations.",
  "- For recruitment outputs, include concrete boolean strings, rubrics, interview questions, outreach copy, and a detailed 21-day sprint.",
  "- Product sentence to embody in output logic: GPT helps search better; O2O should surface when the search is targeting the wrong profile, then build the system to find the right one.",
  "- Use responsibility_contract to prove context attachment and non-prescriptive behavior."
].join("\n");

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return corsResponse(request, env, new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return corsJson(request, env, { ok: true, service: "o2o-engine", now: new Date().toISOString() });
    }

    if (url.pathname === "/api/account" && request.method === "GET") {
      return withErrorBoundary(request, env, () => handleAccount(request, env));
    }

    if (url.pathname === "/api/access/activate" && request.method === "POST") {
      return withErrorBoundary(request, env, () => handleAccessActivate(request, env));
    }

    if (url.pathname === "/api/billing/webhook/lemon" && request.method === "POST") {
      return withErrorBoundary(request, env, () => handleLemonWebhook(request, env));
    }

    if (url.pathname === "/api/build" && request.method === "POST") {
      return withErrorBoundary(request, env, () => handleBuild(request, env));
    }

    if (url.pathname === "/api/refine" && request.method === "POST") {
      return withErrorBoundary(request, env, () => handleRefine(request, env));
    }

    if (url.pathname === "/api/monday-morning" && request.method === "GET") {
      return withErrorBoundary(request, env, () => handleMondayMorning(request, env));
    }

    if (url.pathname === "/api/systems" && request.method === "GET") {
      return withErrorBoundary(request, env, () => handleListSystems(request, env));
    }

    const systemDetailMatch = url.pathname.match(/^\/api\/systems\/([^/]+)$/);
    if (systemDetailMatch && request.method === "GET") {
      return withErrorBoundary(request, env, () => handleGetSystem(request, env, systemDetailMatch[1]));
    }

    const systemActionsMatch = url.pathname.match(/^\/api\/systems\/([^/]+)\/next-actions$/);
    if (systemActionsMatch && request.method === "POST") {
      return withErrorBoundary(request, env, () => handleUpdateNextActions(request, env, systemActionsMatch[1]));
    }

    const systemExportMatch = url.pathname.match(/^\/api\/systems\/([^/]+)\/export$/);
    if (systemExportMatch && request.method === "GET") {
      return withErrorBoundary(request, env, () => handleExportSystem(request, env, systemExportMatch[1]));
    }

    return corsJson(request, env, { ok: false, message: "Not found" }, 404);
  }
};

async function withErrorBoundary(request, env, fn) {
  const rateLimit = await enforceRateLimit(request, env);
  if (rateLimit.limited) {
    return corsJson(
      request,
      env,
      {
        ok: false,
        message: "Rate limit exceeded.",
        retry_after_seconds: rateLimit.retryAfter
      },
      429
    );
  }

  try {
    return await fn();
  } catch (error) {
    const message = String(error && error.message ? error.message : error || "Unexpected error");
    const statusCode = Number(error && error.statusCode);
    const status = Number.isFinite(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500;
    return corsJson(request, env, { ok: false, message }, status);
  }
}

async function handleAccount(request, env) {
  const billingEnforced = isBillingEnforced(env);
  const identity = resolveRequestIdentity(request, null);
  const usageMonth = currentUsageMonthKey();
  const usageUsed = await readUserGenerationUsage(env, identity.user_id, usageMonth);

  if (!hasBillingStore(env)) {
    if (billingEnforced) {
      return corsJson(
        request,
        env,
        {
          ok: false,
          message: "Billing is enforced but SUBSCRIBER_KV is not configured."
        },
        503
      );
    }

    return corsJson(request, env, {
      ok: true,
      billing_enforced: false,
      authenticated: false,
      user_id: identity.user_id,
      usage_hook: {
        month: usageMonth,
        generations_used: usageUsed
      },
      account: null
    });
  }

  if (billingEnforced && !hasSessionSecret(env)) {
    return corsJson(
      request,
      env,
      {
        ok: false,
        message: "Billing is enforced but SESSION_SIGNING_SECRET is not configured."
      },
      503
    );
  }

  const resolved = await resolveSubscriberFromRequest(request, env);
  if (!resolved.subscriber || !isSubscriberActive(resolved.subscriber)) {
    return corsJson(request, env, {
      ok: true,
      billing_enforced: billingEnforced,
      authenticated: false,
      user_id: identity.user_id,
      usage_hook: {
        month: usageMonth,
        generations_used: usageUsed
      },
      account: null
    });
  }

  const resolvedIdentity = resolveRequestIdentity(request, resolved.subscriber);
  const account = await buildAccountView(env, resolved.subscriber);
  return corsJson(request, env, {
    ok: true,
    billing_enforced: billingEnforced,
    authenticated: true,
    user_id: resolvedIdentity.user_id,
    usage_hook: {
      month: usageMonth,
      generations_used: await readUserGenerationUsage(env, resolvedIdentity.user_id, usageMonth)
    },
    account
  });
}

async function handleAccessActivate(request, env) {
  if (!hasBillingStore(env)) {
    return corsJson(
      request,
      env,
      {
        ok: false,
        message: "SUBSCRIBER_KV is not configured for buyer access control."
      },
      503
    );
  }

  if (!hasSessionSecret(env)) {
    return corsJson(
      request,
      env,
      {
        ok: false,
        message: "SESSION_SIGNING_SECRET is required before activating access codes."
      },
      503
    );
  }

  const body = await safeJson(request);
  const accessCode = normalizeAccessCode(body.accessCode);
  if (!accessCode) {
    return corsJson(request, env, { ok: false, message: "Field accessCode is required." }, 400);
  }

  const subscriber = await getSubscriberByAccessCode(env, accessCode);
  if (!subscriber) {
    return corsJson(request, env, { ok: false, message: "Access code not recognized." }, 404);
  }

  if (!isSubscriberActive(subscriber)) {
    return corsJson(
      request,
      env,
      {
        ok: false,
        message: "Subscription is not active. Reactivate billing to continue."
      },
      403
    );
  }

  const token = await issueSessionToken(env, { subscriber_id: subscriber.subscriber_id });
  const account = await buildAccountView(env, subscriber);
  const identity = resolveRequestIdentity(request, subscriber);

  return corsJson(request, env, {
    ok: true,
    billing_enforced: isBillingEnforced(env),
    authenticated: true,
    user_id: identity.user_id,
    token,
    account
  });
}

async function handleLemonWebhook(request, env) {
  if (!hasBillingStore(env)) {
    return corsJson(
      request,
      env,
      {
        ok: false,
        message: "SUBSCRIBER_KV is required for webhook sync."
      },
      503
    );
  }

  const rawBody = await request.text();
  if (!rawBody.trim()) {
    return corsJson(request, env, { ok: false, message: "Webhook body is empty." }, 400);
  }

  const webhookSecret = String(env.LEMON_WEBHOOK_SECRET || "").trim();
  if (webhookSecret) {
    const signature =
      request.headers.get("X-Signature") ||
      request.headers.get("x-signature") ||
      request.headers.get("Lemon-Signature") ||
      "";

    const valid = await verifyWebhookSignature(webhookSecret, rawBody, signature);
    if (!valid) {
      return corsJson(request, env, { ok: false, message: "Invalid webhook signature." }, 401);
    }
  }

  let payload = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return corsJson(request, env, { ok: false, message: "Webhook body is not valid JSON." }, 400);
  }

  const normalized = normalizeLemonWebhookPayload(payload, env);
  if (!normalized) {
    return corsJson(request, env, { ok: true, ignored: true, message: "Unsupported webhook payload." });
  }

  const subscriber = await upsertSubscriberFromWebhook(env, normalized);
  return corsJson(request, env, {
    ok: true,
    subscriber_id: subscriber.subscriber_id,
    plan: subscriber.plan,
    status: subscriber.status
  });
}

async function handleMondayMorning(request, env) {
  const access = await authorizeGenerationRequest(request, env);
  if (access.response) {
    return access.response;
  }

  ensureMemoryStoreConfigured(request, env);

  const identity = resolveRequestIdentity(request, access.subscriber);
  const systems = await listSystemsForUser(env, identity.user_id);

  const sortedSystems = [...systems].sort((left, right) => {
    const leftTs = Date.parse(left.last_viewed_at || left.updated_at || left.created_at || 0);
    const rightTs = Date.parse(right.last_viewed_at || right.updated_at || right.created_at || 0);
    return rightTs - leftTs;
  });

  const lastActive = sortedSystems.find((item) => item.status !== "archived") || sortedSystems[0] || null;
  const allActions = [];

  for (const system of sortedSystems) {
    const actions = await getNextActions(env, system.id, identity.user_id);
    for (const action of actions) {
      allActions.push({
        ...action,
        system_title: system.title || "Untitled System"
      });
    }
  }

  const nowIso = new Date().toISOString().slice(0, 10);
  const overdue = allActions
    .filter((action) => action.status !== "done" && action.due_date && action.due_date < nowIso)
    .sort((left, right) => String(left.due_date).localeCompare(String(right.due_date)));

  const upcoming = allActions
    .filter((action) => action.status !== "done" && action.due_date && action.due_date >= nowIso)
    .sort((left, right) => String(left.due_date).localeCompare(String(right.due_date)));

  let lastActiveSummary = null;
  if (lastActive) {
    const latestVersion = await getLatestSystemVersion(env, lastActive.id, identity.user_id);
    lastActiveSummary = {
      id: lastActive.id,
      title: lastActive.title,
      updated_at: lastActive.updated_at,
      summary: summarizeSystem(latestVersion ? latestVersion.system_json : null),
      key_next_actions: (await getNextActions(env, lastActive.id, identity.user_id)).slice(0, 5)
    };
  }

  return corsJson(request, env, {
    ok: true,
    user_id: identity.user_id,
    billing_enforced: access.billing_enforced,
    last_active_system: lastActiveSummary,
    upcoming_next_actions: upcoming,
    overdue_next_actions: overdue
  });
}

async function handleListSystems(request, env) {
  const access = await authorizeGenerationRequest(request, env);
  if (access.response) {
    return access.response;
  }

  ensureMemoryStoreConfigured(request, env);
  const identity = resolveRequestIdentity(request, access.subscriber);
  const systems = await listSystemsForUser(env, identity.user_id);

  const view = systems.map((system) => ({
    id: system.id,
    title: system.title,
    status: system.status,
    created_at: system.created_at,
    updated_at: system.updated_at,
    last_viewed_at: system.last_viewed_at,
    latest_version_number: system.latest_version_number
  }));

  return corsJson(request, env, {
    ok: true,
    user_id: identity.user_id,
    systems: view
  });
}

async function handleGetSystem(request, env, rawSystemId) {
  const access = await authorizeGenerationRequest(request, env);
  if (access.response) {
    return access.response;
  }

  ensureMemoryStoreConfigured(request, env);

  const identity = resolveRequestIdentity(request, access.subscriber);
  const systemId = cleanText(rawSystemId, 120);
  const metadata = await getSystemMetadata(env, systemId);

  if (!metadata || metadata.user_id !== identity.user_id) {
    return corsJson(request, env, { ok: false, message: "System not found." }, 404);
  }

  const latestVersion = await getLatestSystemVersion(env, systemId, identity.user_id);
  if (!latestVersion) {
    return corsJson(request, env, { ok: false, message: "System version not found." }, 404);
  }

  metadata.last_viewed_at = new Date().toISOString();
  await putSystemMetadata(env, metadata);

  return corsJson(request, env, {
    ok: true,
    user_id: identity.user_id,
    system: latestVersion.system_json,
    metadata,
    version_number: latestVersion.version_number,
    next_actions: await getNextActions(env, systemId, identity.user_id)
  });
}

async function handleUpdateNextActions(request, env, rawSystemId) {
  const access = await authorizeGenerationRequest(request, env);
  if (access.response) {
    return access.response;
  }

  ensureMemoryStoreConfigured(request, env);

  const identity = resolveRequestIdentity(request, access.subscriber);
  const systemId = cleanText(rawSystemId, 120);
  const metadata = await getSystemMetadata(env, systemId);

  if (!metadata || metadata.user_id !== identity.user_id) {
    return corsJson(request, env, { ok: false, message: "System not found." }, 404);
  }

  const body = await safeJson(request);
  const actions = Array.isArray(body.actions) ? body.actions : [];
  const normalized = normalizeNextActions(actions, {
    system_id: systemId,
    user_id: identity.user_id,
    now: new Date().toISOString()
  });

  await setNextActions(env, systemId, identity.user_id, normalized);
  metadata.updated_at = new Date().toISOString();
  await putSystemMetadata(env, metadata);

  return corsJson(request, env, {
    ok: true,
    user_id: identity.user_id,
    next_actions: normalized
  });
}

async function handleExportSystem(request, env, rawSystemId) {
  const access = await authorizeGenerationRequest(request, env);
  if (access.response) {
    return access.response;
  }

  ensureMemoryStoreConfigured(request, env);

  const identity = resolveRequestIdentity(request, access.subscriber);
  const systemId = cleanText(rawSystemId, 120);
  const metadata = await getSystemMetadata(env, systemId);

  if (!metadata || metadata.user_id !== identity.user_id) {
    return corsJson(request, env, { ok: false, message: "System not found." }, 404);
  }

  const latestVersion = await getLatestSystemVersion(env, systemId, identity.user_id);
  if (!latestVersion) {
    return corsJson(request, env, { ok: false, message: "System version not found." }, 404);
  }

  const nextActions = await getNextActions(env, systemId, identity.user_id);
  const markdown = buildSystemMarkdown(latestVersion.system_json, metadata, nextActions);
  const url = new URL(request.url);
  const format = cleanText(url.searchParams.get("format"), 20).toLowerCase() || "markdown";

  if (format === "markdown") {
    return corsResponse(
      request,
      env,
      new Response(markdown, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8"
        }
      })
    );
  }

  if (format !== "pdf") {
    return corsJson(request, env, { ok: false, message: "Unsupported export format." }, 400);
  }

  const pdfExportUrl = cleanText(env.PDF_EXPORT_SERVICE_URL, 600);
  if (!pdfExportUrl) {
    return corsJson(
      request,
      env,
      {
        ok: false,
        message: "PDF export service is not configured. Set PDF_EXPORT_SERVICE_URL."
      },
      503
    );
  }

  const pdfResponse = await fetch(`${pdfExportUrl.replace(/\/+$/, "")}/api/export/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: metadata.title,
      markdown
    })
  });

  if (!pdfResponse.ok) {
    const detail = await pdfResponse.text();
    return corsJson(
      request,
      env,
      {
        ok: false,
        message: `PDF export failed: ${detail.slice(0, 400)}`
      },
      502
    );
  }

  const pdfBytes = await pdfResponse.arrayBuffer();
  return corsResponse(
    request,
    env,
    new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName(metadata.title || "o2o-system")}.pdf"`
      }
    })
  );
}

async function handleBuild(request, env) {
  if (!env.OPENAI_API_KEY) {
    return corsJson(request, env, { ok: false, message: "Missing OPENAI_API_KEY secret." }, 500);
  }

  const access = await authorizeGenerationRequest(request, env);
  if (access.response) {
    return access.response;
  }

  ensureMemoryStoreConfigured(request, env);

  const subscriber = access.subscriber;
  const identity = resolveRequestIdentity(request, subscriber);
  const planLimits = subscriber ? getPlanLimits(subscriber.plan) : null;
  const imageLimitBytes = planLimits ? planLimits.max_image_bytes : MAX_IMAGE_BYTES;

  const body = await safeJson(request);
  const userInput = cleanText(body.idea, 12000);
  const imageContext = normalizeImageContext(body.imageContext, imageLimitBytes);

  if (!userInput) {
    return corsJson(request, env, { ok: false, message: "Field idea is required." }, 400);
  }

  if (body.imageContext && !imageContext) {
    const maxMb = (imageLimitBytes / (1024 * 1024)).toFixed(imageLimitBytes % (1024 * 1024) === 0 ? 0 : 2);
    return corsJson(
      request,
      env,
      { ok: false, message: `imageContext must be a PNG/JPEG/WebP/GIF image up to ${maxMb} MB.` },
      400
    );
  }

  if (subscriber) {
    const quota = await checkGenerationQuota(env, subscriber);
    if (!quota.allowed) {
      const account = await buildAccountView(env, subscriber);
      return corsJson(
        request,
        env,
        {
          ok: false,
          message: "Generation quota reached for the current billing period. Upgrade or wait for reset.",
          billing_enforced: access.billing_enforced,
          account
        },
        402
      );
    }
  }

  const inputPayload = {
    action: "build_system",
    user_id: identity.user_id,
    vertical_focus: cleanText(body.verticalFocus, 160) || "Recruitment / Headhunting",
    demo_mode: Boolean(body.demoMode),
    user_input: userInput,
    opportunity_type_hint: cleanText(body.opportunityTypeHint, 100),
    stage: cleanText(body.stage, 100),
    goal: cleanText(body.goal, 120),
    constraints: cleanText(body.constraints, 3000),
    context: cleanText(body.context, 3000),
    image_context: imageContext
      ? {
          file_name: imageContext.file_name,
          mime_type: imageContext.mime_type,
          estimated_bytes: imageContext.estimated_bytes,
          purpose: "visual_context_for_diagnosis"
        }
      : null,
    allow_assumptions: body.allowAssumptions !== false,
    generated_at: new Date().toISOString()
  };

  const normalized = await generateValidatedSystem(env, {
    mode: "build",
    payload: inputPayload,
    sourceInput: userInput,
    priorSystem: null,
    options: { imageContext },
    userId: identity.user_id
  });

  const persisted = await createSystemWithFirstVersion(env, {
    user_id: identity.user_id,
    title: cleanText(body.title, 160) || deriveSystemTitle(userInput),
    system_json: normalized
  });

  let account = null;
  if (subscriber) {
    await incrementGenerationUsage(env, subscriber.subscriber_id);
    account = await buildAccountView(env, subscriber);
  }

  await incrementUserGenerationUsage(env, identity.user_id);
  const usageMonth = currentUsageMonthKey();
  const usageUsed = await readUserGenerationUsage(env, identity.user_id, usageMonth);

  return corsJson(request, env, {
    ok: true,
    user_id: identity.user_id,
    system_id: persisted.system_id,
    version_number: persisted.version_number,
    system: normalized,
    metadata: persisted.metadata,
    next_actions: persisted.next_actions,
    usage_hook: {
      month: usageMonth,
      generations_used: usageUsed
    },
    billing_enforced: access.billing_enforced,
    account,
    trace: {
      pathway: normalized.system_card.output_pathway,
      clarity: normalized.system_card.clarity_level,
      confidence: normalized.system_card.confidence_level
    }
  });
}

async function handleRefine(request, env) {
  if (!env.OPENAI_API_KEY) {
    return corsJson(request, env, { ok: false, message: "Missing OPENAI_API_KEY secret." }, 500);
  }

  const access = await authorizeGenerationRequest(request, env);
  if (access.response) {
    return access.response;
  }

  ensureMemoryStoreConfigured(request, env);

  const subscriber = access.subscriber;
  const identity = resolveRequestIdentity(request, subscriber);

  const body = await safeJson(request);
  const systemId = cleanText(body.systemId, 120);
  const submittedVersion = Number(body.versionNumber);
  const command = cleanText(body.command, 600);

  if (!systemId) {
    return corsJson(request, env, { ok: false, message: "Field systemId is required." }, 400);
  }

  if (!Number.isFinite(submittedVersion) || submittedVersion < 1) {
    return corsJson(request, env, { ok: false, message: "Field versionNumber is required." }, 400);
  }

  if (!command) {
    return corsJson(request, env, { ok: false, message: "Field command is required." }, 400);
  }

  const metadata = await getSystemMetadata(env, systemId);
  if (!metadata || metadata.user_id !== identity.user_id) {
    return corsJson(request, env, { ok: false, message: "System not found." }, 404);
  }

  const latestVersion = await getLatestSystemVersion(env, systemId, identity.user_id);
  if (!latestVersion) {
    return corsJson(request, env, { ok: false, message: "System version not found." }, 404);
  }

  if (submittedVersion !== Number(latestVersion.version_number)) {
    return corsJson(
      request,
      env,
      {
        ok: false,
        message: "Version conflict. Reload latest system before refining.",
        latest_version_number: latestVersion.version_number
      },
      409
    );
  }

  if (subscriber) {
    const quota = await checkGenerationQuota(env, subscriber);
    if (!quota.allowed) {
      const account = await buildAccountView(env, subscriber);
      return corsJson(
        request,
        env,
        {
          ok: false,
          message: "Generation quota reached for the current billing period. Upgrade or wait for reset.",
          billing_enforced: access.billing_enforced,
          account
        },
        402
      );
    }
  }

  const refinePayload = {
    action: "refine_existing_system",
    user_id: identity.user_id,
    system_id: systemId,
    current_version_number: latestVersion.version_number,
    refinement_rule: "Return the FULL system JSON contract. Partial diffs are invalid.",
    refinement_command: command,
    user_delta_context: cleanText(body.userDeltaContext, 2500),
    current_system: latestVersion.system_json,
    generated_at: new Date().toISOString()
  };

  const normalized = await generateValidatedSystem(env, {
    mode: "refine",
    payload: refinePayload,
    sourceInput: command,
    priorSystem: latestVersion.system_json,
    options: {},
    userId: identity.user_id
  });

  const persisted = await appendSystemVersion(env, {
    user_id: identity.user_id,
    system_id: systemId,
    expected_current_version: latestVersion.version_number,
    system_json: normalized
  });

  let account = null;
  if (subscriber) {
    await incrementGenerationUsage(env, subscriber.subscriber_id);
    account = await buildAccountView(env, subscriber);
  }

  await incrementUserGenerationUsage(env, identity.user_id);
  const usageMonth = currentUsageMonthKey();
  const usageUsed = await readUserGenerationUsage(env, identity.user_id, usageMonth);

  return corsJson(request, env, {
    ok: true,
    user_id: identity.user_id,
    system_id: persisted.system_id,
    version_number: persisted.version_number,
    system: normalized,
    metadata: persisted.metadata,
    next_actions: persisted.next_actions,
    usage_hook: {
      month: usageMonth,
      generations_used: usageUsed
    },
    billing_enforced: access.billing_enforced,
    account
  });
}

async function generateValidatedSystem(env, input) {
  const maxAttempts = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const correctiveInstruction =
      attempt === 1
        ? ""
        : [
            "Previous attempt returned invalid or partial JSON.",
            "Return the FULL deterministic contract object with all required fields.",
            "Do not return a diff, patch, or only changed fields."
          ].join(" ");

    try {
      const generated = await callOpenAIForSystem(env, input.mode, input.payload, {
        ...(input.options || {}),
        correctiveInstruction,
        forceFullContract: input.mode === "refine"
      });

      const rawValidation = validateRawModelOutput(generated);
      if (!rawValidation.ok) {
        throw new Error(rawValidation.message);
      }

      const normalized = normalizeOutput(generated, {
        mode: input.mode,
        priorSystem: input.priorSystem,
        sourceInput: input.sourceInput,
        userId: input.userId
      });

      const normalizedValidation = validateNormalizedSystem(normalized);
      if (!normalizedValidation.ok) {
        throw new Error(normalizedValidation.message);
      }

      return normalized;
    } catch (error) {
      lastError = error;
    }
  }

  const detail = String(lastError && lastError.message ? lastError.message : lastError || "Validation failed");
  throw new Error(`Model returned invalid or partial system JSON after retry. ${detail}`);
}

async function callOpenAIForSystem(env, mode, payload, options = {}) {
  const model = env.OPENAI_MODEL || "gpt-4.1-mini";

  const userTextPayload = {
    mode,
    payload,
    requirements: {
      full_contract_required: Boolean(options.forceFullContract),
      corrective_instruction: cleanText(options.correctiveInstruction, 600)
    },
    contract: {
      opportunity_types: OPPORTUNITY_TYPES,
      clarity_levels: CLARITY_LEVELS,
      output_pathways: OUTPUT_PATHWAYS,
      labels: IMPACT_LABELS
    }
  };

  const userContent = [{ type: "text", text: JSON.stringify(userTextPayload) }];

  if (mode === "build" && options.imageContext && options.imageContext.data_url) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: options.imageContext.data_url
      }
    });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: userContent
    }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.15,
      response_format: {
        type: "json_schema",
        json_schema: OUTPUT_SCHEMA
      },
      messages
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${detail.slice(0, 1200)}`);
  }

  const data = await response.json();
  const content = extractAssistantContent(data);

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Model output was not valid JSON.");
  }

  return parsed;
}

function extractAssistantContent(data) {
  const choice = data && data.choices && data.choices[0] ? data.choices[0] : null;
  const message = choice && choice.message ? choice.message : null;
  let content = message ? message.content : "";

  if (Array.isArray(content)) {
    content = content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (part && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("\n");
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenAI returned an empty response.");
  }

  return content;
}

function normalizeOutput(raw, context) {
  const safe = raw && typeof raw === "object" ? raw : {};
  const now = new Date().toISOString();
  const prior = context.priorSystem && typeof context.priorSystem === "object" ? context.priorSystem : null;
  const priorVersion = prior && prior.version ? prior.version : null;

  if (!safe.version || typeof safe.version !== "object") {
    safe.version = {};
  }

  safe.version.system_id =
    (safe.version.system_id && String(safe.version.system_id).trim()) ||
    (priorVersion && priorVersion.system_id) ||
    crypto.randomUUID();

  const priorRevision = priorVersion && Number.isFinite(Number(priorVersion.revision))
    ? Number(priorVersion.revision)
    : 0;

  safe.version.revision = context.mode === "refine" ? priorRevision + 1 : Math.max(1, Number(safe.version.revision || 1));
  safe.version.generated_at = now;

  if (!safe.system_card || typeof safe.system_card !== "object") {
    safe.system_card = {
      opportunity_type: "Strategy / Discovery",
      clarity_level: "Needs Discovery",
      output_pathway: "Discovery System",
      confidence_level: "MEDIUM",
      key_assumptions: [],
      missing_information: [],
      recommended_next_step: "Run a 14-day discovery sprint to collect missing constraints."
    };
  }

  safe.system_card.opportunity_type = ensureEnum(
    safe.system_card.opportunity_type,
    OPPORTUNITY_TYPES,
    "Strategy / Discovery"
  );
  safe.system_card.clarity_level = ensureEnum(
    safe.system_card.clarity_level,
    CLARITY_LEVELS,
    "Needs Discovery"
  );
  safe.system_card.output_pathway = ensureEnum(
    safe.system_card.output_pathway,
    OUTPUT_PATHWAYS,
    "Discovery System"
  );
  safe.system_card.confidence_level = ensureEnum(
    safe.system_card.confidence_level,
    IMPACT_LABELS,
    "MEDIUM"
  );

  safe.system_card.key_assumptions = ensureStringArray(safe.system_card.key_assumptions);
  safe.system_card.missing_information = ensureStringArray(safe.system_card.missing_information);
  safe.system_card.recommended_next_step =
    cleanText(safe.system_card.recommended_next_step, 500) ||
    "Confirm constraints and run the first pilot step.";

  safe.recruitment_operating_system = normalizeRecruitmentOperatingSystem(
    safe.recruitment_operating_system,
    context.sourceInput
  );

  safe.grounding_notes = ensureStringArray(safe.grounding_notes);
  if (!safe.grounding_notes.length) {
    safe.grounding_notes = [
      "Grounding note was missing. Validate recommendations against user language before execution."
    ];
  }

  const overlap = groundingOverlapScore(context.sourceInput, JSON.stringify(safe));
  if (overlap < 0.02) {
    safe.grounding_notes.push(
      "Low lexical overlap with input context detected. Review for generic drift before execution."
    );
    safe.system_card.confidence_level = "LOW";
  }

  if (!safe.clarification || typeof safe.clarification !== "object") {
    safe.clarification = {
      needs_clarification: false,
      questions: [],
      assumption_based_draft_used: false
    };
  }

  safe.clarification.needs_clarification = Boolean(safe.clarification.needs_clarification);
  safe.clarification.questions = ensureStringArray(safe.clarification.questions).slice(0, 5);
  safe.clarification.assumption_based_draft_used = Boolean(safe.clarification.assumption_based_draft_used);

  if (safe.system_card.clarity_level === "Vague" || safe.system_card.clarity_level === "Broad") {
    safe.clarification.needs_clarification = true;
    safe.clarification.assumption_based_draft_used = true;
  }

  if (!safe.responsibility_contract || typeof safe.responsibility_contract !== "object") {
    safe.responsibility_contract = {};
  }

  safe.responsibility_contract.decision_support_mode = "Context-attached decision support";
  safe.responsibility_contract.context_attachment_checks = ensureStringArray(
    safe.responsibility_contract.context_attachment_checks
  );
  if (!safe.responsibility_contract.context_attachment_checks.length) {
    safe.responsibility_contract.context_attachment_checks = [
      "Recommendations are tied to user-provided language and stated context.",
      "Assumptions are explicitly marked and separated from known facts.",
      "Missing information is surfaced before high-commitment actions."
    ];
  }

  safe.responsibility_contract.constraint_acknowledgement = ensureStringArray(
    safe.responsibility_contract.constraint_acknowledgement
  );
  if (!safe.responsibility_contract.constraint_acknowledgement.length) {
    safe.responsibility_contract.constraint_acknowledgement = [
      "No assumption of budget, team capacity, or tooling without explicit confirmation.",
      "Recommendations should start with low-risk, reversible experiments.",
      "High-risk actions require human approval gates before execution."
    ];
  }

  safe.responsibility_contract.smallest_safe_test =
    cleanText(safe.responsibility_contract.smallest_safe_test, 500) ||
    "Run one low-cost, time-boxed pilot for 3-7 days and define stop conditions before scaling.";

  safe.responsibility_contract.non_prescriptive_notice =
    cleanText(safe.responsibility_contract.non_prescriptive_notice, 600) ||
    "This output is structured decision support, not a blind prescription. Validate assumptions and constraints before committing resources.";

  safe.responsibility_contract.escalation_triggers = ensureStringArray(
    safe.responsibility_contract.escalation_triggers
  );
  if (!safe.responsibility_contract.escalation_triggers.length) {
    safe.responsibility_contract.escalation_triggers = [
      "Pause execution when data quality is low or contradictory.",
      "Escalate to human review when recommendations affect legal, financial, or reputational risk.",
      "Stop and re-diagnose when pilot metrics are below threshold for two consecutive cycles."
    ];
  }

  safe.next_actions = ensureStringArray(safe.next_actions);
  if (!safe.next_actions.length) {
    safe.next_actions = [safe.responsibility_contract.smallest_safe_test];
  }

  const hasSafeTestAction = safe.next_actions.some((item) => /test|pilot|experiment/i.test(item));
  if (!hasSafeTestAction) {
    safe.next_actions.unshift(safe.responsibility_contract.smallest_safe_test);
  }

  if (safe.system_card.missing_information.length >= 3 && safe.system_card.confidence_level === "HIGH") {
    safe.system_card.confidence_level = "MEDIUM";
    safe.grounding_notes.push(
      "Confidence reduced because critical information is still missing."
    );
  }

  return safe;
}

function groundingOverlapScore(source, output) {
  const sourceWords = tokenize(source).filter((word) => word.length >= 5);
  if (!sourceWords.length) {
    return 1;
  }

  const outputSet = new Set(tokenize(output));
  let hits = 0;
  for (const word of sourceWords) {
    if (outputSet.has(word)) {
      hits += 1;
    }
  }

  return hits / sourceWords.length;
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function ensureStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => cleanText(item, 400)).filter(Boolean);
}

function ensureEnum(value, options, fallback) {
  const text = cleanText(value, 100);
  if (options.includes(text)) {
    return text;
  }
  return fallback;
}

function cleanText(value, limit) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  return text.slice(0, limit);
}

function validateRawModelOutput(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, message: "Model output is not a JSON object." };
  }

  const requiredKeys = Array.isArray(OUTPUT_SCHEMA.schema.required) ? OUTPUT_SCHEMA.schema.required : [];
  const missing = requiredKeys.filter((key) => !(key in raw));
  if (missing.length) {
    return {
      ok: false,
      message: `Model output is partial. Missing keys: ${missing.join(", ")}.`
    };
  }

  if (!raw.version || typeof raw.version !== "object") {
    return { ok: false, message: "Model output is missing version object." };
  }

  if (!Number.isFinite(Number(raw.version.revision || 0))) {
    return { ok: false, message: "Model output has invalid version.revision." };
  }

  return { ok: true };
}

function validateNormalizedSystem(system) {
  const rawValidation = validateRawModelOutput(system);
  if (!rawValidation.ok) {
    return rawValidation;
  }

  if (!system.system_card || typeof system.system_card !== "object") {
    return { ok: false, message: "Normalized system is missing system_card." };
  }

  if (!system.recruitment_operating_system || typeof system.recruitment_operating_system !== "object") {
    return { ok: false, message: "Normalized system is missing recruitment_operating_system." };
  }

  const recruitment = system.recruitment_operating_system;
  const requiredRecruitmentKeys = [
    "job_ad_diagnosis",
    "blind_spot_diagnosis",
    "hidden_success_profile",
    "ideal_candidate_persona",
    "wildcard_adjacent_profiles",
    "sourcing_strategy",
    "boolean_search_strings",
    "screening_rubric",
    "interview_questions",
    "red_flags",
    "outreach_message",
    "shortlist_scorecard",
    "search_sprint_21_day_plan",
    "client_briefing_notes",
    "hiring_operating_cadence"
  ];

  const missingRecruitment = requiredRecruitmentKeys.filter((key) => !(key in recruitment));
  if (missingRecruitment.length) {
    return {
      ok: false,
      message: `Recruitment contract missing keys: ${missingRecruitment.join(", ")}.`
    };
  }

  return { ok: true };
}

function normalizeRecruitmentOperatingSystem(value, sourceInput) {
  const fallback = createRecruitmentFallback(sourceInput);
  const safe = value && typeof value === "object" ? value : {};

  const blindSpots = safe.blind_spot_diagnosis && typeof safe.blind_spot_diagnosis === "object"
    ? safe.blind_spot_diagnosis
    : {};

  const persona = safe.ideal_candidate_persona && typeof safe.ideal_candidate_persona === "object"
    ? safe.ideal_candidate_persona
    : {};

  const sourcing = safe.sourcing_strategy && typeof safe.sourcing_strategy === "object"
    ? safe.sourcing_strategy
    : {};

  const interview = safe.interview_questions && typeof safe.interview_questions === "object"
    ? safe.interview_questions
    : {};

  const sprint = safe.search_sprint_21_day_plan && typeof safe.search_sprint_21_day_plan === "object"
    ? safe.search_sprint_21_day_plan
    : {};

  const cadence = safe.hiring_operating_cadence && typeof safe.hiring_operating_cadence === "object"
    ? safe.hiring_operating_cadence
    : {};

  return {
    job_ad_diagnosis: cleanText(safe.job_ad_diagnosis, 1200) || fallback.job_ad_diagnosis,
    blind_spot_diagnosis: {
      stated_need: cleanText(blindSpots.stated_need, 900) || fallback.blind_spot_diagnosis.stated_need,
      likely_real_need: cleanText(blindSpots.likely_real_need, 900) || fallback.blind_spot_diagnosis.likely_real_need,
      false_assumptions: ensureStringArray(blindSpots.false_assumptions).length
        ? ensureStringArray(blindSpots.false_assumptions)
        : fallback.blind_spot_diagnosis.false_assumptions,
      hidden_failure_modes: ensureStringArray(blindSpots.hidden_failure_modes).length
        ? ensureStringArray(blindSpots.hidden_failure_modes)
        : fallback.blind_spot_diagnosis.hidden_failure_modes,
      wrong_candidate_risks: ensureStringArray(blindSpots.wrong_candidate_risks).length
        ? ensureStringArray(blindSpots.wrong_candidate_risks)
        : fallback.blind_spot_diagnosis.wrong_candidate_risks,
      missing_success_definition: ensureStringArray(blindSpots.missing_success_definition).length
        ? ensureStringArray(blindSpots.missing_success_definition)
        : fallback.blind_spot_diagnosis.missing_success_definition,
      compensation_or_level_mismatch: ensureStringArray(blindSpots.compensation_or_level_mismatch).length
        ? ensureStringArray(blindSpots.compensation_or_level_mismatch)
        : fallback.blind_spot_diagnosis.compensation_or_level_mismatch,
      passive_candidate_reality: cleanText(blindSpots.passive_candidate_reality, 900)
        || fallback.blind_spot_diagnosis.passive_candidate_reality,
      corrected_search_thesis: cleanText(blindSpots.corrected_search_thesis, 1000)
        || fallback.blind_spot_diagnosis.corrected_search_thesis
    },
    hidden_success_profile: cleanText(safe.hidden_success_profile, 1200) || fallback.hidden_success_profile,
    ideal_candidate_persona: {
      mission: cleanText(persona.mission, 600) || fallback.ideal_candidate_persona.mission,
      must_have_competencies: ensureStringArray(persona.must_have_competencies).length
        ? ensureStringArray(persona.must_have_competencies)
        : fallback.ideal_candidate_persona.must_have_competencies,
      domain_context: ensureStringArray(persona.domain_context).length
        ? ensureStringArray(persona.domain_context)
        : fallback.ideal_candidate_persona.domain_context,
      first_90_day_outcomes: ensureStringArray(persona.first_90_day_outcomes).length
        ? ensureStringArray(persona.first_90_day_outcomes)
        : fallback.ideal_candidate_persona.first_90_day_outcomes
    },
    wildcard_adjacent_profiles: ensureStringArray(safe.wildcard_adjacent_profiles).length
      ? ensureStringArray(safe.wildcard_adjacent_profiles)
      : fallback.wildcard_adjacent_profiles,
    sourcing_strategy: {
      channels: ensureStringArray(sourcing.channels).length
        ? ensureStringArray(sourcing.channels)
        : fallback.sourcing_strategy.channels,
      weekly_targets: ensureStringArray(sourcing.weekly_targets).length
        ? ensureStringArray(sourcing.weekly_targets)
        : fallback.sourcing_strategy.weekly_targets,
      messaging_angles: ensureStringArray(sourcing.messaging_angles).length
        ? ensureStringArray(sourcing.messaging_angles)
        : fallback.sourcing_strategy.messaging_angles
    },
    boolean_search_strings: ensureStringArray(safe.boolean_search_strings).length
      ? ensureStringArray(safe.boolean_search_strings)
      : fallback.boolean_search_strings,
    screening_rubric: normalizeRubricEntries(safe.screening_rubric, fallback.screening_rubric),
    interview_questions: {
      technical: ensureStringArray(interview.technical).length
        ? ensureStringArray(interview.technical)
        : fallback.interview_questions.technical,
      behavioral: ensureStringArray(interview.behavioral).length
        ? ensureStringArray(interview.behavioral)
        : fallback.interview_questions.behavioral,
      execution: ensureStringArray(interview.execution).length
        ? ensureStringArray(interview.execution)
        : fallback.interview_questions.execution,
      stakeholder: ensureStringArray(interview.stakeholder).length
        ? ensureStringArray(interview.stakeholder)
        : fallback.interview_questions.stakeholder
    },
    red_flags: ensureStringArray(safe.red_flags).length ? ensureStringArray(safe.red_flags) : fallback.red_flags,
    outreach_message: cleanText(safe.outreach_message, 1800) || fallback.outreach_message,
    shortlist_scorecard: normalizeScorecardEntries(safe.shortlist_scorecard, fallback.shortlist_scorecard),
    search_sprint_21_day_plan: {
      week1: ensureStringArray(sprint.week1).length ? ensureStringArray(sprint.week1) : fallback.search_sprint_21_day_plan.week1,
      week2: ensureStringArray(sprint.week2).length ? ensureStringArray(sprint.week2) : fallback.search_sprint_21_day_plan.week2,
      week3: ensureStringArray(sprint.week3).length ? ensureStringArray(sprint.week3) : fallback.search_sprint_21_day_plan.week3
    },
    client_briefing_notes: cleanText(safe.client_briefing_notes, 1200) || fallback.client_briefing_notes,
    hiring_operating_cadence: {
      weekly: ensureStringArray(cadence.weekly).length ? ensureStringArray(cadence.weekly) : fallback.hiring_operating_cadence.weekly,
      monthly: ensureStringArray(cadence.monthly).length ? ensureStringArray(cadence.monthly) : fallback.hiring_operating_cadence.monthly
    }
  };
}

function normalizeRubricEntries(value, fallback) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const category = cleanText(entry.category, 200);
      const weight = cleanText(entry.weight, 120);
      const what = cleanText(entry.what_to_look_for, 600);
      if (!category || !weight || !what) {
        return null;
      }

      return {
        category,
        weight,
        what_to_look_for: what
      };
    })
    .filter(Boolean);

  return normalized.length ? normalized : fallback;
}

function normalizeScorecardEntries(value, fallback) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const dimension = cleanText(entry.dimension, 200);
      const description = cleanText(entry.description, 600);
      if (!dimension || !description) {
        return null;
      }

      return {
        dimension,
        description
      };
    })
    .filter(Boolean);

  return normalized.length ? normalized : fallback;
}

function createRecruitmentFallback(sourceInput) {
  const source = cleanText(sourceInput, 800) || "The role brief is broad and missing measurable outcomes.";
  return {
    job_ad_diagnosis:
      `Current brief analysis: ${source}. The ad is likely over-indexed on task lists and under-specified on outcomes, stakeholder map, and success metrics.`,
    blind_spot_diagnosis: {
      stated_need: "Recruiter is requesting fast delivery of a candidate matching visible job-ad criteria.",
      likely_real_need: "Business likely needs a candidate profile defined by outcome ownership and failure-pattern resistance, not just listed tasks.",
      false_assumptions: [
        "Assumes title and seniority label are enough to predict success.",
        "Assumes hiring-manager expectations are already calibrated.",
        "Assumes active applicants represent top-of-market talent."
      ],
      hidden_failure_modes: [
        "Role success criteria are unclear, so interviewers optimize for polish instead of execution signal.",
        "Screening overweights charisma and under-tests operating discipline.",
        "Stakeholder misalignment delays decisions and increases drop-off risk."
      ],
      wrong_candidate_risks: [
        "Candidate with strong interview presence but weak process rigor.",
        "Candidate optimized for transactional wins in a role requiring complex-cycle execution.",
        "Candidate with title fit but low evidence of cross-functional influence."
      ],
      missing_success_definition: [
        "No explicit 90-day outcomes.",
        "No measurable quality bar for shortlist progression.",
        "No agreed weighting for must-have competencies."
      ],
      compensation_or_level_mismatch: [
        "Salary or title band may attract a different segment than the business actually needs.",
        "Stated seniority may be inconsistent with scope complexity and expected ownership."
      ],
      passive_candidate_reality:
        "Highest-fit candidates are often not actively applying; search strategy must target plateau-window passive talent.",
      corrected_search_thesis:
        "Target candidates proven in similar complexity who show disciplined pipeline execution, measurable role outcomes, and evidence of stakeholder alignment under ambiguity."
    },
    hidden_success_profile:
      "Top performer profile: structured operator who can manage ambiguous hiring managers, convert requirements into scoreable criteria, and maintain weekly funnel momentum.",
    ideal_candidate_persona: {
      mission: "Build a reliable shortlist pipeline in 21 days while improving quality-of-hire signal.",
      must_have_competencies: [
        "Outcome-based role scoping",
        "Boolean sourcing and channel diversification",
        "Structured interviewing and debrief facilitation",
        "Stakeholder expectation management"
      ],
      domain_context: [
        "Comfort with technical and non-technical hiring briefs",
        "Ability to convert vague role requests into scorecards",
        "Experience in high-velocity search cycles"
      ],
      first_90_day_outcomes: [
        "Reduce time-to-qualified-shortlist",
        "Increase interview-to-offer conversion quality",
        "Standardize screening rubrics across stakeholders"
      ]
    },
    wildcard_adjacent_profiles: [
      "Customer success leader with hiring ownership",
      "Operations manager with domain hiring depth",
      "Boutique agency researcher with high signal sourcing"
    ],
    sourcing_strategy: {
      channels: [
        "LinkedIn direct + talent pools",
        "Specialist communities and niche boards",
        "Internal referral acceleration campaign"
      ],
      weekly_targets: [
        "40 qualified outreach messages/week",
        "12 screening calls/week",
        "4 calibrated shortlist candidates/week"
      ],
      messaging_angles: [
        "Mission + impact narrative",
        "Role ownership and growth scope",
        "Specific value proposition by candidate segment"
      ]
    },
    boolean_search_strings: [
      "(\"talent acquisition\" OR recruiter) AND (\"stakeholder management\" OR \"hiring manager\") AND (boolean OR sourcing)",
      "(\"technical recruiter\" OR \"search consultant\") AND (scorecard OR \"structured interview\")",
      "(headhunter OR \"executive search\") AND (pipeline OR shortlist) AND (operations OR strategy)"
    ],
    screening_rubric: [
      { category: "Role Scoping", weight: "25%", what_to_look_for: "Can translate vague briefs into measurable outcomes and constraints." },
      { category: "Sourcing Discipline", weight: "25%", what_to_look_for: "Demonstrates multi-channel search design and iterative funnel tuning." },
      { category: "Assessment Quality", weight: "30%", what_to_look_for: "Uses structured evidence capture and bias-resistant evaluation." },
      { category: "Execution Cadence", weight: "20%", what_to_look_for: "Maintains weekly reporting rhythm and proactive risk management." }
    ],
    interview_questions: {
      technical: [
        "Walk through a difficult search where the brief changed mid-process. What did you adjust first?",
        "How do you decide whether to widen or narrow a candidate persona after week one?"
      ],
      behavioral: [
        "Tell us about a time a hiring manager disagreed with your shortlist. How did you resolve it?",
        "Describe how you handled a near-offer candidate drop-off."
      ],
      execution: [
        "What metrics do you monitor weekly to detect sourcing quality decay?",
        "How do you prioritize outreach segments when bandwidth is tight?"
      ],
      stakeholder: [
        "How do you calibrate interviewers who score inconsistently?",
        "What does a high-quality weekly hiring update include?"
      ]
    },
    red_flags: [
      "Cannot articulate role outcomes beyond job description bullets",
      "No evidence of structured scorecard or calibration process",
      "Over-reliance on one sourcing channel",
      "Weak examples of stakeholder conflict management"
    ],
    outreach_message:
      "Hi {{first_name}}, your track record in building high-signal candidate pipelines stood out. We are hiring for a role that owns end-to-end search strategy and stakeholder calibration, with direct impact on speed and quality of hires. If a role with autonomy, measurable outcomes, and visible business impact is interesting, I can share a concise brief.",
    shortlist_scorecard: [
      { dimension: "Role Fit", description: "Alignment with must-have competencies and role outcomes." },
      { dimension: "Execution Signal", description: "Evidence of operating cadence, metrics, and process ownership." },
      { dimension: "Stakeholder Influence", description: "Ability to align cross-functional interview teams." },
      { dimension: "Risk", description: "Potential concerns and mitigation actions before final interview." }
    ],
    search_sprint_21_day_plan: {
      week1: [
        "Finalize success profile and calibration rubric",
        "Launch channel matrix and first outreach batch",
        "Run first shortlist quality checkpoint"
      ],
      week2: [
        "Adjust persona based on response/quality data",
        "Expand adjacent wildcard profiles",
        "Run interviewer calibration workshop"
      ],
      week3: [
        "Deliver final shortlist with scorecards",
        "Pre-close top candidates with tailored value narrative",
        "Submit post-sprint recommendations for cadence optimization"
      ]
    },
    client_briefing_notes:
      "Client briefing should align on non-negotiables, interview ownership, compensation boundaries, and weekly decision SLAs. Include explicit fallback candidate profile before search launch.",
    hiring_operating_cadence: {
      weekly: [
        "Monday: pipeline review and blockers",
        "Wednesday: shortlist calibration",
        "Friday: client decision checkpoint"
      ],
      monthly: [
        "Funnel quality retrospective",
        "Source performance ranking update",
        "Interview rubric tuning"
      ]
    }
  };
}

function isBillingEnforced(env) {
  return String(env.BILLING_ENFORCED || "false").trim().toLowerCase() === "true";
}

function hasBillingStore(env) {
  return Boolean(env.SUBSCRIBER_KV);
}

function getMemoryStore(env) {
  return env.SYSTEM_MEMORY_KV || env.SUBSCRIBER_KV || null;
}

function hasMemoryStore(env) {
  return Boolean(getMemoryStore(env));
}

function ensureMemoryStoreConfigured(request, env) {
  if (!hasMemoryStore(env)) {
    const error = new Error("System memory store is not configured. Bind SYSTEM_MEMORY_KV or SUBSCRIBER_KV.");
    error.statusCode = 503;
    throw error;
  }
}

function hasSessionSecret(env) {
  return Boolean(String(env.SESSION_SIGNING_SECRET || "").trim());
}

function resolvePlanKey(value) {
  const text = String(value || "starter").trim().toLowerCase();
  if (["scale", "team", "enterprise"].includes(text)) {
    return "scale";
  }
  if (text === "pro") {
    return "pro";
  }
  return "starter";
}

function getPlanLimits(planKey) {
  const key = resolvePlanKey(planKey);
  return PLAN_LIMITS[key] || PLAN_LIMITS.starter;
}

function resolveSubscriptionStatus(value) {
  const text = String(value || "inactive").trim().toLowerCase();
  if (text === "cancelled") {
    return "canceled";
  }
  if (text === "on_trial") {
    return "trialing";
  }
  if (!text) {
    return "inactive";
  }
  return text;
}

function isSubscriberActive(subscriber) {
  const status = resolveSubscriptionStatus(subscriber && subscriber.status);
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status);
}

function normalizeAccessCode(value) {
  const code = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  if (code.length < 6 || code.length > 64) {
    return "";
  }
  if (!/^[A-Z0-9\-]+$/.test(code)) {
    return "";
  }
  return code;
}

function normalizeEmail(value) {
  return cleanText(value, 220).toLowerCase();
}

function generateAccessCode() {
  const raw = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `O2O-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

function currentUsageMonthKey(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function usageResetIso(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  return new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0)).toISOString();
}

function usageCounterKey(subscriberId, monthKey) {
  return `usage:${subscriberId}:${monthKey}`;
}

async function readUsageCount(env, subscriberId, monthKey = currentUsageMonthKey()) {
  if (!hasBillingStore(env)) {
    return 0;
  }

  const raw = await env.SUBSCRIBER_KV.get(usageCounterKey(subscriberId, monthKey));
  if (!raw) {
    return 0;
  }

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && asNumber >= 0) {
    return asNumber;
  }

  try {
    const parsed = JSON.parse(raw);
    const count = Number(parsed && parsed.count);
    if (Number.isFinite(count) && count >= 0) {
      return count;
    }
  } catch {
    // Fallback to 0 when historical value is malformed.
  }

  return 0;
}

async function incrementGenerationUsage(env, subscriberId) {
  if (!hasBillingStore(env)) {
    return;
  }

  const monthKey = currentUsageMonthKey();
  const key = usageCounterKey(subscriberId, monthKey);
  const current = await readUsageCount(env, subscriberId, monthKey);
  await env.SUBSCRIBER_KV.put(key, String(current + 1));
}

async function checkGenerationQuota(env, subscriber) {
  const limits = getPlanLimits(subscriber.plan);
  const monthKey = currentUsageMonthKey();
  const used = await readUsageCount(env, subscriber.subscriber_id, monthKey);
  const limit = Number(limits.monthly_generations);

  if (!Number.isFinite(limit) || limit <= 0) {
    return {
      allowed: true,
      used,
      limit: null,
      remaining: null,
      month_key: monthKey,
      reset_at: usageResetIso()
    };
  }

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    month_key: monthKey,
    reset_at: usageResetIso()
  };
}

function userUsageCounterKey(userId, monthKey) {
  return `usage:user:${cleanText(userId, 120)}:${monthKey}`;
}

async function readUserGenerationUsage(env, userId, monthKey = currentUsageMonthKey()) {
  const store = getMemoryStore(env);
  if (!store) {
    return 0;
  }

  const raw = await store.get(userUsageCounterKey(userId, monthKey));
  const value = Number(raw || "0");
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

async function incrementUserGenerationUsage(env, userId) {
  const store = getMemoryStore(env);
  if (!store) {
    return;
  }

  const monthKey = currentUsageMonthKey();
  const current = await readUserGenerationUsage(env, userId, monthKey);
  await store.put(userUsageCounterKey(userId, monthKey), String(current + 1));
}

function resolveUpgradeUrl(env, currentPlan) {
  const plan = resolvePlanKey(currentPlan);
  const starter = cleanText(env.CHECKOUT_URL_STARTER, 600);
  const pro = cleanText(env.CHECKOUT_URL_PRO, 600);
  const scale = cleanText(env.CHECKOUT_URL_SCALE, 600);

  if (plan === "starter") {
    return pro || scale || starter || "";
  }

  if (plan === "pro") {
    return scale || "";
  }

  return scale || "";
}

async function buildAccountView(env, subscriber) {
  const plan = getPlanLimits(subscriber.plan);
  const quota = await checkGenerationQuota(env, subscriber);

  return {
    subscriber_id: subscriber.subscriber_id,
    customer_email: subscriber.customer_email || "",
    customer_name: subscriber.customer_name || "",
    plan: plan.plan,
    plan_label: plan.label,
    status: resolveSubscriptionStatus(subscriber.status),
    usage: {
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
      month_key: quota.month_key,
      reset_at: quota.reset_at
    },
    limits: {
      monthly_generations: plan.monthly_generations,
      max_image_bytes: plan.max_image_bytes,
      max_images_per_generation: plan.max_images_per_generation
    },
    billing_portal_url: cleanText(subscriber.billing_portal_url, 600),
    upgrade_url: resolveUpgradeUrl(env, plan.plan)
  };
}

async function getSubscriberById(env, subscriberId) {
  if (!hasBillingStore(env)) {
    return null;
  }

  const id = cleanText(subscriberId, 140);
  if (!id) {
    return null;
  }

  const raw = await env.SUBSCRIBER_KV.get(`subscriber:id:${id}`);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function getSubscriberByAccessCode(env, accessCode) {
  if (!hasBillingStore(env)) {
    return null;
  }

  const normalizedCode = normalizeAccessCode(accessCode);
  if (!normalizedCode) {
    return null;
  }

  const subscriberId = await env.SUBSCRIBER_KV.get(`subscriber:code:${normalizedCode}`);
  if (!subscriberId) {
    return null;
  }

  return getSubscriberById(env, subscriberId);
}

async function getSubscriberBySubscriptionId(env, subscriptionId) {
  if (!hasBillingStore(env)) {
    return null;
  }

  const normalized = cleanText(subscriptionId, 140);
  if (!normalized) {
    return null;
  }

  const subscriberId = await env.SUBSCRIBER_KV.get(`subscriber:subscription:${normalized}`);
  if (!subscriberId) {
    return null;
  }

  return getSubscriberById(env, subscriberId);
}

async function getSubscriberByEmail(env, email) {
  if (!hasBillingStore(env)) {
    return null;
  }

  const normalized = normalizeEmail(email);
  if (!normalized) {
    return null;
  }

  const subscriberId = await env.SUBSCRIBER_KV.get(`subscriber:email:${normalized}`);
  if (!subscriberId) {
    return null;
  }

  return getSubscriberById(env, subscriberId);
}

async function persistSubscriberRecord(env, subscriber) {
  const normalized = {
    subscriber_id: cleanText(subscriber.subscriber_id, 160),
    access_code: normalizeAccessCode(subscriber.access_code) || generateAccessCode(),
    customer_email: normalizeEmail(subscriber.customer_email),
    customer_name: cleanText(subscriber.customer_name, 220),
    plan: resolvePlanKey(subscriber.plan),
    status: resolveSubscriptionStatus(subscriber.status),
    lemon_subscription_id: cleanText(subscriber.lemon_subscription_id, 160),
    lemon_customer_id: cleanText(subscriber.lemon_customer_id, 160),
    billing_portal_url: cleanText(subscriber.billing_portal_url, 700),
    current_period_end: cleanText(subscriber.current_period_end, 80),
    created_at: cleanText(subscriber.created_at, 80) || new Date().toISOString(),
    updated_at: cleanText(subscriber.updated_at, 80) || new Date().toISOString()
  };

  await env.SUBSCRIBER_KV.put(`subscriber:id:${normalized.subscriber_id}`, JSON.stringify(normalized));
  await env.SUBSCRIBER_KV.put(`subscriber:code:${normalized.access_code}`, normalized.subscriber_id);

  if (normalized.lemon_subscription_id) {
    await env.SUBSCRIBER_KV.put(`subscriber:subscription:${normalized.lemon_subscription_id}`, normalized.subscriber_id);
  }

  if (normalized.customer_email) {
    await env.SUBSCRIBER_KV.put(`subscriber:email:${normalized.customer_email}`, normalized.subscriber_id);
  }

  return normalized;
}

function parseVariantPlanMap(raw) {
  const map = {};
  String(raw || "")
    .split(/[;,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const [variantIdRaw, planRaw] = entry.split(":");
      const variantId = cleanText(variantIdRaw, 120);
      const plan = resolvePlanKey(planRaw);
      if (!variantId) {
        return;
      }
      map[variantId] = plan;
    });
  return map;
}

function resolvePlanFromVariant(env, variantId, variantName) {
  const mapped = parseVariantPlanMap(env.LEMON_VARIANT_PLAN_MAP);
  const id = cleanText(variantId, 120);
  if (id && mapped[id]) {
    return mapped[id];
  }

  const lowerName = String(variantName || "").toLowerCase();
  if (/scale|team|enterprise/.test(lowerName)) {
    return "scale";
  }
  if (/pro/.test(lowerName)) {
    return "pro";
  }
  return "starter";
}

function inferSubscriptionStatusFromEvent(eventName) {
  const text = String(eventName || "").toLowerCase();
  if (/cancel|refund|pause/.test(text)) {
    return "canceled";
  }
  if (/expire/.test(text)) {
    return "expired";
  }
  if (/trial/.test(text)) {
    return "trialing";
  }
  if (/create|resume|renew|update/.test(text)) {
    return "active";
  }
  return "inactive";
}

function normalizeLemonWebhookPayload(payload, env) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const eventName = cleanText(payload.meta && payload.meta.event_name, 140).toLowerCase();
  const data = payload.data && typeof payload.data === "object" ? payload.data : {};
  const attributes = data.attributes && typeof data.attributes === "object" ? data.attributes : {};

  const subscriptionId = cleanText(data.id, 160) || cleanText(attributes.subscription_id, 160);
  const customerEmail = normalizeEmail(
    attributes.user_email || attributes.customer_email || (payload.meta && payload.meta.custom_data && payload.meta.custom_data.email)
  );

  const status = resolveSubscriptionStatus(attributes.status || inferSubscriptionStatusFromEvent(eventName));
  const variantId = cleanText(attributes.variant_id, 120);
  const variantName = cleanText(attributes.variant_name || attributes.product_name, 200);
  const plan = resolvePlanFromVariant(env, variantId, variantName);

  const accessCode = normalizeAccessCode(
    (payload.meta && payload.meta.custom_data && payload.meta.custom_data.access_code) ||
      (attributes.custom_data && attributes.custom_data.access_code) ||
      attributes.license_key ||
      ""
  );

  if (!subscriptionId && !customerEmail && !accessCode) {
    return null;
  }

  return {
    event_name: eventName,
    lemon_subscription_id: subscriptionId,
    lemon_customer_id: cleanText(attributes.customer_id, 160),
    customer_email: customerEmail,
    customer_name: cleanText(attributes.user_name || attributes.customer_name, 220),
    status,
    plan,
    access_code: accessCode,
    billing_portal_url: cleanText(
      (attributes.urls && attributes.urls.customer_portal) || attributes.customer_portal_url || "",
      700
    ),
    current_period_end: cleanText(attributes.renews_at || attributes.ends_at || attributes.trial_ends_at, 80)
  };
}

async function upsertSubscriberFromWebhook(env, normalized) {
  const bySubscription = normalized.lemon_subscription_id
    ? await getSubscriberBySubscriptionId(env, normalized.lemon_subscription_id)
    : null;
  const byEmail = !bySubscription && normalized.customer_email
    ? await getSubscriberByEmail(env, normalized.customer_email)
    : null;

  const existing = bySubscription || byEmail;
  const now = new Date().toISOString();

  const subscriber = {
    subscriber_id: existing && existing.subscriber_id ? existing.subscriber_id : `sub_${crypto.randomUUID()}`,
    access_code: (existing && existing.access_code) || normalized.access_code || generateAccessCode(),
    customer_email: normalized.customer_email || (existing && existing.customer_email) || "",
    customer_name: normalized.customer_name || (existing && existing.customer_name) || "",
    plan: normalized.plan || (existing && existing.plan) || "starter",
    status: normalized.status || (existing && existing.status) || "inactive",
    lemon_subscription_id: normalized.lemon_subscription_id || (existing && existing.lemon_subscription_id) || "",
    lemon_customer_id: normalized.lemon_customer_id || (existing && existing.lemon_customer_id) || "",
    billing_portal_url: normalized.billing_portal_url || (existing && existing.billing_portal_url) || "",
    current_period_end: normalized.current_period_end || (existing && existing.current_period_end) || "",
    created_at: (existing && existing.created_at) || now,
    updated_at: now
  };

  return persistSubscriberRecord(env, subscriber);
}

function readAuthToken(request) {
  const authHeader = request.headers.get("Authorization") || "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch && bearerMatch[1]) {
    return bearerMatch[1].trim();
  }

  const fallback = request.headers.get("x-o2o-access-token") || "";
  return fallback.trim();
}

function normalizeUserId(value) {
  const id = String(value || "").trim();
  if (!id) {
    return "";
  }

  if (/^[a-z0-9][a-z0-9\-_:.]{5,120}$/i.test(id)) {
    return id.slice(0, 120);
  }

  return "";
}

function resolveRequestIdentity(request, subscriber) {
  const headerUserId = normalizeUserId(request.headers.get("x-o2o-user-id"));
  if (headerUserId) {
    return {
      user_id: headerUserId,
      source: "header"
    };
  }

  if (subscriber && subscriber.subscriber_id) {
    return {
      user_id: `user-sub-${cleanText(subscriber.subscriber_id, 80)}`,
      source: "subscriber"
    };
  }

  const ip = cleanText(request.headers.get("CF-Connecting-IP"), 80).replace(/[^0-9a-z.:_-]/gi, "");
  const userAgent = cleanText(request.headers.get("User-Agent"), 80).replace(/[^0-9a-z]/gi, "");
  const fallbackSeed = `${ip || "unknown"}-${userAgent || "agent"}`;
  return {
    user_id: `anon-${fallbackSeed}`.slice(0, 120),
    source: "fallback"
  };
}

async function issueSessionToken(env, payload) {
  const subscriberId = cleanText(payload && payload.subscriber_id, 180);
  if (!subscriberId) {
    throw new Error("Cannot issue session token without subscriber_id.");
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    subscriber_id: subscriberId,
    iat: now,
    exp: now + SESSION_TOKEN_TTL_SECONDS
  };

  const encodedPayload = base64UrlEncodeString(JSON.stringify(tokenPayload));
  const signature = await signValueHmac(String(env.SESSION_SIGNING_SECRET || ""), encodedPayload);
  return `${encodedPayload}.${signature}`;
}

async function verifySessionToken(env, token) {
  const value = String(token || "").trim();
  if (!value || !hasSessionSecret(env)) {
    return null;
  }

  const parts = value.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = await signValueHmac(String(env.SESSION_SIGNING_SECRET || ""), encodedPayload);
  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return null;
  }

  let payload = null;
  try {
    payload = JSON.parse(base64UrlDecodeString(encodedPayload));
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = Number(payload.exp || 0);
  const subscriberId = cleanText(payload.subscriber_id, 180);
  if (!subscriberId || !Number.isFinite(exp) || exp < now) {
    return null;
  }

  return {
    subscriber_id: subscriberId,
    iat: Number(payload.iat || 0),
    exp
  };
}

async function resolveSubscriberFromRequest(request, env) {
  if (!hasBillingStore(env) || !hasSessionSecret(env)) {
    return { subscriber: null, reason: "billing_not_configured" };
  }

  const token = readAuthToken(request);
  if (!token) {
    return { subscriber: null, reason: "token_missing" };
  }

  const session = await verifySessionToken(env, token);
  if (!session) {
    return { subscriber: null, reason: "token_invalid" };
  }

  const subscriber = await getSubscriberById(env, session.subscriber_id);
  if (!subscriber) {
    return { subscriber: null, reason: "subscriber_not_found" };
  }

  return { subscriber, reason: "ok" };
}

async function authorizeGenerationRequest(request, env) {
  const billingEnforced = isBillingEnforced(env);

  if (!billingEnforced) {
    if (!hasBillingStore(env) || !hasSessionSecret(env)) {
      return { subscriber: null, billing_enforced: false };
    }

    const optional = await resolveSubscriberFromRequest(request, env);
    if (optional.subscriber && !isSubscriberActive(optional.subscriber)) {
      return {
        response: corsJson(
          request,
          env,
          {
            ok: false,
            message: "Subscription is not active. Reactivate billing to continue.",
            billing_enforced: false
          },
          403
        )
      };
    }

    return {
      subscriber: optional.subscriber || null,
      billing_enforced: false
    };
  }

  if (!hasBillingStore(env) || !hasSessionSecret(env)) {
    return {
      response: corsJson(
        request,
        env,
        {
          ok: false,
          message: "Billing enforcement is enabled but subscriber auth is not configured.",
          billing_enforced: true
        },
        503
      )
    };
  }

  const resolved = await resolveSubscriberFromRequest(request, env);
  if (!resolved.subscriber) {
    return {
      response: corsJson(
        request,
        env,
        {
          ok: false,
          message: "Access code activation required. Open Subscriber Menu to activate your plan.",
          billing_enforced: true
        },
        401
      )
    };
  }

  if (!isSubscriberActive(resolved.subscriber)) {
    return {
      response: corsJson(
        request,
        env,
        {
          ok: false,
          message: "Subscription is not active. Reactivate billing to continue.",
          billing_enforced: true
        },
        403
      )
    };
  }

  return {
    subscriber: resolved.subscriber,
    billing_enforced: true
  };
}

async function signValueHmac(secretValue, inputText) {
  const secret = String(secretValue || "");
  const input = String(inputText || "");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return bufferToHex(signature);
}

async function verifyWebhookSignature(secret, body, providedSignature) {
  const normalizedProvided = String(providedSignature || "")
    .trim()
    .replace(/^sha256=/i, "")
    .toLowerCase();
  if (!normalizedProvided) {
    return false;
  }

  const expected = await signValueHmac(secret, body);
  return timingSafeEqual(expected, normalizedProvided);
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diff === 0;
}

function base64UrlEncodeString(text) {
  const bytes = new TextEncoder().encode(String(text || ""));
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecodeString(value) {
  let base64 = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}

function systemMetadataKey(systemId) {
  return `memory:system:${cleanText(systemId, 120)}:meta`;
}

function systemVersionKey(systemId, versionNumber) {
  return `memory:system:${cleanText(systemId, 120)}:version:${Number(versionNumber)}`;
}

function userSystemsKey(userId) {
  return `memory:user:${cleanText(userId, 120)}:systems`;
}

function systemNextActionsKey(systemId) {
  return `memory:system:${cleanText(systemId, 120)}:next_actions`;
}

async function getSystemMetadata(env, systemId) {
  const store = getMemoryStore(env);
  if (!store) {
    return null;
  }

  const raw = await store.get(systemMetadataKey(systemId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

async function putSystemMetadata(env, metadata) {
  const store = getMemoryStore(env);
  if (!store) {
    return;
  }

  await store.put(systemMetadataKey(metadata.id), JSON.stringify(metadata));
}

async function getSystemVersion(env, systemId, versionNumber) {
  const store = getMemoryStore(env);
  if (!store) {
    return null;
  }

  const raw = await store.get(systemVersionKey(systemId, versionNumber));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

async function putSystemVersion(env, versionEntry) {
  const store = getMemoryStore(env);
  if (!store) {
    return;
  }

  await store.put(
    systemVersionKey(versionEntry.system_id, versionEntry.version_number),
    JSON.stringify(versionEntry)
  );
}

async function listSystemsForUser(env, userId) {
  const store = getMemoryStore(env);
  if (!store) {
    return [];
  }

  const raw = await store.get(userSystemsKey(userId));
  const ids = raw ? safeJsonParseArray(raw) : [];

  const systems = [];
  for (const id of ids) {
    const metadata = await getSystemMetadata(env, id);
    if (!metadata || metadata.user_id !== userId) {
      continue;
    }
    systems.push(metadata);
  }

  return systems;
}

async function saveUserSystemsIndex(env, userId, systemIds) {
  const store = getMemoryStore(env);
  if (!store) {
    return;
  }

  const unique = Array.from(new Set(systemIds.map((id) => cleanText(id, 120)).filter(Boolean)));
  await store.put(userSystemsKey(userId), JSON.stringify(unique));
}

async function addUserSystemIndex(env, userId, systemId) {
  const current = (await listSystemsForUser(env, userId)).map((item) => item.id);
  if (!current.includes(systemId)) {
    current.push(systemId);
  }
  await saveUserSystemsIndex(env, userId, current);
}

async function getLatestSystemVersion(env, systemId, userId) {
  const metadata = await getSystemMetadata(env, systemId);
  if (!metadata || metadata.user_id !== userId) {
    return null;
  }

  return getSystemVersion(env, systemId, metadata.latest_version_number);
}

function normalizeNextActions(items, context) {
  if (!Array.isArray(items)) {
    return [];
  }

  const now = cleanText(context.now, 80) || new Date().toISOString();
  return items
    .map((item) => {
      if (typeof item === "string") {
        return {
          id: `act_${crypto.randomUUID()}`,
          system_id: context.system_id,
          user_id: context.user_id,
          description: cleanText(item, 500),
          owner: "Unassigned",
          due_date: "",
          status: "pending",
          created_at: now,
          updated_at: now
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const description = cleanText(item.description || item.action || item.task, 500);
      if (!description) {
        return null;
      }

      const status = cleanText(item.status, 30).toLowerCase();
      const normalizedStatus = ["pending", "done", "overdue"].includes(status) ? status : "pending";
      const dueDate = cleanText(item.due_date || item.dueDate, 20);

      return {
        id: cleanText(item.id, 120) || `act_${crypto.randomUUID()}`,
        system_id: context.system_id,
        user_id: context.user_id,
        description,
        owner: cleanText(item.owner, 120) || "Unassigned",
        due_date: dueDate,
        status: normalizedStatus,
        created_at: cleanText(item.created_at, 80) || now,
        updated_at: now
      };
    })
    .filter(Boolean);
}

async function getNextActions(env, systemId, userId) {
  const store = getMemoryStore(env);
  if (!store) {
    return [];
  }

  const raw = await store.get(systemNextActionsKey(systemId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((action) => action && action.user_id === userId);
  } catch {
    return [];
  }
}

async function setNextActions(env, systemId, userId, actions) {
  const store = getMemoryStore(env);
  if (!store) {
    return;
  }

  const normalized = normalizeNextActions(actions, {
    system_id: systemId,
    user_id: userId,
    now: new Date().toISOString()
  });

  await store.put(systemNextActionsKey(systemId), JSON.stringify(normalized));
}

async function createSystemWithFirstVersion(env, input) {
  const now = new Date().toISOString();
  const systemId = cleanText(input.system_json && input.system_json.version && input.system_json.version.system_id, 120)
    || `sys_${crypto.randomUUID()}`;

  input.system_json.version.system_id = systemId;
  input.system_json.version.revision = 1;
  input.system_json.version.generated_at = now;

  const metadata = {
    id: systemId,
    user_id: input.user_id,
    title: cleanText(input.title, 160) || "Untitled Recruitment System",
    created_at: now,
    updated_at: now,
    status: "active",
    last_viewed_at: now,
    latest_version_number: 1,
    summary: summarizeSystem(input.system_json)
  };

  const versionEntry = {
    id: `ver_${crypto.randomUUID()}`,
    system_id: systemId,
    user_id: input.user_id,
    version_number: 1,
    system_json: input.system_json,
    created_at: now
  };

  await putSystemMetadata(env, metadata);
  await putSystemVersion(env, versionEntry);
  await addUserSystemIndex(env, input.user_id, systemId);

  const nextActions = normalizeNextActions(input.system_json.next_actions, {
    system_id: systemId,
    user_id: input.user_id,
    now
  });
  await setNextActions(env, systemId, input.user_id, nextActions);

  return {
    system_id: systemId,
    version_number: 1,
    metadata,
    next_actions: nextActions
  };
}

async function appendSystemVersion(env, input) {
  const now = new Date().toISOString();
  const metadata = await getSystemMetadata(env, input.system_id);
  if (!metadata || metadata.user_id !== input.user_id) {
    throw new Error("System not found.");
  }

  if (Number(metadata.latest_version_number) !== Number(input.expected_current_version)) {
    const error = new Error("Version conflict. Reload latest system before refining.");
    error.statusCode = 409;
    throw error;
  }

  const nextVersion = Number(metadata.latest_version_number) + 1;
  input.system_json.version.system_id = input.system_id;
  input.system_json.version.revision = nextVersion;
  input.system_json.version.generated_at = now;

  const versionEntry = {
    id: `ver_${crypto.randomUUID()}`,
    system_id: input.system_id,
    user_id: input.user_id,
    version_number: nextVersion,
    system_json: input.system_json,
    created_at: now
  };

  await putSystemVersion(env, versionEntry);

  metadata.latest_version_number = nextVersion;
  metadata.updated_at = now;
  metadata.last_viewed_at = now;
  metadata.summary = summarizeSystem(input.system_json);
  await putSystemMetadata(env, metadata);

  const nextActions = normalizeNextActions(input.system_json.next_actions, {
    system_id: input.system_id,
    user_id: input.user_id,
    now
  });
  await setNextActions(env, input.system_id, input.user_id, nextActions);

  return {
    system_id: input.system_id,
    version_number: nextVersion,
    metadata,
    next_actions: nextActions
  };
}

function summarizeSystem(system) {
  if (!system || typeof system !== "object") {
    return "No summary available.";
  }

  const summary = cleanText(system.executive_summary, 420);
  if (summary) {
    return summary;
  }

  const diagnosis = system.system_card && typeof system.system_card === "object"
    ? cleanText(system.system_card.recommended_next_step, 420)
    : "";
  return diagnosis || "Recruitment operating system ready for execution.";
}

function deriveSystemTitle(userInput) {
  const text = cleanText(userInput, 180);
  if (!text) {
    return "Recruitment Operating System";
  }

  const firstLine = text.split(/[\r\n]+/)[0];
  return cleanText(firstLine, 80) || "Recruitment Operating System";
}

function safeFileName(value) {
  const cleaned = String(value || "o2o-system")
    .replace(/[^a-z0-9\-_ ]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return cleaned || "o2o-system";
}

function buildSystemMarkdown(system, metadata, nextActions = []) {
  const safeSystem = system && typeof system === "object" ? system : {};
  const card = safeSystem.system_card && typeof safeSystem.system_card === "object" ? safeSystem.system_card : {};
  const recruitment = safeSystem.recruitment_operating_system && typeof safeSystem.recruitment_operating_system === "object"
    ? safeSystem.recruitment_operating_system
    : createRecruitmentFallback("");
  const blindSpots = recruitment.blind_spot_diagnosis && typeof recruitment.blind_spot_diagnosis === "object"
    ? recruitment.blind_spot_diagnosis
    : createRecruitmentFallback("").blind_spot_diagnosis;

  const lines = [];
  lines.push(`# ${metadata && metadata.title ? metadata.title : "O2O Recruitment Operating System"}`);
  lines.push("");
  lines.push(`Generated: ${safeSystem.version && safeSystem.version.generated_at ? safeSystem.version.generated_at : new Date().toISOString()}`);
  lines.push("");
  lines.push("## System Card");
  lines.push(`- Opportunity Type: ${card.opportunity_type || ""}`);
  lines.push(`- Clarity Level: ${card.clarity_level || ""}`);
  lines.push(`- Output Pathway: ${card.output_pathway || ""}`);
  lines.push(`- Confidence: ${card.confidence_level || ""}`);
  lines.push(`- Recommended Next Step: ${card.recommended_next_step || ""}`);
  lines.push("");
  lines.push("## Executive Summary");
  lines.push(safeSystem.executive_summary || "");
  lines.push("");
  lines.push("## Recruitment Operating System");
  lines.push("### Job Ad Diagnosis");
  lines.push(recruitment.job_ad_diagnosis || "");
  lines.push("");
  lines.push("### Blind Spot Diagnosis");
  lines.push(`- Stated Need: ${blindSpots.stated_need || ""}`);
  lines.push(`- Likely Real Need: ${blindSpots.likely_real_need || ""}`);
  appendBullets(lines, blindSpots.false_assumptions, "False Assumptions");
  appendBullets(lines, blindSpots.hidden_failure_modes, "Hidden Failure Modes");
  appendBullets(lines, blindSpots.wrong_candidate_risks, "Wrong-Candidate Risks");
  appendBullets(lines, blindSpots.missing_success_definition, "Missing Success Definition");
  appendBullets(lines, blindSpots.compensation_or_level_mismatch, "Market Reality Check");
  lines.push("### Passive Candidate Reality");
  lines.push(blindSpots.passive_candidate_reality || "");
  lines.push("### Corrected Search Thesis");
  lines.push(blindSpots.corrected_search_thesis || "");
  lines.push("");
  lines.push("### Hidden Success Profile");
  lines.push(recruitment.hidden_success_profile || "");
  lines.push("");
  lines.push("### Ideal Candidate Persona");
  lines.push(`- Mission: ${recruitment.ideal_candidate_persona && recruitment.ideal_candidate_persona.mission ? recruitment.ideal_candidate_persona.mission : ""}`);
  appendBullets(lines, recruitment.ideal_candidate_persona && recruitment.ideal_candidate_persona.must_have_competencies, "Must-have Competencies");
  appendBullets(lines, recruitment.ideal_candidate_persona && recruitment.ideal_candidate_persona.domain_context, "Domain Context");
  appendBullets(lines, recruitment.ideal_candidate_persona && recruitment.ideal_candidate_persona.first_90_day_outcomes, "First 90-Day Outcomes");
  lines.push("");
  appendBullets(lines, recruitment.wildcard_adjacent_profiles, "Wildcard / Adjacent Profiles");
  lines.push("");
  appendBullets(lines, recruitment.boolean_search_strings, "Boolean Search Strings");
  lines.push("");
  appendBullets(lines, recruitment.red_flags, "Red Flags");
  lines.push("");
  lines.push("### Outreach Message");
  lines.push(recruitment.outreach_message || "");
  lines.push("");
  lines.push("### 21-Day Search Sprint");
  appendBullets(lines, recruitment.search_sprint_21_day_plan && recruitment.search_sprint_21_day_plan.week1, "Week 1");
  appendBullets(lines, recruitment.search_sprint_21_day_plan && recruitment.search_sprint_21_day_plan.week2, "Week 2");
  appendBullets(lines, recruitment.search_sprint_21_day_plan && recruitment.search_sprint_21_day_plan.week3, "Week 3");
  lines.push("");
  lines.push("## Next Actions");
  if (!Array.isArray(nextActions) || !nextActions.length) {
    lines.push("- None yet.");
  } else {
    for (const action of nextActions) {
      lines.push(`- ${action.description} (Owner: ${action.owner || "Unassigned"}, Due: ${action.due_date || "TBD"}, Status: ${action.status || "pending"})`);
    }
  }

  return lines.join("\n");
}

function appendBullets(lines, items, heading) {
  lines.push(`### ${heading}`);
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!list.length) {
    lines.push("- None");
    return;
  }

  for (const item of list) {
    lines.push(`- ${String(item)}`);
  }
}

function safeJsonParseArray(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeImageContext(value, maxBytes = MAX_IMAGE_BYTES) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const mimeType = cleanText(value.mimeType, 60).toLowerCase();
  const fileName = cleanText(value.fileName, 120) || "uploaded-image";
  const dataUrl = String(value.dataUrl || "").trim();

  if (!SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
    return null;
  }

  const prefix = `data:${mimeType};base64,`;
  if (!dataUrl.startsWith(prefix)) {
    return null;
  }

  const base64Data = dataUrl.slice(prefix.length).replace(/\s+/g, "");
  if (!base64Data || /[^A-Za-z0-9+/=]/.test(base64Data)) {
    return null;
  }

  const estimatedBytes = estimateBase64Bytes(base64Data);
  if (!Number.isFinite(estimatedBytes) || estimatedBytes <= 0 || estimatedBytes > maxBytes) {
    return null;
  }

  return {
    file_name: fileName,
    mime_type: mimeType,
    data_url: `${prefix}${base64Data}`,
    estimated_bytes: estimatedBytes
  };
}

function estimateBase64Bytes(base64Value) {
  const padding = base64Value.endsWith("==") ? 2 : base64Value.endsWith("=") ? 1 : 0;
  return Math.floor((base64Value.length * 3) / 4) - padding;
}

async function safeJson(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return {};
    }
    return body;
  } catch {
    return {};
  }
}

async function enforceRateLimit(request, env) {
  const kv = env.RATE_LIMIT_KV;
  const limitPerMinute = Number(env.RATE_LIMIT_PER_MINUTE || 20);

  if (!kv || !Number.isFinite(limitPerMinute) || limitPerMinute <= 0) {
    return { limited: false, retryAfter: 0 };
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const bucket = Math.floor(Date.now() / 60000);
  const key = `rate:${ip}:${bucket}`;

  const currentRaw = await kv.get(key);
  const current = Number(currentRaw || "0");

  if (current >= limitPerMinute) {
    return { limited: true, retryAfter: 60 };
  }

  await kv.put(key, String(current + 1), { expirationTtl: 120 });
  return { limited: false, retryAfter: 0 };
}

function corsJson(request, env, payload, status = 200) {
  return corsResponse(
    request,
    env,
    new Response(JSON.stringify(payload), {
      status,
      headers: {
        "Content-Type": "application/json"
      }
    })
  );
}

function corsResponse(request, env, response) {
  const headers = new Headers(response.headers);
  const origin = resolveOrigin(request, env);

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,x-o2o-user-id,x-o2o-access-token");
  headers.set("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    headers
  });
}

function resolveOrigin(request, env) {
  const allowedRaw = String(env.ALLOWED_ORIGIN || "*")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!allowedRaw.length || (allowedRaw.length === 1 && allowedRaw[0] === "*")) {
    return "*";
  }

  const origin = request.headers.get("Origin") || "";
  if (origin && allowedRaw.includes(origin)) {
    return origin;
  }

  return allowedRaw[0];
}
