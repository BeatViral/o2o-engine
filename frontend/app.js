const elements = {
  ideaInput: document.getElementById("ideaInput"),
  roleTitleInput: document.getElementById("roleTitleInput"),
  industryInput: document.getElementById("industryInput"),
  compensationRangeInput: document.getElementById("compensationRangeInput"),
  companyStageInput: document.getElementById("companyStageInput"),
  hiringChallengeInput: document.getElementById("hiringChallengeInput"),
  contextInput: document.getElementById("contextInput"),
  imageInput: document.getElementById("imageInput"),
  imageMeta: document.getElementById("imageMeta"),
  clearImageBtn: document.getElementById("clearImageBtn"),
  demoRecruitmentBtn: document.getElementById("demoRecruitmentBtn"),
  retryBtn: document.getElementById("retryBtn"),
  subscriberMenu: document.getElementById("subscriberMenu"),
  subscriberPlanBadge: document.getElementById("subscriberPlanBadge"),
  subscriberMessage: document.getElementById("subscriberMessage"),
  accessCodeInput: document.getElementById("accessCodeInput"),
  activateCodeBtn: document.getElementById("activateCodeBtn"),
  subscriberStats: document.getElementById("subscriberStats"),
  subscriberPlanName: document.getElementById("subscriberPlanName"),
  subscriberStatus: document.getElementById("subscriberStatus"),
  usageMeterFill: document.getElementById("usageMeterFill"),
  subscriberUsageText: document.getElementById("subscriberUsageText"),
  subscriberResetText: document.getElementById("subscriberResetText"),
  subscriberImageLimitText: document.getElementById("subscriberImageLimitText"),
  manageBillingLink: document.getElementById("manageBillingLink"),
  upgradePlanLink: document.getElementById("upgradePlanLink"),
  signOutBtn: document.getElementById("signOutBtn"),
  buildBtn: document.getElementById("buildBtn"),
  refineBtn: document.getElementById("refineBtn"),
  refineCommand: document.getElementById("refineCommand"),
  chipRow: document.getElementById("chipRow"),
  status: document.getElementById("status"),
  liveCard: document.getElementById("liveCard"),
  demoVideoSlot: document.getElementById("demoVideoSlot"),
  outputEmptyState: document.getElementById("outputEmptyState"),
  exportRow: document.getElementById("exportRow"),
  copyMarkdownBtn: document.getElementById("copyMarkdownBtn"),
  downloadPdfBtn: document.getElementById("downloadPdfBtn"),
  output: document.getElementById("output"),
  outputSection: document.getElementById("outputSection")
};

const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const DEFAULT_MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ACCESS_TOKEN_STORAGE_KEY = "o2o_access_token";
const USER_ID_STORAGE_KEY = "o2o_user_id";

const state = {
  currentSystem: null,
  currentSystemId: "",
  currentVersionNumber: 0,
  busy: false,
  imageContext: null,
  authToken: "",
  account: null,
  billingEnforced: false,
  userId: "",
  retryAction: null,
  lastBuildOptions: null
};

initialize();

function initialize() {
  state.authToken = readStoredAccessToken();
  state.userId = readOrCreateUserId();

  const previewTargets = [
    elements.ideaInput,
    elements.roleTitleInput,
    elements.industryInput,
    elements.compensationRangeInput,
    elements.companyStageInput,
    elements.hiringChallengeInput,
    elements.contextInput
  ];

  previewTargets.forEach((target) => {
    if (!target) {
      return;
    }
    target.addEventListener("input", renderLiveCardPreview);
    target.addEventListener("change", renderLiveCardPreview);
  });

  if (elements.buildBtn) {
    elements.buildBtn.addEventListener("click", () => handleBuild());
  }

  if (elements.demoRecruitmentBtn) {
    elements.demoRecruitmentBtn.addEventListener("click", runRecruitmentDemo);
  }

  if (elements.retryBtn) {
    elements.retryBtn.addEventListener("click", retryLastAction);
  }

  if (elements.refineBtn) {
    elements.refineBtn.addEventListener("click", () => handleRefine());
  }

  if (elements.imageInput) {
    elements.imageInput.addEventListener("change", handleImageSelection);
  }

  if (elements.clearImageBtn) {
    elements.clearImageBtn.addEventListener("click", () => clearImageSelection(true));
  }

  clearImageSelection(false);

  if (elements.chipRow) {
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
  }

  if (elements.activateCodeBtn) {
    elements.activateCodeBtn.addEventListener("click", activateAccessCode);
  }

  if (elements.accessCodeInput) {
    elements.accessCodeInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      activateAccessCode();
    });
  }

  if (elements.signOutBtn) {
    elements.signOutBtn.addEventListener("click", () => {
      state.authToken = "";
      state.account = null;
      clearStoredAccessToken();
      renderSubscriberMenu();
      setStatus("Signed out. Activate a buyer code to continue.", "neutral");
    });
  }

  if (elements.copyMarkdownBtn) {
    elements.copyMarkdownBtn.addEventListener("click", copyCurrentSystemMarkdown);
  }

  if (elements.downloadPdfBtn) {
    elements.downloadPdfBtn.addEventListener("click", downloadCurrentSystemPdf);
  }

  renderLiveCardPreview();
  renderDemoVideoSlot();
  setOutputEmptyState(true);
  renderSubscriberMenu();
  checkApiHealth();
  refreshAccount();
}

