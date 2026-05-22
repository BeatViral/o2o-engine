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
  "",
  "Content quality requirements:",
  "- Include concrete pilot actions and quality gates.",
  "- Define where humans approve, review, and override.",
  "- Add practical SOP drafts with triggers and steps.",
  "- Include metrics that can be measured weekly.",
  "- Keep recommendations testable within 2-4 weeks where possible."
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

async function handleBuild(request, env) {
  if (!env.OPENAI_API_KEY) {
    return corsJson(request, env, { ok: false, message: "Missing OPENAI_API_KEY secret." }, 500);
  }

  const body = await safeJson(request);
  const userInput = cleanText(body.idea, 12000);

  if (!userInput) {
    return corsJson(request, env, { ok: false, message: "Field idea is required." }, 400);
  }

  const inputPayload = {
    action: "build_system",
    user_input: userInput,
    opportunity_type_hint: cleanText(body.opportunityTypeHint, 100),
    stage: cleanText(body.stage, 100),
    goal: cleanText(body.goal, 120),
    constraints: cleanText(body.constraints, 3000),
    context: cleanText(body.context, 3000),
    allow_assumptions: body.allowAssumptions !== false,
    generated_at: new Date().toISOString()
  };

  const generated = await callOpenAIForSystem(env, "build", inputPayload);
  const normalized = normalizeOutput(generated, {
    mode: "build",
    priorSystem: null,
    sourceInput: userInput
  });

  return corsJson(request, env, {
    ok: true,
    system: normalized,
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

  const body = await safeJson(request);
  const command = cleanText(body.command, 600);
  const currentSystem = body.currentSystem;

  if (!command) {
    return corsJson(request, env, { ok: false, message: "Field command is required." }, 400);
  }

  if (!currentSystem || typeof currentSystem !== "object") {
    return corsJson(request, env, { ok: false, message: "Field currentSystem is required." }, 400);
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

  return corsJson(request, env, { ok: true, system: normalized });
}

async function callOpenAIForSystem(env, mode, payload) {
  const model = env.OPENAI_MODEL || "gpt-4.1-mini";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: JSON.stringify({
        mode,
        payload,
        contract: {
          opportunity_types: OPPORTUNITY_TYPES,
          clarity_levels: CLARITY_LEVELS,
          output_pathways: OUTPUT_PATHWAYS,
          labels: IMPACT_LABELS
        }
      })
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
