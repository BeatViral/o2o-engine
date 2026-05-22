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
  "You are O2O Engine (Opportunity-to-Operating-System Engine).",
  "You transform any user-described idea, problem, or opportunity into a structured operating system.",
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
  "11) Do not issue blind prescriptions. Frame output as structured decision support with options, assumptions, and controls.",
  "12) Explicitly acknowledge limits, constraints, and uncertainty where present.",
  "13) Always include a smallest safe test before recommending scale actions.",
  "",
  "Content quality requirements:",
  "- Include concrete pilot actions and quality gates.",
  "- Define where humans approve, review, and override.",
  "- Add practical SOP drafts with triggers and steps.",
  "- Include metrics that can be measured weekly.",
  "- Keep recommendations testable within 2-4 weeks where possible.",
  "- If image context is attached, extract concrete observations from it and tie recommendations to those observations.",
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
    return corsJson(request, env, { ok: false, message }, 500);
  }
}

async function handleAccount(request, env) {
  const billingEnforced = isBillingEnforced(env);

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
      account: null
    });
  }

  const account = await buildAccountView(env, resolved.subscriber);
  return corsJson(request, env, {
    ok: true,
    billing_enforced: billingEnforced,
    authenticated: true,
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

  return corsJson(request, env, {
    ok: true,
    billing_enforced: isBillingEnforced(env),
    authenticated: true,
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

async function handleBuild(request, env) {
  if (!env.OPENAI_API_KEY) {
    return corsJson(request, env, { ok: false, message: "Missing OPENAI_API_KEY secret." }, 500);
  }

  const access = await authorizeGenerationRequest(request, env);
  if (access.response) {
    return access.response;
  }

  const subscriber = access.subscriber;
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

  const generated = await callOpenAIForSystem(env, "build", inputPayload, { imageContext });
  const normalized = normalizeOutput(generated, {
    mode: "build",
    priorSystem: null,
    sourceInput: userInput
  });

  let account = null;
  if (subscriber) {
    await incrementGenerationUsage(env, subscriber.subscriber_id);
    account = await buildAccountView(env, subscriber);
  }

  return corsJson(request, env, {
    ok: true,
    system: normalized,
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

  const subscriber = access.subscriber;

  const body = await safeJson(request);
  const command = cleanText(body.command, 600);
  const currentSystem = body.currentSystem;

  if (!command) {
    return corsJson(request, env, { ok: false, message: "Field command is required." }, 400);
  }

  if (!currentSystem || typeof currentSystem !== "object") {
    return corsJson(request, env, { ok: false, message: "Field currentSystem is required." }, 400);
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
    refinement_command: command,
    user_delta_context: cleanText(body.userDeltaContext, 2500),
    current_system: currentSystem,
    generated_at: new Date().toISOString()
  };

  const generated = await callOpenAIForSystem(env, "refine", refinePayload);
  const normalized = normalizeOutput(generated, {
    mode: "refine",
    priorSystem: currentSystem,
    sourceInput: command
  });

  let account = null;
  if (subscriber) {
    await incrementGenerationUsage(env, subscriber.subscriber_id);
    account = await buildAccountView(env, subscriber);
  }

  return corsJson(request, env, {
    ok: true,
    system: normalized,
    billing_enforced: access.billing_enforced,
    account
  });
}

async function callOpenAIForSystem(env, mode, payload, options = {}) {
  const model = env.OPENAI_MODEL || "gpt-4.1-mini";

  const userTextPayload = {
    mode,
    payload,
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

function isBillingEnforced(env) {
  return String(env.BILLING_ENFORCED || "false").trim().toLowerCase() === "true";
}

function hasBillingStore(env) {
  return Boolean(env.SUBSCRIBER_KV);
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
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
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