function renderDemoVideoSlot() {
  if (!elements.demoVideoSlot) {
    return;
  }

  const configured =
    window.O2O_CONFIG && typeof window.O2O_CONFIG.demoVideoUrl === "string"
      ? window.O2O_CONFIG.demoVideoUrl.trim()
      : "";

  const embedUrl = normalizeDemoVideoUrl(configured);

  if (embedUrl) {
    elements.demoVideoSlot.innerHTML = `
      <iframe
        src="${escapeHtml(embedUrl)}"
        title="O2O Engine demo video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
      ></iframe>
    `;
    return;
  }

  elements.demoVideoSlot.innerHTML = `
    <div class="video-placeholder">
      <h4>30-second demo slot ready</h4>
      <p>Set demoVideoUrl in env.js with your Loom share link.</p>
      <p>Recommended recording flow: weak role brief -> blind-spot diagnosis -> corrected search thesis -> recruitment OS build.</p>
    </div>
  `;
}

function normalizeDemoVideoUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  if (/^https:\/\/www\.loom\.com\/share\//i.test(value)) {
    return value.replace(/\/share\//i, "/embed/");
  }

  if (/^https:\/\/www\.loom\.com\/embed\//i.test(value)) {
    return value;
  }

  return value;
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

async function handleBuild(options = {}) {
  const idea = String(options.ideaOverride || elements.ideaInput.value || "").trim();
  if (!idea) {
    setStatus("Paste the job brief first", "warning");
    elements.ideaInput.focus();
    return;
  }

  const recruiterInputs = collectRecruiterInputs(options);
  const inferredSearchType = inferOpportunityType(
    [recruiterInputs.roleTitle, recruiterInputs.industry, recruiterInputs.hiringChallenge, idea].filter(Boolean).join(" ")
  );

  state.lastBuildOptions = options;

  const payload = {
    idea,
    title: String(options.title || "").trim(),
    verticalFocus: String(options.verticalFocus || "Recruitment / Headhunting").trim(),
    demoMode: Boolean(options.demoMode),
    opportunityTypeHint: inferredSearchType,
    stage: recruiterInputs.companyStage || "Intake",
    goal: "Build full recruiter operating system",
    constraints: recruiterInputs.compensationRange
      ? `Compensation range: ${recruiterInputs.compensationRange}`
      : "",
    context: recruiterInputs.context,
    allowAssumptions: true
  };

  if (state.imageContext) {
    payload.imageContext = {
      fileName: state.imageContext.fileName,
      mimeType: state.imageContext.mimeType,
      dataUrl: state.imageContext.dataUrl
    };
  }

  try {
    setBusy(true, "Building system");
    const data = await postJson("/api/build", payload);
    if (!data.ok || !data.system) {
      throw new Error(data.message || "Build failed");
    }

    syncAccountFromResponse(data);
    clearRetryAction();
    state.currentSystem = data.system;
    state.currentSystemId = String(data.system_id || data.system?.version?.system_id || "").trim();
    state.currentVersionNumber = Number(data.version_number || data.system?.version?.revision || 0);
    renderSystem(data.system);
    setOutputEmptyState(false);
    setStatus(
      `Built ${formatBuildTrack(data.system.system_card.output_pathway)} (confidence ${data.system.system_card.confidence_level})`,
      "success"
    );
  } catch (error) {
    maybeOpenSubscriberMenu(error);
    setRetryAction({ type: "build" }, "Retry build");
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

  if (!state.currentSystemId || !state.currentVersionNumber) {
    setStatus("Missing system metadata. Build again before refining.", "error");
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
      systemId: state.currentSystemId,
      versionNumber: state.currentVersionNumber,
      command,
      userDeltaContext: String(elements.contextInput.value || "").trim()
    });

    if (!data.ok || !data.system) {
      throw new Error(data.message || "Refine failed");
    }

    syncAccountFromResponse(data);
    clearRetryAction();
    state.currentSystem = data.system;
    state.currentSystemId = String(data.system_id || data.system?.version?.system_id || state.currentSystemId).trim();
    state.currentVersionNumber = Number(data.version_number || data.system?.version?.revision || state.currentVersionNumber);
    renderSystem(data.system);
    setOutputEmptyState(false);
    setStatus(`Updated to revision ${data.version_number || data.system.version.revision}`, "success");
  } catch (error) {
    maybeOpenSubscriberMenu(error);
    if (Number(error && error.status) === 409) {
      const latest = Number(error && error.data && error.data.latest_version_number);
      if (Number.isFinite(latest) && latest > 0) {
        state.currentVersionNumber = latest;
      }
      setStatus("Version conflict detected. Reload the latest system before retrying.", "error");
    } else {
      setStatus(error.message || "Refine failed", "error");
    }
    setRetryAction({ type: "refine" }, "Retry refine");
  } finally {
    setBusy(false, "Idle");
  }
}

async function postJson(path, payload, options = {}) {
  const apiBase = resolveApiBase();
  if (!apiBase) {
    throw new Error("Missing apiBase in env.js");
  }

  const includeAuth = options.includeAuth !== false;
  const headers = {
    "Content-Type": "application/json"
  };

  if (state.userId) {
    headers["x-o2o-user-id"] = state.userId;
  }

  if (includeAuth && state.authToken) {
    headers.Authorization = `Bearer ${state.authToken}`;
  }

  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401 && includeAuth && state.authToken) {
    state.authToken = "";
    state.account = null;
    clearStoredAccessToken();
    renderSubscriberMenu();
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (data && typeof data.user_id === "string" && data.user_id.trim()) {
    state.userId = data.user_id.trim();
    writeStoredUserId(state.userId);
  }

  return data;
}

async function getJson(path, options = {}) {
  const apiBase = resolveApiBase();
  if (!apiBase) {
    throw new Error("Missing apiBase in env.js");
  }

  const includeAuth = options.includeAuth !== false;
  const headers = {};
  if (state.userId) {
    headers["x-o2o-user-id"] = state.userId;
  }
  if (includeAuth && state.authToken) {
    headers.Authorization = `Bearer ${state.authToken}`;
  }

  const response = await fetch(`${apiBase}${path}`, {
    method: "GET",
    headers
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (data && typeof data.user_id === "string" && data.user_id.trim()) {
    state.userId = data.user_id.trim();
    writeStoredUserId(state.userId);
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
  if (elements.demoRecruitmentBtn) {
    elements.demoRecruitmentBtn.disabled = isBusy;
  }
  elements.refineBtn.disabled = isBusy;
  if (elements.imageInput) {
    elements.imageInput.disabled = isBusy;
  }
  if (elements.clearImageBtn) {
    elements.clearImageBtn.disabled = isBusy;
  }
  if (elements.activateCodeBtn) {
    elements.activateCodeBtn.disabled = isBusy;
  }
  if (elements.accessCodeInput) {
    elements.accessCodeInput.disabled = isBusy;
  }
  if (elements.retryBtn) {
    elements.retryBtn.disabled = isBusy;
  }
  if (elements.copyMarkdownBtn) {
    elements.copyMarkdownBtn.disabled = isBusy;
  }
  if (elements.downloadPdfBtn) {
    elements.downloadPdfBtn.disabled = isBusy;
  }
  if (statusText) {
    setStatus(statusText, isBusy ? "loading" : "neutral");
  }
}

async function handleImageSelection() {
  if (!elements.imageInput) {
    return;
  }

  const file = elements.imageInput.files && elements.imageInput.files[0];
  if (!file) {
    clearImageSelection(false);
    return;
  }

  const mimeType = String(file.type || "").toLowerCase();
  if (!SUPPORTED_IMAGE_TYPES.has(mimeType)) {
    clearImageSelection(true);
    setStatus("Use PNG, JPEG, WebP, or GIF for image context", "warning");
    return;
  }

  const limitBytes = getActiveImageLimitBytes();
  if (file.size > limitBytes) {
    clearImageSelection(true);
    setStatus(`Image exceeds your plan limit (${formatBytes(limitBytes)})`, "warning");
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    state.imageContext = {
      fileName: String(file.name || "uploaded-image").slice(0, 120),
      mimeType,
      dataUrl,
      bytes: file.size
    };

    if (elements.clearImageBtn) {
      elements.clearImageBtn.hidden = false;
    }

    updateImageMeta();

    setStatus("Image attached as additional context", "success");
  } catch {
    clearImageSelection(true);
    setStatus("Could not read image file", "error");
  }
}

function clearImageSelection(resetInput) {
  state.imageContext = null;

  if (elements.clearImageBtn) {
    elements.clearImageBtn.hidden = true;
  }

  if (resetInput && elements.imageInput) {
    elements.imageInput.value = "";
  }

  updateImageMeta();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result.startsWith("data:")) {
        reject(new Error("Invalid image data"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(reader.error || new Error("Image read failed"));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getActiveImageLimitBytes() {
  const configured = state.account && state.account.limits ? Number(state.account.limits.max_image_bytes) : NaN;
  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }
  return DEFAULT_MAX_IMAGE_BYTES;
}

function updateImageMeta() {
  if (!elements.imageMeta) {
    return;
  }

  const limitLabel = formatBytes(getActiveImageLimitBytes());
  if (!state.imageContext) {
    elements.imageMeta.textContent = `No image attached. Plan limit: ${limitLabel}.`;
    return;
  }

  const sizeLabel = formatBytes(state.imageContext.bytes || 0);
  elements.imageMeta.textContent = `Attached: ${state.imageContext.fileName} (${sizeLabel}) • Plan limit: ${limitLabel}.`;
}

function syncAccountFromResponse(data) {
  if (!data || typeof data !== "object") {
    return;
  }

  if (typeof data.user_id === "string" && data.user_id.trim()) {
    state.userId = data.user_id.trim();
    writeStoredUserId(state.userId);
  }

  if (typeof data.billing_enforced === "boolean") {
    state.billingEnforced = data.billing_enforced;
  }

  if (data.account && typeof data.account === "object") {
    state.account = data.account;
  }

  renderSubscriberMenu();
  enforceImagePlanLimit();
}

function enforceImagePlanLimit() {
  if (!state.imageContext) {
    return;
  }

  const limitBytes = getActiveImageLimitBytes();
  if (state.imageContext.bytes > limitBytes) {
    clearImageSelection(true);
    setStatus(`Current image was removed because it exceeds your plan limit (${formatBytes(limitBytes)}).`, "warning");
  }
}

function maybeOpenSubscriberMenu(error) {
  const message = String(error && error.message ? error.message : error || "");
  if (!/(access|activate|subscriber|subscription|quota|plan|billing|generation)/i.test(message)) {
    return;
  }
  openSubscriberMenu();
}

function openSubscriberMenu() {
  if (elements.subscriberMenu) {
    elements.subscriberMenu.open = true;
  }
}

function readStoredAccessToken() {
  try {
    return String(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function writeStoredAccessToken(token) {
  try {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage failures and continue with in-memory auth.
  }
}

function clearStoredAccessToken() {
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function readOrCreateUserId() {
  try {
    const existing = String(window.localStorage.getItem(USER_ID_STORAGE_KEY) || "").trim();
    if (existing) {
      return existing;
    }

    const generated = createAnonymousUserId();
    window.localStorage.setItem(USER_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return createAnonymousUserId();
  }
}

function writeStoredUserId(userId) {
  try {
    window.localStorage.setItem(USER_ID_STORAGE_KEY, String(userId || ""));
  } catch {
    // Ignore storage failures.
  }
}

function createAnonymousUserId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return `anon-${window.crypto.randomUUID()}`;
  }

  const seed = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `anon-${seed}`;
}

async function refreshAccount() {
  const apiBase = resolveApiBase();
  if (!apiBase) {
    return;
  }

  try {
    const data = await getJson("/api/account", { includeAuth: true });
    if (!data || typeof data !== "object" || !data.ok) {
      return;
    }

    state.billingEnforced = Boolean(data.billing_enforced);
    if (data.authenticated && data.account && typeof data.account === "object") {
      state.account = data.account;
    } else {
      state.account = null;
      if (state.authToken) {
        state.authToken = "";
        clearStoredAccessToken();
      }
    }

    renderSubscriberMenu();
    enforceImagePlanLimit();
  } catch {
    renderSubscriberMenu();
  }
}

async function activateAccessCode() {
  const rawCode = String((elements.accessCodeInput && elements.accessCodeInput.value) || "").trim();
  if (!rawCode) {
    setSubscriberMessage("Enter your buyer access code first.");
    openSubscriberMenu();
    return;
  }

  try {
    setBusy(true, "Activating access code");
    const data = await postJson(
      "/api/access/activate",
      {
        accessCode: rawCode
      },
      { includeAuth: false }
    );

    if (!data.ok || !data.token || !data.account) {
      throw new Error(data.message || "Activation failed");
    }

    state.authToken = String(data.token || "");
    writeStoredAccessToken(state.authToken);
    state.account = data.account;
    state.billingEnforced = Boolean(data.billing_enforced);

    if (elements.accessCodeInput) {
      elements.accessCodeInput.value = "";
    }

    renderSubscriberMenu();
    enforceImagePlanLimit();
    setSubscriberMessage("Access activated. Plan limits are now enforced for your account.");
    setStatus(`Access activated: ${state.account.plan_label || state.account.plan || "Subscriber"}`, "success");
  } catch (error) {
    setSubscriberMessage(error.message || "Could not activate access code.");
    setStatus(error.message || "Activation failed", "error");
    openSubscriberMenu();
  } finally {
    setBusy(false, "Idle");
  }
}

function setSubscriberMessage(text) {
  if (!elements.subscriberMessage) {
    return;
  }
  elements.subscriberMessage.textContent = text;
}

function renderSubscriberMenu() {
  const authenticated = Boolean(state.authToken && state.account);
  const account = authenticated ? state.account : null;
  const usage = account && account.usage ? account.usage : null;
  const limits = account && account.limits ? account.limits : null;

  if (elements.subscriberPlanBadge) {
    elements.subscriberPlanBadge.textContent = "Already have access? Sign in";
  }

  if (elements.subscriberStats) {
    elements.subscriberStats.hidden = !authenticated;
  }

  if (elements.signOutBtn) {
    elements.signOutBtn.hidden = !authenticated;
  }

  if (elements.subscriberPlanName) {
    elements.subscriberPlanName.textContent = authenticated ? account.plan_label || account.plan || "Subscriber" : "Not active";
  }

  if (elements.subscriberStatus) {
    if (authenticated) {
      elements.subscriberStatus.textContent = String(account.status || "active").toUpperCase();
    } else {
      elements.subscriberStatus.textContent = state.billingEnforced ? "AUTH REQUIRED" : "OPEN MODE";
    }
  }

  if (elements.subscriberUsageText) {
    if (authenticated && usage) {
      if (Number.isFinite(Number(usage.limit)) && Number(usage.limit) > 0) {
        elements.subscriberUsageText.textContent = `${usage.used}/${usage.limit} generations used (${usage.remaining} remaining)`;
      } else {
        elements.subscriberUsageText.textContent = `${usage.used} generations used (unlimited plan)`;
      }
    } else {
      elements.subscriberUsageText.textContent = "Activate code to view usage.";
    }
  }

  if (elements.usageMeterFill) {
    let width = 0;
    if (authenticated && usage && Number.isFinite(Number(usage.limit)) && Number(usage.limit) > 0) {
      width = Math.max(0, Math.min(100, (Number(usage.used) / Number(usage.limit)) * 100));
    }
    elements.usageMeterFill.style.width = `${width}%`;
  }

  if (elements.subscriberResetText) {
    elements.subscriberResetText.textContent = authenticated && usage && usage.reset_at
      ? `Reset date: ${formatResetDate(usage.reset_at)}`
      : "Reset date: -";
  }

  if (elements.subscriberImageLimitText) {
    if (authenticated && limits) {
      elements.subscriberImageLimitText.textContent = `Image limit: ${formatBytes(limits.max_image_bytes)} each, ${limits.max_images_per_generation} image per generation.`;
    } else {
      elements.subscriberImageLimitText.textContent = `Image limit: ${formatBytes(getActiveImageLimitBytes())} each.`;
    }
  }

  const manageBillingUrl = authenticated ? String(account.billing_portal_url || "") : "";
  if (elements.manageBillingLink) {
    elements.manageBillingLink.hidden = !manageBillingUrl;
    if (manageBillingUrl) {
      elements.manageBillingLink.href = manageBillingUrl;
    }
  }

  const upgradeUrl = resolveUpgradeUrl(account ? account.plan : "starter", account ? account.upgrade_url : "");
  if (elements.upgradePlanLink) {
    elements.upgradePlanLink.hidden = !upgradeUrl;
    if (upgradeUrl) {
      elements.upgradePlanLink.href = upgradeUrl;
    }
  }

  if (!authenticated) {
    if (state.billingEnforced) {
      setSubscriberMessage("Access code required. Billing controls are active on this workspace.");
    } else {
      setSubscriberMessage("Billing enforcement is off. You can still activate a code to track plan usage.");
    }
  }

  updateImageMeta();
}

function resolveUpgradeUrl(plan, explicitUrl) {
  const direct = String(explicitUrl || "").trim();
  if (direct) {
    return direct;
  }

  const config = window.O2O_CONFIG && typeof window.O2O_CONFIG === "object" ? window.O2O_CONFIG : {};
  const checkoutUrls = config.checkoutUrls && typeof config.checkoutUrls === "object" ? config.checkoutUrls : {};

  const currentPlan = String(plan || "starter").toLowerCase();
  if (currentPlan === "starter") {
    return String(checkoutUrls.pro || checkoutUrls.scale || "").trim();
  }
  if (currentPlan === "pro") {
    return String(checkoutUrls.scale || "").trim();
  }
  return String(checkoutUrls.scale || "").trim();
}

function formatResetDate(isoText) {
  const value = String(isoText || "").trim();
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function collectRecruiterInputs(options = {}) {
  const roleTitle = String(options.roleTitleOverride || (elements.roleTitleInput && elements.roleTitleInput.value) || "").trim();
  const industry = String(options.industryOverride || (elements.industryInput && elements.industryInput.value) || "").trim();
  const compensationRange = String(
    options.compensationRangeOverride ||
      (elements.compensationRangeInput && elements.compensationRangeInput.value) ||
      ""
  ).trim();
  const companyStage = String(options.companyStageOverride || (elements.companyStageInput && elements.companyStageInput.value) || "").trim();
  const hiringChallenge = String(
    options.hiringChallengeOverride ||
      (elements.hiringChallengeInput && elements.hiringChallengeInput.value) ||
      ""
  ).trim();
  const optionalContext = String(options.contextOverride || (elements.contextInput && elements.contextInput.value) || "").trim();

  const contextLines = [];
  if (roleTitle) {
    contextLines.push(`Role title: ${roleTitle}`);
  }
  if (industry) {
    contextLines.push(`Industry: ${industry}`);
  }
  if (companyStage) {
    contextLines.push(`Company stage: ${companyStage}`);
  }
  if (compensationRange) {
    contextLines.push(`Compensation range: ${compensationRange}`);
  }
  if (hiringChallenge) {
    contextLines.push(`Hiring challenge: ${hiringChallenge}`);
  }
  if (optionalContext) {
    contextLines.push(`Optional client context: ${optionalContext}`);
  }

  return {
    roleTitle,
    industry,
    compensationRange,
    companyStage,
    hiringChallenge,
    context: contextLines.join("\n")
  };
}

function runRecruitmentDemo() {
  const demoJobAd = [
    "We are hiring a Senior Account Executive for a B2B SaaS company.",
    "Need 5+ years, strong closer, base $120k.",
    "Need someone fast."
  ].join("\n");

  if (elements.ideaInput) {
    elements.ideaInput.value = `${demoJobAd}\n\nQuestion: Identify hidden hiring failure modes, correct the search thesis, then build a concrete 21-day recruitment operating system.`;
  }
  if (elements.roleTitleInput) {
    elements.roleTitleInput.value = "Senior Account Executive";
  }
  if (elements.industryInput) {
    elements.industryInput.value = "B2B SaaS";
  }
  if (elements.compensationRangeInput) {
    elements.compensationRangeInput.value = "Base $120k + variable";
  }
  if (elements.companyStageInput) {
    elements.companyStageInput.value = "Series A-B";
  }
  if (elements.hiringChallengeInput) {
    elements.hiringChallengeInput.value = "Role attracts closers but misses enterprise-cycle discipline";
  }
  if (elements.contextInput) {
    elements.contextInput.value = "Recruitment focus: surface blind spots first, then build copy-paste-ready execution artifacts for a serious recruiter.";
  }

  renderLiveCardPreview();
  handleBuild({
    demoMode: true,
    verticalFocus: "Recruitment / Headhunting",
    title: "Senior AE Blind Spot Diagnosis Demo"
  });
}

function setRetryAction(action, label) {
  state.retryAction = action;
  if (!elements.retryBtn) {
    return;
  }

  elements.retryBtn.hidden = false;
  elements.retryBtn.textContent = label || "Retry last action";
}

function clearRetryAction() {
  state.retryAction = null;
  if (!elements.retryBtn) {
    return;
  }

  elements.retryBtn.hidden = true;
  elements.retryBtn.textContent = "Retry last action";
}

async function retryLastAction() {
  if (!state.retryAction) {
    return;
  }

  if (state.retryAction.type === "build") {
    await handleBuild(state.lastBuildOptions || {});
    return;
  }

  if (state.retryAction.type === "refine") {
    await handleRefine();
    return;
  }

  if (state.retryAction.type === "pdf") {
    await downloadCurrentSystemPdf();
  }
}

function setOutputEmptyState(isEmpty) {
  if (elements.outputEmptyState) {
    elements.outputEmptyState.hidden = !isEmpty;
  }

  if (elements.output) {
    elements.output.hidden = isEmpty;
  }

  if (elements.exportRow) {
    elements.exportRow.hidden = isEmpty;
  }
}

async function copyCurrentSystemMarkdown() {
  if (!state.currentSystem) {
    setStatus("No system available to export yet", "warning");
    return;
  }

  if (!state.currentSystemId) {
    setStatus("Missing system id for export. Build again first.", "error");
    return;
  }

  try {
    const response = await fetchSystemExport("markdown");
    const markdown = await response.text();
    await navigator.clipboard.writeText(markdown);
    clearRetryAction();
    setStatus("System copied as Markdown", "success");
  } catch (error) {
    setStatus(error.message || "Could not copy Markdown to clipboard", "error");
  }
}

async function downloadCurrentSystemPdf() {
  if (!state.currentSystem) {
    setStatus("No system available to export yet", "warning");
    return;
  }

  if (!state.currentSystemId) {
    setRetryAction({ type: "pdf" }, "Retry PDF export");
    setStatus("Missing system id for export. Build again first.", "error");
    return;
  }

  try {
    setBusy(true, "Generating PDF export");
    const response = await fetchSystemExport("pdf");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const contentDisposition = String(response.headers.get("content-disposition") || "");
    const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
    anchor.download = match && match[1] ? match[1] : `${slugifyTitle(buildSystemTitle(state.currentSystem))}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);

    clearRetryAction();
    setStatus("PDF exported successfully", "success");
  } catch (error) {
    setRetryAction({ type: "pdf" }, "Retry PDF export");
    setStatus(error.message || "PDF export failed", "error");
  } finally {
    setBusy(false, "Idle");
  }
}

async function fetchSystemExport(format) {
  const apiBase = resolveApiBase();
  if (!apiBase) {
    throw new Error("Missing apiBase in env.js");
  }

  const exportFormat = String(format || "markdown").toLowerCase();
  const headers = {};
  if (state.userId) {
    headers["x-o2o-user-id"] = state.userId;
  }
  if (state.authToken) {
    headers.Authorization = `Bearer ${state.authToken}`;
  }

  const response = await fetch(
    `${apiBase}/api/systems/${encodeURIComponent(state.currentSystemId)}/export?format=${encodeURIComponent(exportFormat)}`,
    {
      method: "GET",
      headers
    }
  );

  if (response.status === 401 && state.authToken) {
    state.authToken = "";
    state.account = null;
    clearStoredAccessToken();
    renderSubscriberMenu();
  }

  if (!response.ok) {
    let message = `Export failed (${response.status})`;
    try {
      const body = await response.clone().json();
      if (body && typeof body.message === "string" && body.message.trim()) {
        message = body.message.trim();
      }
    } catch {
      const detail = await response.text();
      if (detail && detail.trim()) {
        message = detail.trim();
      }
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response;
}

function buildSystemTitle(system) {
  const summary = String((system && system.executive_summary) || "").trim();
  if (summary) {
    return summary.slice(0, 90);
  }

  const nextStep = String((system && system.system_card && system.system_card.recommended_next_step) || "").trim();
  if (nextStep) {
    return nextStep.slice(0, 90);
  }

  return "O2O Recruitment Operating System";
}

function slugifyTitle(value) {
  const cleaned = String(value || "o2o-system")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return cleaned || "o2o-system";
}

function setStatus(text, tone) {
  elements.status.textContent = text;
  elements.status.dataset.tone = tone;
}

function formatBuildTrack(pathway) {
  const value = String(pathway || "").trim();

  if (value === "Discovery System") {
    return "Blind-Spot Diagnosis First";
  }

  if (value === "Workflow System") {
    return "Recruiter Workflow Build";
  }

  if (value === "Full Operating System") {
    return "Full Recruiter Operating System";
  }

  return value || "Recruiter Workflow Build";
}

function renderLiveCardPreview() {
  const idea = String((elements.ideaInput && elements.ideaInput.value) || "").trim();
  const roleTitle = String((elements.roleTitleInput && elements.roleTitleInput.value) || "").trim();
  const industry = String((elements.industryInput && elements.industryInput.value) || "").trim();
  const companyStage = String((elements.companyStageInput && elements.companyStageInput.value) || "").trim();
  const hiringChallenge = String((elements.hiringChallengeInput && elements.hiringChallengeInput.value) || "").trim();

  const previewSignal = [roleTitle, industry, hiringChallenge, idea].filter(Boolean).join(" ");
  const searchType = inferOpportunityType(previewSignal);
  const clarity = inferClarity([idea, hiringChallenge].filter(Boolean).join(" "));
  const pathway = inferPathway([idea, hiringChallenge].filter(Boolean).join(" "), companyStage, "Build full recruiter operating system");
  const confidence = inferConfidence([idea, hiringChallenge].filter(Boolean).join(" "), clarity);

  if (!idea && !roleTitle && !industry && !hiringChallenge) {
    elements.liveCard.innerHTML = `
      <div class="preview-grid">
        <div class="preview-sample">
          <h4>Sample While Idle</h4>
          <p>Input: Senior AE brief is vague and keeps producing weak shortlists.</p>
          <ul class="preview-sample-list">
            <li>Diagnosis: brief has hidden failure assumptions.</li>
            <li>Build Track: Full Recruiter Operating System.</li>
            <li>Output: corrected thesis, rubric, interview, outreach, and 21-day sprint.</li>
          </ul>
        </div>
        <div class="preview-row">
          <h4>Search Type</h4>
          <p>Recruitment / Headhunting</p>
        </div>
        <div class="preview-row">
          <h4>Company Stage</h4>
          <p>Series A-B</p>
        </div>
        <div class="preview-row">
          <h4>Build Track</h4>
          <p>Full Recruiter Operating System</p>
        </div>
        <div class="preview-row">
          <h4>Confidence</h4>
          <p>LOW</p>
        </div>
      </div>
    `;
    return;
  }

  const roleSnapshot = [roleTitle || "Role pending", industry || "Industry pending"].join(" • ");
  const nextStep =
    pathway === "Discovery System"
      ? "Run blind-spot diagnosis and lock the corrected search thesis before sourcing."
      : "Generate screening rubric, interview calibration, and 21-day execution cadence.";

  elements.liveCard.innerHTML = `
    <div class="preview-grid">
      <div class="preview-row">
        <h4>Search Type</h4>
        <p>${escapeHtml(searchType)}</p>
      </div>
      <div class="preview-row">
        <h4>Role Snapshot</h4>
        <p>${escapeHtml(roleSnapshot)}</p>
      </div>
      <div class="preview-row">
        <h4>Company Stage</h4>
        <p>${escapeHtml(companyStage || "Not set")}</p>
      </div>
      <div class="preview-row">
        <h4>Brief Clarity</h4>
        <p>${escapeHtml(clarity)}</p>
      </div>
      <div class="preview-row">
        <h4>Build Track</h4>
        <p>${escapeHtml(formatBuildTrack(pathway))}</p>
      </div>
      <div class="preview-row">
        <h4>Confidence</h4>
        <p>${escapeHtml(confidence)}</p>
      </div>
      <div class="preview-row">
        <h4>Recommended Next Step</h4>
        <p>${escapeHtml(nextStep)}</p>
      </div>
    </div>
  `;
}

function renderSystem(system) {
  const card = system.system_card || {};
  const recruitment = system.recruitment_operating_system || {};
  const blindSpots = recruitment.blind_spot_diagnosis || {};
  const diagnosis = system.diagnosis || {};
  const clarification = system.clarification || {};
  const knownAssumedUnknown = system.known_assumed_unknown || {};
  const nextActions = toArray(system.next_actions);
  const groundingNotes = toArray(system.grounding_notes);

  const version = system.version || { revision: 1, generated_at: "" };

  elements.outputSection.hidden = false;
  setOutputEmptyState(false);
  elements.output.innerHTML = `
    <div class="result-grid">
      <article class="result-card">
        <h3>Recruiter Search Card</h3>
        <div class="kv-grid">
          <div class="kv"><strong>Search Type</strong><span>${escapeHtml(card.opportunity_type)}</span></div>
          <div class="kv"><strong>Brief Clarity</strong><span>${escapeHtml(card.clarity_level)}</span></div>
          <div class="kv"><strong>Build Track</strong><span>${escapeHtml(formatBuildTrack(card.output_pathway))}</span></div>
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
        <h3>Recruitment Operating System</h3>
        <h4>Job Ad Diagnosis</h4>
        <p>${escapeHtml(recruitment.job_ad_diagnosis || "")}</p>
        <h4>Blind Spot Diagnosis</h4>
        <div class="kv-grid">
          <div class="kv"><strong>Stated Need</strong><span>${escapeHtml(blindSpots.stated_need || "")}</span></div>
          <div class="kv"><strong>Likely Real Need</strong><span>${escapeHtml(blindSpots.likely_real_need || "")}</span></div>
        </div>
        <h4>False Assumptions</h4>
        ${renderList(blindSpots.false_assumptions)}
        <h4>Hidden Failure Modes</h4>
        ${renderList(blindSpots.hidden_failure_modes)}
        <h4>Wrong-Candidate Risks</h4>
        ${renderList(blindSpots.wrong_candidate_risks)}
        <h4>Missing Success Definition</h4>
        ${renderList(blindSpots.missing_success_definition)}
        <h4>Market Reality Check</h4>
        ${renderList(blindSpots.compensation_or_level_mismatch)}
        <h4>Passive Candidate Reality</h4>
        <p>${escapeHtml(blindSpots.passive_candidate_reality || "")}</p>
        <h4>Corrected Search Thesis</h4>
        <p>${escapeHtml(blindSpots.corrected_search_thesis || "")}</p>
        <h4>Hidden Success Profile</h4>
        <p>${escapeHtml(recruitment.hidden_success_profile || "")}</p>
        <h4>Boolean Search Strings</h4>
        ${renderList(recruitment.boolean_search_strings)}
        <h4>Screening Rubric</h4>
        ${renderRecruitmentRubric(recruitment.screening_rubric)}
        <h4>Interview Questions</h4>
        ${renderInterviewQuestionGroups(recruitment.interview_questions)}
        <h4>Outreach Message</h4>
        <p>${escapeHtml(recruitment.outreach_message || "")}</p>
        <h4>21-Day Search Sprint</h4>
        <p><strong>Week 1</strong></p>
        ${renderList(recruitment.search_sprint_21_day_plan && recruitment.search_sprint_21_day_plan.week1)}
        <p><strong>Week 2</strong></p>
        ${renderList(recruitment.search_sprint_21_day_plan && recruitment.search_sprint_21_day_plan.week2)}
        <p><strong>Week 3</strong></p>
        ${renderList(recruitment.search_sprint_21_day_plan && recruitment.search_sprint_21_day_plan.week3)}
      </article>

      <article class="result-card">
        <h3>Recruiter Diagnosis Summary</h3>
        <h4>Executive Summary</h4>
        <p>${escapeHtml(system.executive_summary || "")}</p>
        <h4>Search Type Rationale</h4>
        <p>${escapeHtml(diagnosis.opportunity_type_rationale || "")}</p>
        <h4>Brief Clarity Rationale</h4>
        <p>${escapeHtml(diagnosis.clarity_rationale || "")}</p>
        <h4>Build Track Rationale</h4>
        <p>${escapeHtml(diagnosis.pathway_rationale || "")}</p>
        <h4>Confidence Rationale</h4>
        <p>${escapeHtml(diagnosis.confidence_rationale || "")}</p>
      </article>

      <article class="result-card">
        <h3>Brief Clarification</h3>
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
        <h3>Recruiter Next Actions</h3>
        ${renderList(nextActions)}
        <h4>Grounding Notes</h4>
        ${renderList(groundingNotes)}
      </article>
    </div>
  `;

  elements.outputSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderRecruitmentRubric(items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    return "<p>No rubric entries provided.</p>";
  }

  return list
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      return `
      <div class="kv">
        <strong>${escapeHtml(item.category || "Category")}</strong>
        <span>Weight: ${escapeHtml(item.weight || "")}</span>
        <p>${escapeHtml(item.what_to_look_for || "")}</p>
      </div>
    `;
    })
    .join("");
}

function renderInterviewQuestionGroups(groups) {
  if (!groups || typeof groups !== "object") {
    return "<p>No interview questions provided.</p>";
  }

  const sections = [
    { key: "technical", label: "Technical" },
    { key: "behavioral", label: "Behavioral" },
    { key: "execution", label: "Execution" },
    { key: "stakeholder", label: "Stakeholder" }
  ];

  return sections
    .map((section) => {
      return `
      <h4>${escapeHtml(section.label)}</h4>
      ${renderList(groups[section.key])}
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

  if (/(c-level|chief|vp|vice president|director|executive)/.test(text)) {
    return "Executive Search";
  }
  if (/(volume|high-volume|retail|call center|mass hiring|bulk)/.test(text)) {
    return "High-Volume Hiring";
  }
  if (/(engineer|developer|data|ml|ai|security|platform)/.test(text)) {
    return "Hard-to-Fill Technical";
  }
  if (/(replace|replacement|backfill|attrition)/.test(text)) {
    return "Replacement Hire";
  }
  if (/(agency|client|retained|contingency)/.test(text)) {
    return "Agency Client Intake";
  }

  return "New Search Launch";
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
  const normalizedGoal = String(goal || "").toLowerCase();
  const normalizedStage = String(stage || "").toLowerCase();
  const clarity = inferClarity(text);

  if (
    normalizedGoal.includes("blind spots") ||
    normalizedGoal.includes("search thesis") ||
    normalizedGoal.includes("diagnose brief risks") ||
    normalizedGoal.includes("correct the search thesis")
  ) {
    return "Discovery System";
  }

  if (normalizedGoal.includes("screening") || normalizedGoal.includes("interview")) {
    return "Workflow System";
  }

  if (normalizedGoal.includes("operating system")) {
    return "Full Operating System";
  }

  if (normalizedGoal.includes("21-day search sprint")) {
    return "Full Operating System";
  }

  if (normalizedGoal.includes("full operating system")) {
    return "Full Operating System";
  }

  if (normalizedGoal.includes("workflow system")) {
    return "Workflow System";
  }

  if (
    clarity === "Vague" ||
    clarity === "Needs Discovery" ||
    stage === "Discovery" ||
    normalizedStage.includes("pre-search") ||
    normalizedStage.includes("intake") ||
    normalizedStage.includes("calibration")
  ) {
    return "Discovery System";
  }

  if (
    stage === "Pilot" ||
    stage === "Scale" ||
    normalizedStage.includes("screening") ||
    normalizedStage.includes("shortlist") ||
    normalizedStage.includes("offer")
  ) {
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
