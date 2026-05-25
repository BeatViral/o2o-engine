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
  subscriberLinks: document.getElementById("subscriberLinks"),
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

  if (elements.subscriberMenu) {
    elements.subscriberMenu.open = false;
  }

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

  if (elements.output) {
    elements.output.addEventListener("click", handleOutputActions);
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
    setStatus("Live API is not connected. Use View Sample Output to preview the complete plan UI.", "warning");
    return;
  }

  try {
    const response = await fetch(`${apiBase}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed (${response.status})`);
    }

    setStatus("Live planning API connected", "success");
  } catch (error) {
    setStatus(error.message || "Live API is not reachable right now", "error");
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
    setBusy(true, "Building plan");
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
  if (elements.buildBtn) {
    elements.buildBtn.disabled = isBusy;
  }
  if (elements.demoRecruitmentBtn) {
    elements.demoRecruitmentBtn.disabled = isBusy;
  }
  if (elements.refineBtn) {
    elements.refineBtn.disabled = isBusy;
  }
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

  if (elements.subscriberLinks) {
    elements.subscriberLinks.hidden = !authenticated;
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
    elements.manageBillingLink.hidden = !(authenticated && manageBillingUrl);
    if (manageBillingUrl) {
      elements.manageBillingLink.href = manageBillingUrl;
    }
  }

  const upgradeUrl = resolveUpgradeUrl(account ? account.plan : "starter", account ? account.upgrade_url : "");
  if (elements.upgradePlanLink) {
    elements.upgradePlanLink.hidden = !(authenticated && upgradeUrl);
    if (upgradeUrl) {
      elements.upgradePlanLink.href = upgradeUrl;
    }
  }

  if (authenticated) {
    setSubscriberMessage("Access active. You can run recruiter diagnoses.");
  } else {
    setSubscriberMessage("Enter your access code to unlock your recruiter workspace.");
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
    "We need a Senior Account Executive for B2B SaaS.",
    "Need 5+ years and a strong closer.",
    "Base $120k and we need this hire fast."
  ].join("\n");

  if (elements.ideaInput) {
    elements.ideaInput.value = demoJobAd;
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
    elements.hiringChallengeInput.value = "Many applicants look good at first but fail in long sales cycles.";
  }
  if (elements.contextInput) {
    elements.contextInput.value = "Focus on blind spots first, then build a practical hiring plan.";
  }

  renderLiveCardPreview();
  showSampleDiagnosisOutput();
}

function showSampleDiagnosisOutput() {
  const sampleSystem = buildRecruitmentSampleSystem();

  state.currentSystem = sampleSystem;
  state.currentSystemId = "";
  state.currentVersionNumber = Number(sampleSystem.version && sampleSystem.version.revision) || 1;

  renderSystem(sampleSystem);
  setOutputEmptyState(false);

  if (elements.exportRow) {
    elements.exportRow.hidden = true;
  }

  clearRetryAction();
  setStatus("Showing sample complete plan output", "success");
}

function buildRecruitmentSampleSystem() {
  return {
    executive_summary:
      "The brief asks for a strong closer, but the real risk is hiring someone who closes fast and still fails in a long, political enterprise cycle.",
    system_card: {
      opportunity_type: "Agency Client Intake",
      clarity_level: "Vague",
      output_pathway: "Full Operating System",
      confidence_level: "MEDIUM",
      key_assumptions: [
        "The role leans enterprise, not short-cycle.",
        "Process discipline matters more than closing style."
      ],
      missing_information: [
        "First-90-day outcomes.",
        "Deal cycle length.",
        "Stakeholder complexity.",
        "Average deal size and forecast expectations."
      ],
      recommended_next_step: "Align on success targets, then run Week 1 sourcing with the corrected profile."
    },
    diagnosis: {
      opportunity_type_rationale:
        "The signals point to an enterprise search, not a generic closer hire. Without correction, the search will attract the wrong selling DNA.",
      clarity_rationale:
        "The brief has title and pay, but lacks success targets, cycle definition, and stakeholder complexity - the core of enterprise selling.",
      pathway_rationale:
        "A full plan is required because sourcing, screening, and interviews all need recalibration to avoid the wrong-candidate trap.",
      confidence_rationale:
        "Confidence is medium because key success metrics are missing - the search can be corrected, but only with clearer targets."
    },
    clarification: {
      needs_clarification: true,
      assumption_based_draft_used: true,
      questions: [
        "What outcomes define a strong first 90 days?",
        "What is the expected deal cycle length and stakeholder complexity?"
      ]
    },
    known_assumed_unknown: {
      known: ["Senior AE role", "B2B SaaS context"],
      assumed: ["Longer sales cycle with multiple stakeholders"],
      unknown: ["Quota split, stage conversion targets, and forecast expectations"]
    },
    next_actions: [
      "Run a 20-minute hiring manager calibration call.",
      "Lock final scorecard before outreach starts."
    ],
    grounding_notes: [],
    version: {
      revision: 1,
      generated_at: new Date().toISOString()
    },
    recruitment_operating_system: {
      input_brief_snapshot: "Senior Account Executive. 5+ years. Strong closer. Base $120k. Start ASAP.",
      job_ad_diagnosis:
        "The brief rewards speed and charisma but under-specifies the behaviors that actually drive enterprise success: pipeline discipline, CRM hygiene, forecast accuracy, and multi-stakeholder control.",
      candidate_persona:
        "An enterprise-capable AE who keeps clean pipeline data, manages multi-step deals, and maintains control through long, political buying cycles.",
      hidden_success_profile:
        "Deliver consistent forecast quality, maintain disciplined CRM hygiene, and navigate multiple stakeholders without losing deal momentum.",
      boolean_search_strings: [
        '("account executive" OR "enterprise ae") AND ("pipeline discipline" OR "crm hygiene") AND (saas)',
        '("b2b saas" AND "enterprise sales" AND (forecasting OR "multi-stakeholder"))'
      ],
      screening_rubric: [
        {
          category: "Pipeline discipline",
          weight: "30%",
          what_to_look_for: "Evidence of consistent stage hygiene and accurate forecasting."
        },
        {
          category: "Cycle management",
          weight: "25%",
          what_to_look_for: "Track record in longer, multi-step deal cycles."
        },
        {
          category: "Stakeholder navigation",
          weight: "20%",
          what_to_look_for: "Can manage multiple decision makers without losing deal momentum."
        }
      ],
      interview_questions: {
        technical: [
          "How do you structure your weekly pipeline review?",
          "What signals tell you a deal is healthy vs. at risk?"
        ],
        behavioral: [
          "Tell us about a deal that looked strong but failed. What did you learn?",
          "Describe how you recovered from a weak month."
        ],
        execution: [
          "Walk through your process from first call to close in a long cycle.",
          "How do you keep CRM data accurate under pressure?"
        ],
        stakeholder: [
          "How do you map and influence multiple stakeholders in one deal?",
          "How do you keep decision makers aligned over time?"
        ]
      },
      outreach_message:
        "Your experience in longer B2B cycles and disciplined pipeline management aligns with what this role actually needs.",
      search_sprint_21_day_plan: {
        week1: [
          "Confirm final profile and success targets with hiring manager.",
          "Launch first sourcing wave with corrected search strings."
        ],
        week2: [
          "Screen candidates against scorecard, not gut feel.",
          "Adjust targeting based on early interview signal quality."
        ],
        week3: [
          "Run calibrated interviews with clear pass/fail notes.",
          "Deliver shortlist with risk notes and recommendation."
        ]
      },
      blind_spot_diagnosis: {
        stated_need: "Need a strong closer quickly.",
        likely_real_need:
          "Need someone who can survive a long, multi-stakeholder enterprise cycle without losing pipeline discipline, CRM hygiene, or forecast accuracy.",
        input_brief_snapshot: "Senior Account Executive. 5+ years. Strong closer. Base $120k. Start ASAP.",
        candidate_will_look_good_on_paper:
          "A confident short-cycle closer with big logos, high activity numbers, and strong interview presence.",
        candidate_may_fail:
          "They may convert early-stage opportunities but lose control in long-cycle, multi-stakeholder enterprise deals.",
        evidence_to_screen_for_instead:
          "Look for forecast accuracy, CRM hygiene, and examples of recovering a slipping enterprise deal with multiple stakeholders.",
        compensation_signal: "Base $120k can signal a mid-market closer brief rather than an enterprise-cycle operator search.",
        candidate_market_attracted:
          "It may attract active short-cycle candidates before it attracts passive enterprise AEs with complex-cycle control.",
        recruiter_must_clarify:
          "Clarify target deal size, cycle length, stakeholder complexity, and first-90-day outcomes before outreach.",
        brief_does_not_test:
          "The brief does not test pipeline discipline, CRM hygiene, forecast reliability, or patient control through long buying processes.",
        interview_questions_to_expose: [
          "Show us a deal you forecasted accurately over multiple months. What did you track weekly?",
          "Tell us about a multi-stakeholder deal that drifted. How did you recover control?",
          "Walk us through your CRM hygiene process when carrying a high-value pipeline."
        ],
        false_assumptions: [
          "Fast closer equals long-cycle success.",
          "Years of experience alone predicts quality."
        ],
        hidden_failure_modes: [
          "A fast closer may win early deals, then struggle to sustain a long-cycle pipeline.",
          "Poor CRM discipline creates false confidence in forecasting."
        ],
        wrong_candidate_risks: [
          "Over-index on confidence and under-index on process discipline.",
          "Hire a short-cycle profile for a long-cycle role."
        ],
        missing_success_definition: [
          "No first-90-day operating targets.",
          "No clear conversion and forecast quality expectations."
        ],
        compensation_or_level_mismatch: ["Pay may attract mid-market closers, not enterprise-ready operators."],
        passive_candidate_reality:
          "Top candidates are often passive and will only engage when role scope and success targets are concrete.",
        corrected_search_thesis:
          "This brief asks for a strong closer, but the real risk is hiring someone who can close fast and then struggle in a longer sales cycle. The search should test for pipeline discipline, CRM hygiene, multi-stakeholder deal control, and patience through a complex buying process."
      }
    }
  };
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
  if (elements.outputSection) {
    elements.outputSection.hidden = isEmpty;
  }

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

async function handleOutputActions(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const copyButton = target.closest("[data-copy-boolean], [data-copy-text]");
  if (!(copyButton instanceof HTMLButtonElement)) {
    return;
  }

  const encodedValue = String(
    copyButton.getAttribute("data-copy-text") || copyButton.getAttribute("data-copy-boolean") || ""
  );
  const decodedValue = decodeURIComponent(encodedValue);
  if (!decodedValue.trim()) {
    return;
  }

  const copyLabel = copyButton.hasAttribute("data-copy-boolean") ? "Boolean string" : "Message";

  const originalLabel = copyButton.textContent || "Copy";

  try {
    await navigator.clipboard.writeText(decodedValue);
    copyButton.textContent = "Copied";
    copyButton.disabled = true;
    setTimeout(() => {
      copyButton.textContent = originalLabel;
      copyButton.disabled = false;
    }, 1200);
    setStatus(`${copyLabel} copied to clipboard`, "success");
  } catch (error) {
    setStatus(error.message || `Could not copy ${copyLabel.toLowerCase()}`, "error");
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

  return "O2O Recruitment Plan";
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
  if (!elements.status) {
    return;
  }

  elements.status.hidden = false;
  elements.status.textContent = text;
  elements.status.dataset.tone = tone;
}

function formatBuildTrack(pathway) {
  const value = String(pathway || "").trim();

  if (value === "Discovery System") {
    return "Risk and Clarity Plan";
  }

  if (value === "Workflow System") {
    return "Core Hiring Plan";
  }

  if (value === "Full Operating System") {
    return "Complete Hiring Plan";
  }

  return value || "Complete Hiring Plan";
}

function formatSearchType(value) {
  const normalized = String(value || "").trim();

  if (normalized === "Executive Search") {
    return "Senior leadership role";
  }

  if (normalized === "High-Volume Hiring") {
    return "Many similar hires";
  }

  if (normalized === "Hard-to-Fill Technical") {
    return "Specialist technical role";
  }

  if (normalized === "Replacement Hire") {
    return "Replacement role";
  }

  if (normalized === "Agency Client Intake") {
    return "Client search brief";
  }

  if (normalized === "New Search Launch") {
    return "New role search";
  }

  return normalized || "New role search";
}

function formatClarityLabel(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "clear") {
    return "Clear";
  }

  if (normalized === "semi-clear") {
    return "Partly clear";
  }

  if (normalized === "needs discovery") {
    return "Needs more detail";
  }

  if (normalized === "vague") {
    return "Very vague";
  }

  return String(value || "Needs more detail");
}

function renderLiveCardPreview() {
  if (!elements.liveCard) {
    return;
  }

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
          <h4>Example Preview</h4>
          <p>Input is vague and likely to attract the wrong candidates.</p>
          <ul class="preview-sample-list">
            <li>Risk check: what is missing in the brief.</li>
            <li>Plan mode: full hiring plan.</li>
            <li>Output: profile, search strings, scorecard, interview, and a 21-day plan.</li>
          </ul>
        </div>
        <div class="preview-row">
          <h4>Hiring Type</h4>
          <p>Recruiter search</p>
        </div>
        <div class="preview-row">
          <h4>Company Stage</h4>
          <p>Series A-B</p>
        </div>
        <div class="preview-row">
          <h4>Plan Mode</h4>
          <p>Complete Hiring Plan</p>
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
      ? "Start with a risk and clarity plan before sourcing."
      : "Build scorecard, interview plan, and a 21-day hiring plan.";

  elements.liveCard.innerHTML = `
    <div class="preview-grid">
      <div class="preview-row">
        <h4>Hiring Type</h4>
        <p>${escapeHtml(formatSearchType(searchType))}</p>
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
        <h4>How Clear Is the Brief</h4>
        <p>${escapeHtml(formatClarityLabel(clarity))}</p>
      </div>
      <div class="preview-row">
        <h4>Plan Mode</h4>
        <p>${escapeHtml(formatBuildTrack(pathway))}</p>
      </div>
      <div class="preview-row">
        <h4>Confidence</h4>
        <p>${escapeHtml(confidence)}</p>
      </div>
      <div class="preview-row">
        <h4>Next Step</h4>
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
  const groundingNotes = sanitizeGroundingNotes(system.grounding_notes);

  const version = system.version || { revision: 1, generated_at: "" };
  const generatedAt = formatResetDate(version.generated_at);
  const riskScan = computeRiskScan(card, blindSpots);
  const blindSpotReport = buildBlindSpotReport(recruitment, blindSpots, clarification);
  const askedForStatement = buildAskedForStatement(blindSpotReport);
  const likelyNeedStatement = buildLikelyNeedStatement(blindSpotReport, recruitment);
  const correctedThesisStatement = buildCorrectedSearchThesisStatement(
    blindSpotReport.correctedSearchThesis,
    askedForStatement,
    likelyNeedStatement,
    card
  );
  const roleTypeSignal = buildRoleTypeSignal(card, diagnosis);
  const briefClaritySignal = buildBriefClaritySignal(card, diagnosis);
  const outputPlanSignal = buildOutputPlanSignal(card, diagnosis);
  const confidenceLabel = String(card.confidence_level || "MEDIUM").toUpperCase();
  const confidenceTone = mapConfidenceTone(confidenceLabel);
  const notesForDisplay = groundingNotes.length
    ? groundingNotes
    : ["Use this sample to review UI and flow.", "Build live output when API is connected."];

  elements.outputSection.hidden = false;
  setOutputEmptyState(false);
  elements.output.innerHTML = `
    <div class="diagnostic-output-shell">
      <section class="panel corrected-search-thesis-panel slide-in-thesis">
        <div class="thesis-head">
          <p class="diagnosis-kicker">Blind Spot Diagnosis</p>
          <h3>Recruiter Diagnostic Report</h3>
        </div>
        <p class="blindspot-report-lead">O2O identified 5 structural risks that can derail this search if left uncorrected.</p>
        <div class="diagnosis-contrast-grid">
          <article class="diagnosis-contrast-item">
            <p class="diagnosis-contrast-label">What you asked for:</p>
            <p class="diagnosis-contrast-value">${escapeHtml(toSentenceCase(ensureTerminalPunctuation(askedForStatement)))}</p>
          </article>
          <article class="diagnosis-contrast-item">
            <p class="diagnosis-contrast-label">What you likely need:</p>
            <p class="diagnosis-contrast-value">${escapeHtml(toSentenceCase(ensureTerminalPunctuation(likelyNeedStatement)))}</p>
          </article>
        </div>
        <p class="thesis-statement">${escapeHtml(correctedThesisStatement)}</p>
      </section>

      <section class="panel blindspot-report-panel fade-in-diagnosis">
        <div class="diagnosis-head">
          <p class="diagnosis-kicker">5 Diagnostic Risks</p>
          <h3>Where This Search Can Break</h3>
          ${blindSpotReport.inputBrief
            ? `<p class="blindspot-input-snapshot"><span>Input:</span> ${escapeHtml(blindSpotReport.inputBrief)}</p>`
            : ""}
        </div>
        <div class="blindspot-card-grid">
          ${renderBlindSpotRiskCard(
            1,
            "Role confusion",
            [
              { label: "What the brief says", value: blindSpotReport.roleConfusion.whatBriefSays },
              { label: "What the role may actually require", value: blindSpotReport.roleConfusion.actualRoleNeeds },
              { label: "Why this matters", value: blindSpotReport.roleConfusion.whyThisMatters }
            ],
            "role-confusion"
          )}
          ${renderBlindSpotRiskCard(
            2,
            "Wrong candidate trap",
            [
              {
                label: "Candidate who will look good on paper",
                value: blindSpotReport.wrongCandidateTrap.looksGoodOnPaper
              },
              { label: "Why they may fail", value: blindSpotReport.wrongCandidateTrap.whyMayFail },
              {
                label: "What evidence to screen for instead",
                value: blindSpotReport.wrongCandidateTrap.evidenceToScreen
              }
            ],
            "wrong-candidate"
          )}
          ${renderBlindSpotRiskCard(
            3,
            "Salary / level mismatch",
            [
              { label: "What the compensation may signal", value: blindSpotReport.salaryMismatch.whatCompSignals },
              {
                label: "Which candidate market it may attract",
                value: blindSpotReport.salaryMismatch.whichMarketAttracts
              },
              {
                label: "What the recruiter must clarify",
                value: blindSpotReport.salaryMismatch.whatRecruiterMustClarify
              }
            ],
            "salary-mismatch"
          )}
          ${renderBlindSpotRiskCard(
            4,
            "Missing screening evidence",
            [
              { label: "What the brief does not test", value: blindSpotReport.missingEvidence.whatBriefMisses },
              {
                label: "Which interview questions should expose it",
                value: blindSpotReport.missingEvidence.whichQuestionsExpose
              }
            ],
            "missing-evidence"
          )}
          ${renderBlindSpotRiskCard(
            5,
            "Missing success targets",
            [
              { label: "What is still missing", value: blindSpotReport.missingTargets.whatIsMissing },
              { label: "Why this creates hiring risk", value: blindSpotReport.missingTargets.whyThisCreatesRisk },
              {
                label: "What to define before search",
                value: blindSpotReport.missingTargets.whatToDefineBeforeSearch
              }
            ],
            "missing-targets"
          )}
        </div>
      </section>

      <section class="panel risk-scan-panel support-panel fade-in-diagnosis">
        <div class="risk-scan-head">
          <p class="diagnosis-kicker">Support Scores</p>
          <h3>Check Risk Before You Search</h3>
          <p class="risk-scan-note">These scores support the diagnosis above and show why the brief may misfire without correction.</p>
        </div>
        <div class="risk-metric-grid">
          ${renderRiskMetric("Role Clarity", riskScan.roleClarityScore)}
          ${renderRiskMetric("Success Clarity", riskScan.successDefinitionScore)}
          ${renderRiskMetric("Market Match", riskScan.candidateMarketAlignmentScore)}
        </div>
        <div class="risk-level-row">
          <div>
            <p class="risk-label">Risk of Wrong Hire</p>
            <p class="risk-score">${escapeHtml(String(riskScan.failureModeRiskScore))}/100</p>
          </div>
          <span class="risk-pill risk-${riskScan.failureModeRisk.toLowerCase()} pulse-risk">${escapeHtml(riskScan.failureModeRisk)}</span>
        </div>
      </section>

      <div class="module-divider" role="presentation">
        <span>Your Hiring Plan</span>
      </div>

      <section class="panel glance-panel fade-in-diagnosis">
        <div class="glance-head">
          <p class="diagnosis-kicker">At A Glance</p>
          <h3>What This Brief Actually Signals</h3>
        </div>

        <div class="glance-grid">
          <article class="glance-item">
            <p class="glance-label">Role Type</p>
            <p class="glance-value">${escapeHtml(roleTypeSignal)}</p>
          </article>

          <article class="glance-item">
            <p class="glance-label">Brief Clarity</p>
            <p class="glance-value">${escapeHtml(briefClaritySignal)}</p>
          </article>

          <article class="glance-item">
            <p class="glance-label">Output Plan</p>
            <p class="glance-value">${escapeHtml(outputPlanSignal)}</p>
          </article>

          <article class="glance-item">
            <p class="glance-label">Confidence</p>
            <p class="glance-value confidence-${confidenceTone}">${escapeHtml(confidenceLabel)}</p>
          </article>

          <article class="glance-item">
            <p class="glance-label">Next Step</p>
            <p class="glance-value">${escapeHtml(card.recommended_next_step || "No recommendation available.")}</p>
          </article>

          <article class="glance-item">
            <p class="glance-label">Assumptions</p>
            <p class="glance-value">${renderLineBreakText(card.key_assumptions, "No assumptions provided.")}</p>
          </article>

          <article class="glance-item">
            <p class="glance-label">Missing Info</p>
            <p class="glance-value">${renderLineBreakText(card.missing_information, "No missing information provided.")}</p>
          </article>
        </div>
      </section>

      <section class="panel why-panel fade-in-diagnosis">
        <div class="why-head">
          <p class="diagnosis-kicker">Why O2O Gave This Result</p>
          <h3>The Logic Behind the Diagnosis</h3>
        </div>

        <div class="why-grid">
          <article class="why-item">
            <p class="why-label">Summary</p>
            <p class="why-value">${escapeHtml(system.executive_summary || "No executive summary available.")}</p>
          </article>

          <article class="why-item">
            <p class="why-label">Brief Diagnosis</p>
            <p class="why-value">${escapeHtml(recruitment.job_ad_diagnosis || "No diagnosis narrative provided.")}</p>
          </article>

          <article class="why-item">
            <p class="why-label">Why This Hiring Type</p>
            <p class="why-value">${escapeHtml(diagnosis.opportunity_type_rationale || "No rationale provided.")}</p>
          </article>

          <article class="why-item">
            <p class="why-label">Why This Clarity Score</p>
            <p class="why-value">${escapeHtml(diagnosis.clarity_rationale || "No rationale provided.")}</p>
          </article>

          <article class="why-item">
            <p class="why-label">Why This Plan Mode</p>
            <p class="why-value">${escapeHtml(diagnosis.pathway_rationale || "No rationale provided.")}</p>
          </article>

          <article class="why-item">
            <p class="why-label">Why This Confidence</p>
            <p class="why-value">${escapeHtml(diagnosis.confidence_rationale || "No rationale provided.")}</p>
          </article>
        </div>
      </section>

      <section class="panel who-panel fade-in-diagnosis">
        <div class="who-head">
          <p class="diagnosis-kicker">Who To Hire</p>
          <h3>The Profile That Will Actually Succeed</h3>
        </div>

        <div class="who-grid">
          <article class="who-item">
            <p class="who-label">Best-Fit Profile</p>
            <p class="who-value">${escapeHtml(recruitment.candidate_persona || "No candidate persona provided.")}</p>
          </article>

          <article class="who-item">
            <p class="who-label">What This Person Must Do Well</p>
            <p class="who-value">${escapeHtml(recruitment.hidden_success_profile || "No hidden success profile provided.")}</p>
          </article>
        </div>
      </section>

      <section class="panel scorecard-panel fade-in-diagnosis">
        <div class="scorecard-head">
          <p class="diagnosis-kicker">Candidate Scorecard</p>
          <h3>What Good Actually Looks Like</h3>
        </div>

        <div class="scorecard-grid">
          ${renderScorecardItems(recruitment.screening_rubric)}
        </div>
      </section>

      <section class="panel interview-panel fade-in-diagnosis">
        <div class="interview-head">
          <p class="diagnosis-kicker">Interview Questions</p>
          <h3>Questions That Expose Real Capability</h3>
        </div>

        <div class="interview-grid">
          ${renderInterviewItems(recruitment.interview_questions)}
        </div>
      </section>

      <section class="panel plan-panel fade-in-diagnosis">
        <div class="plan-head">
          <p class="diagnosis-kicker">21-Day Hiring Plan</p>
          <h3>A Fast, Disciplined Search Sprint</h3>
        </div>

        <div class="plan-grid">
          ${renderPlanWeeks(recruitment.search_sprint_21_day_plan)}
        </div>
      </section>

      <section class="panel next-panel fade-in-diagnosis">
        <div class="next-head">
          <p class="diagnosis-kicker">Questions + Next Steps</p>
          <h3>What Needs Clarifying Before You Search</h3>
        </div>

        <div class="next-grid">
          <article class="next-item">
            <p class="next-label">Needs More Info</p>
            <p class="next-value">${escapeHtml(
              clarification.needs_clarification
                ? "true - key success metrics still missing"
                : "false - key success metrics are defined"
            )}</p>
          </article>

          <article class="next-item">
            <p class="next-label">Used Best-Guess Inputs</p>
            <p class="next-value">${escapeHtml(
              clarification.assumption_based_draft_used
                ? "true - assumptions applied where brief lacked clarity"
                : "false - plan built mostly from confirmed brief detail"
            )}</p>
          </article>

          <article class="next-item">
            <p class="next-label">Questions To Ask</p>
            <p class="next-value">${renderLineBreakText(clarification.questions, "No questions provided.")}</p>
          </article>

          <article class="next-item">
            <p class="next-label">Known</p>
            <p class="next-value">${renderCommaList(knownAssumedUnknown.known, "Not provided")}</p>
          </article>

          <article class="next-item">
            <p class="next-label">Assumed</p>
            <p class="next-value">${renderCommaList(knownAssumedUnknown.assumed, "Not provided")}</p>
          </article>

          <article class="next-item">
            <p class="next-label">Unknown</p>
            <p class="next-value">${renderCommaList(knownAssumedUnknown.unknown, "Not provided")}</p>
          </article>

          <article class="next-item">
            <p class="next-label">Next Actions</p>
            <p class="next-value">${renderLineBreakText(nextActions, "No next actions provided.")}</p>
          </article>

          <article class="next-item">
            <p class="next-label">Notes</p>
            <p class="next-value">${renderLineBreakText(notesForDisplay, "No notes provided.")}</p>
          </article>
        </div>
      </section>
    </div>
  `;

  elements.outputSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function computeRiskScan(card, blindSpots) {
  const roleClarityScore = mapClarityScore(card.clarity_level);
  const falseAssumptions = toArray(blindSpots.false_assumptions).length;
  const hiddenFailureModes = toArray(blindSpots.hidden_failure_modes).length;
  const wrongCandidateRisks = toArray(blindSpots.wrong_candidate_risks).length;
  const missingSuccessDefinition = toArray(blindSpots.missing_success_definition).length;
  const compensationMismatch = toArray(blindSpots.compensation_or_level_mismatch).length;

  const successDefinitionScore = clampScore(
    90 - missingSuccessDefinition * 14 - falseAssumptions * 6 + (blindSpots.corrected_search_thesis ? 6 : 0)
  );

  const candidateMarketAlignmentScore = clampScore(
    88 - compensationMismatch * 16 - wrongCandidateRisks * 10 + (roleClarityScore > 65 ? 4 : 0)
  );

  const failureModeRiskScore = clampScore(
    hiddenFailureModes * 18 + wrongCandidateRisks * 12 + compensationMismatch * 10 + falseAssumptions * 8 +
      (roleClarityScore < 50 ? 16 : 0)
  );

  let failureModeRisk = "LOW";
  if (failureModeRiskScore >= 67) {
    failureModeRisk = "HIGH";
  } else if (failureModeRiskScore >= 34) {
    failureModeRisk = "MEDIUM";
  }

  return {
    roleClarityScore,
    successDefinitionScore,
    candidateMarketAlignmentScore,
    failureModeRisk,
    failureModeRiskScore
  };
}

function buildBlindSpotReport(recruitment, blindSpots, clarification) {
  const falseAssumptions = toArray(blindSpots.false_assumptions);
  const hiddenFailureModes = toArray(blindSpots.hidden_failure_modes);
  const wrongCandidateRisks = toArray(blindSpots.wrong_candidate_risks);
  const compensationMismatch = toArray(blindSpots.compensation_or_level_mismatch);
  const missingSuccessDefinition = toArray(blindSpots.missing_success_definition);
  const clarificationQuestions = toArray(clarification && clarification.questions);
  const screeningEvidence = extractScreeningEvidence(recruitment.screening_rubric);
  const interviewEvidence = extractInterviewQuestions(recruitment.interview_questions, 3);

  const inputBrief = firstNonEmptyText([
    blindSpots.input_brief_snapshot,
    recruitment.input_brief_snapshot,
    elements.ideaInput && elements.ideaInput.value
  ]);

  return {
    inputBrief,
    roleConfusion: {
      whatBriefSays: firstNonEmptyText(
        [blindSpots.stated_need],
        "Need a strong closer quickly."
      ),
      actualRoleNeeds: firstNonEmptyText(
        [blindSpots.likely_real_need, recruitment.hidden_success_profile],
        "Needs disciplined long-cycle execution, not only close speed."
      ),
      whyThisMatters: firstNonEmptyText(
        [hiddenFailureModes[0], wrongCandidateRisks[0]],
        "If this stays vague, the shortlist can look strong on paper while missing the execution profile this role actually needs."
      )
    },
    wrongCandidateTrap: {
      looksGoodOnPaper: firstNonEmptyText(
        [
          blindSpots.candidate_will_look_good_on_paper,
          falseAssumptions[0] ? `A candidate aligned to this assumption: ${falseAssumptions[0]}` : ""
        ],
        "A polished short-cycle closer with recognizable logos, high activity metrics, and strong interview confidence."
      ),
      whyMayFail: firstNonEmptyText(
        [blindSpots.candidate_may_fail, hiddenFailureModes[0]],
        "They may close early opportunities but lose control in multi-stakeholder, longer-cycle enterprise deals."
      ),
      evidenceToScreen: firstNonEmptyText(
        [blindSpots.evidence_to_screen_for_instead, screeningEvidence.slice(0, 2).join(" ")],
        "Screen for forecast accuracy, CRM hygiene, and evidence of recovering a slipping enterprise deal."
      )
    },
    salaryMismatch: {
      whatCompSignals: firstNonEmptyText(
        [blindSpots.compensation_signal, compensationMismatch[0]],
        "The compensation framing may signal urgency for a closer rather than precision for a complex-cycle operator."
      ),
      whichMarketAttracts: firstNonEmptyText(
        [blindSpots.candidate_market_attracted, compensationMismatch[1]],
        "It can attract active mid-market hunters before passive enterprise operators."
      ),
      whatRecruiterMustClarify: firstNonEmptyText(
        [blindSpots.recruiter_must_clarify, clarificationQuestions[0], missingSuccessDefinition[0]],
        "Clarify target deal size, cycle length, stakeholder complexity, and first-90-day success targets before outreach."
      )
    },
    missingEvidence: {
      whatBriefMisses: firstNonEmptyText(
        [blindSpots.brief_does_not_test, missingSuccessDefinition.join(" ")],
        "The brief does not test pipeline discipline, CRM hygiene, forecast reliability, or stakeholder control under pressure."
      ),
      whichQuestionsExpose: firstNonEmptyText(
        [toArray(blindSpots.interview_questions_to_expose).join(" "), interviewEvidence.join(" ")],
        "Use a live deal walkthrough question set to expose forecast discipline, multi-thread control, and resilience in long-cycle selling."
      )
    },
    missingTargets: {
      whatIsMissing: firstNonEmptyText(
        [missingSuccessDefinition[0], clarificationQuestions[0]],
        "Clear first-90-day outcomes, cycle expectations, and deal ownership targets."
      ),
      whyThisCreatesRisk: firstNonEmptyText(
        [hiddenFailureModes[1], falseAssumptions[1], wrongCandidateRisks[1]],
        "Without explicit success targets, shortlist decisions drift toward interview confidence instead of execution evidence."
      ),
      whatToDefineBeforeSearch: firstNonEmptyText(
        [clarificationQuestions[0], missingSuccessDefinition[1]],
        "Define first-90-day outcomes, stage conversion expectations, and stakeholder complexity before outreach starts."
      )
    },
    correctedSearchThesis: firstNonEmptyText(
      [blindSpots.corrected_search_thesis],
      "Search for an enterprise-capable AE who demonstrates pipeline discipline, CRM hygiene, multi-stakeholder deal control, and patience through long buying cycles over pure close-speed signal."
    )
  };
}

function firstNonEmptyText(candidates, fallback = "") {
  const values = Array.isArray(candidates) ? candidates : [candidates];
  for (const candidate of values) {
    const value = String(candidate || "").trim();
    if (value) {
      return value;
    }
  }
  return String(fallback || "").trim();
}

function extractScreeningEvidence(rubric) {
  const list = Array.isArray(rubric) ? rubric : [];
  return list
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }
      return String(item.what_to_look_for || "").trim();
    })
    .filter(Boolean);
}

function extractInterviewQuestions(groups, limit = 3) {
  if (!groups || typeof groups !== "object") {
    return [];
  }

  const keys = ["technical", "behavioral", "execution", "stakeholder"];
  const questions = [];

  keys.forEach((key) => {
    toArray(groups[key]).forEach((question) => {
      if (questions.length >= limit) {
        return;
      }
      questions.push(String(question || "").trim());
    });
  });

  return questions.filter(Boolean);
}

function renderBlindSpotRiskCard(index, title, fields, toneClass = "") {
  const classes = toneClass ? `blindspot-risk-card ${toneClass}` : "blindspot-risk-card";
  const normalizedFields = Array.isArray(fields) ? fields : [];

  return `
    <article class="${classes}">
      <div class="risk-card-head">
        <span class="risk-card-index" aria-hidden="true">${escapeHtml(String(index))}</span>
        <h4>${escapeHtml(title)}</h4>
      </div>
      <div class="risk-card-fields">
        ${normalizedFields
          .map((field) => {
            const label = field && typeof field === "object" ? String(field.label || "").trim() : "";
            const value = field && typeof field === "object" ? String(field.value || "").trim() : "";
            if (!label && !value) {
              return "";
            }
            return `
              <section class="risk-field">
                <p class="risk-field-label">${escapeHtml(label || "Signal")}</p>
                <p class="risk-field-value">${escapeHtml(value || "Not provided.")}</p>
              </section>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function renderBlindSpotThesisCard(index, title, thesisText) {
  return `
    <article class="blindspot-risk-card thesis-card">
      <div class="risk-card-head">
        <span class="risk-card-index" aria-hidden="true">${escapeHtml(String(index))}</span>
        <h4>${escapeHtml(title)}</h4>
      </div>
      <p class="thesis-card-copy">${escapeHtml(String(thesisText || "No corrected thesis provided."))}</p>
    </article>
  `;
}

function buildAskedForStatement(blindSpotReport) {
  const phrase = normalizeMainRiskFragment(
    blindSpotReport && blindSpotReport.roleConfusion && blindSpotReport.roleConfusion.whatBriefSays,
    "a strong closer quickly"
  );

  return /^(a|an)\s+/i.test(phrase) ? phrase : `a ${phrase}`;
}

function buildLikelyNeedStatement(blindSpotReport, recruitment) {
  return "a disciplined long-cycle seller with pipeline control, CRM hygiene, forecast quality and stakeholder patience";
}

function buildCorrectedSearchThesisStatement(thesis, askedForStatement, likelyNeedStatement, card) {
  const roleTitle = firstNonEmptyText(
    [elements.roleTitleInput && elements.roleTitleInput.value],
    formatSearchType((card && card.opportunity_type) || "AE")
  );

  const normalizedRole = compactDiagnosticPhrase(roleTitle, "B2B SaaS AE");
  const roleFragment = /(search brief|discovery system|role)/i.test(normalizedRole)
    ? "B2B SaaS AE"
    : normalizedRole;

  const askedForCore = compactDiagnosticPhrase(
    askedForStatement,
    "a strong closer"
  )
    .replace(/\b(quickly|fast|asap|urgently|immediately)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const normalizedAskedFor = /^(a|an)\s+/i.test(askedForCore) ? askedForCore : `a ${askedForCore}`;

  const fallback = `Do not search for "${normalizedAskedFor}." Search for a ${roleFragment} with evidence of pipeline discipline, CRM hygiene, forecast quality and multi-stakeholder deal control.`;

  const normalized = compactDiagnosticPhrase(thesis, "");
  if (/do not search for/i.test(normalized)) {
    return `Corrected search thesis: ${ensureTerminalPunctuation(normalized)}`;
  }

  return `Corrected search thesis: ${ensureTerminalPunctuation(fallback)}`;
}

function compactDiagnosticPhrase(value, fallback = "") {
  const normalized = firstNonEmptyText([value], fallback)
    .replace(/\s+/g, " ")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.?!]+$/g, "")
    .trim();

  return normalized || String(fallback || "").trim();
}

function normalizeMainRiskFragment(value, fallback = "") {
  const phrase = compactDiagnosticPhrase(value, fallback)
    .replace(/^needs?\s+/i, "")
    .trim();

  if (!phrase) {
    return compactDiagnosticPhrase(fallback, fallback).toLowerCase();
  }

  return phrase.charAt(0).toLowerCase() + phrase.slice(1);
}

function toSentenceCase(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function mapClarityScore(level) {
  const normalized = String(level || "").toLowerCase();

  if (normalized === "clear") {
    return 84;
  }

  if (normalized === "semi-clear") {
    return 62;
  }

  if (normalized === "needs discovery") {
    return 38;
  }

  if (normalized === "vague") {
    return 28;
  }

  return 50;
}

function clampScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function renderRiskMetric(label, score) {
  const value = clampScore(score);
  return `
    <article class="risk-metric-card">
      <p class="risk-metric-label">${escapeHtml(label)}</p>
      <p class="risk-metric-score">${escapeHtml(String(value))}<span class="risk-score-total">/100</span></p>
      <div class="risk-meter" role="presentation">
        <span style="width: ${value}%"></span>
      </div>
    </article>
  `;
}

function renderDiagnosticListCard(icon, title, items, toneClass) {
  const list = toArray(items);
  const tone = toneClass ? ` ${toneClass}` : "";

  return `
    <article class="diagnosis-list-card${tone}">
      <h4><span class="diag-icon" aria-hidden="true">${icon}</span>${escapeHtml(title)}</h4>
      ${list.length ? renderModuleList(list, "diagnosis-list") : '<p class="module-empty">No risk found here.</p>'}
    </article>
  `;
}

function renderDiagnosticTextCard(title, text) {
  const value = String(text || "").trim();
  return `
    <article class="diagnosis-text-card">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(value || "No note provided.")}</p>
    </article>
  `;
}

function renderBooleanStringBlocks(items) {
  const list = toArray(items);
  if (!list.length) {
    return '<p class="module-empty">No search strings provided.</p>';
  }

  return list
    .map((item, index) => {
      const value = String(item || "").trim();
      const encodedValue = encodeURIComponent(value);

      return `
        <article class="boolean-code-card">
          <div class="boolean-code-head">
            <p class="boolean-label">Search String ${index + 1}</p>
            <button class="code-copy-btn" type="button" data-copy-boolean="${encodedValue}">Copy</button>
          </div>
          <pre class="boolean-code"><code>${escapeHtml(value)}</code></pre>
        </article>
      `;
    })
    .join("");
}

function renderOutreachDraft(recruitment, blindSpots, card) {
  const draft = buildOutreachDraft(recruitment, blindSpots, card);
  const encodedDraft = encodeURIComponent(draft);

  return `
    <article class="outreach-draft-card">
      <div class="outreach-draft-head">
        <p class="outreach-draft-label">LinkedIn / Email Draft</p>
        <button class="code-copy-btn" type="button" data-copy-text="${encodedDraft}">Copy message</button>
      </div>
      <p class="outreach-copy">${escapeHtml(draft)}</p>
    </article>
  `;
}

function buildOutreachDraft(recruitment, blindSpots, card) {
  const roleLabel = firstNonEmptyText(
    [elements.roleTitleInput && elements.roleTitleInput.value],
    formatSearchType(card.opportunity_type || "role")
  );

  const industryLabel = firstNonEmptyText(
    [elements.industryInput && elements.industryInput.value],
    "B2B SaaS"
  );

  const personaSnippet = firstNonEmptyText(
    [recruitment.candidate_persona],
    "enterprise-capable seller who can run disciplined long-cycle execution"
  );

  const successSnippet = firstNonEmptyText(
    [recruitment.hidden_success_profile],
    "forecast accuracy, CRM hygiene, and strong multi-stakeholder deal control"
  );

  const thesisSnippet = firstNonEmptyText(
    [blindSpots.corrected_search_thesis],
    "prioritize disciplined long-cycle execution over pure close-speed signal"
  );

  const thesisSentence = thesisSnippet
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .find(Boolean) || thesisSnippet;

  return [
    `Hi [First Name], I am leading a ${roleLabel} search in ${industryLabel}, and your track record in complex B2B selling stood out.`,
    "This is not a pure close-speed mandate; the biggest risk is hiring someone who interviews well but loses control in longer, multi-stakeholder cycles.",
    `Ideal profile: ${ensureTerminalPunctuation(personaSnippet)}`,
    `Interview evidence we prioritize: ${ensureTerminalPunctuation(successSnippet)}`,
    `Search thesis: ${ensureTerminalPunctuation(thesisSentence)}`,
    "If this aligns, I can share the scorecard and 21-day execution plan before we schedule a quick call."
  ].join(" ");
}

function renderClarificationStatus(needsClarification) {
  return needsClarification
    ? "Some details were estimated. Review questions and assumptions below."
    : "Brief has enough confirmed detail for execution."
}

function renderAssumptionStatus(assumptionBasedDraftUsed) {
  return assumptionBasedDraftUsed
    ? "Best-guess inputs used where the brief was silent."
    : "Plan built mainly from confirmed brief details."
}

function buildRoleTypeSignal(card, diagnosis) {
  const opportunityType = String(card && card.opportunity_type ? card.opportunity_type : "").toLowerCase();
  const rationale = String(diagnosis && diagnosis.opportunity_type_rationale ? diagnosis.opportunity_type_rationale : "");

  if (opportunityType.includes("agency") || /enterprise/i.test(rationale)) {
    return "Client-side enterprise AE search";
  }

  return formatSearchType(card && card.opportunity_type);
}

function buildBriefClaritySignal(card, diagnosis) {
  const clarityLabel = formatClarityLabel(card && card.clarity_level);
  if (/very vague|needs more detail/i.test(clarityLabel)) {
    return "Vague - missing success targets and cycle definition";
  }

  const rationale = String(diagnosis && diagnosis.clarity_rationale ? diagnosis.clarity_rationale : "").trim();
  if (rationale) {
    return ensureTerminalPunctuation(rationale);
  }

  return `${clarityLabel} - core success targets are mostly defined`;
}

function buildOutputPlanSignal(card, diagnosis) {
  const pathway = String(card && card.output_pathway ? card.output_pathway : "");
  if (/full operating system/i.test(pathway)) {
    return "Full hiring plan required - sourcing, screening, and interviews all need calibration";
  }

  const rationale = String(diagnosis && diagnosis.pathway_rationale ? diagnosis.pathway_rationale : "").trim();
  if (rationale) {
    return ensureTerminalPunctuation(rationale);
  }

  return `${formatBuildTrack(pathway)} - calibrate execution before launch`;
}

function mapConfidenceTone(confidenceLabel) {
  const normalized = String(confidenceLabel || "").toUpperCase();
  if (normalized === "HIGH") {
    return "high";
  }
  if (normalized === "MEDIUM") {
    return "medium";
  }
  return "low";
}

function renderLineBreakText(items, fallback = "Not provided.") {
  const lines = toArray(items).map((item) => String(item || "").trim()).filter(Boolean);
  if (!lines.length) {
    return escapeHtml(fallback);
  }

  return lines.map((line) => escapeHtml(ensureTerminalPunctuation(line))).join("<br />");
}

function renderCommaList(items, fallback = "Not provided") {
  const values = toArray(items).map((item) => String(item || "").trim()).filter(Boolean);
  if (!values.length) {
    return escapeHtml(fallback);
  }

  return escapeHtml(values.join(", "));
}

function renderScorecardItems(items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    return `
      <article class="scorecard-item">
        <p class="scorecard-label">Not provided</p>
        <p class="scorecard-weight">Weight -</p>
        <p class="scorecard-desc">No scorecard criteria were provided.</p>
      </article>
    `;
  }

  return list
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      return `
        <article class="scorecard-item">
          <p class="scorecard-label">${escapeHtml(item.category || "Category")}</p>
          <p class="scorecard-weight">Weight ${escapeHtml(item.weight || "-")}</p>
          <p class="scorecard-desc">${escapeHtml(item.what_to_look_for || "No details provided.")}</p>
        </article>
      `;
    })
    .join("");
}

function renderInterviewItems(groups) {
  const sections = [
    { key: "technical", label: "Skills" },
    { key: "behavioral", label: "Behavior" },
    { key: "execution", label: "Execution" },
    { key: "stakeholder", label: "Stakeholders" }
  ];

  return sections
    .map((section) => {
      const values = groups && typeof groups === "object" ? groups[section.key] : [];
      return `
        <article class="interview-item">
          <p class="interview-label">${escapeHtml(section.label)}</p>
          <p class="interview-value">${renderLineBreakText(values, "No questions provided.")}</p>
        </article>
      `;
    })
    .join("");
}

function renderPlanWeeks(plan) {
  const weekDefinitions = [
    { index: 1, label: "Week 1 - Days 1-7", items: toArray(plan && plan.week1) },
    { index: 2, label: "Week 2 - Days 8-14", items: toArray(plan && plan.week2) },
    { index: 3, label: "Week 3 - Days 15-21", items: toArray(plan && plan.week3) }
  ];

  return weekDefinitions
    .map((week) => {
      const details = week.items.length
        ? week.items.map((item) => `<p>${escapeHtml(ensureTerminalPunctuation(String(item || "")))}</p>`).join("")
        : `<p>${escapeHtml("No actions listed for this week.")}</p>`;

      return `
        <article class="plan-week">
          <span class="plan-index">${week.index}</span>
          <h4>${escapeHtml(week.label)}</h4>
          ${details}
        </article>
      `;
    })
    .join("");
}

function sanitizeGroundingNotes(notes) {
  return toArray(notes).filter((note) => {
    const value = String(note || "").toLowerCase();
    return !/(sample to review ui|review ui and flow|api is connected|demo only|placeholder|mock only)/i.test(value);
  });
}

function ensureTerminalPunctuation(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function renderSprintTimeline(plan) {
  const weekDefinitions = [
    { label: "Week 1", subtitle: "Days 1-7", items: toArray(plan && plan.week1) },
    { label: "Week 2", subtitle: "Days 8-14", items: toArray(plan && plan.week2) },
    { label: "Week 3", subtitle: "Days 15-21", items: toArray(plan && plan.week3) }
  ];

  const hasAny = weekDefinitions.some((week) => week.items.length > 0);
  if (!hasAny) {
    return '<p class="module-empty">No 21-day actions provided.</p>';
  }

  return `
    <div class="sprint-timeline">
      ${weekDefinitions
        .map((week, index) => {
          return `
            <article class="timeline-week">
              <div class="timeline-marker" aria-hidden="true"><span>${index + 1}</span></div>
              <div class="timeline-body">
                <h4>${escapeHtml(week.label)}</h4>
                <p class="timeline-subtitle">${escapeHtml(week.subtitle)}</p>
                ${week.items.length ? renderModuleList(week.items, "timeline-list") : '<p class="module-empty">No actions listed.</p>'}
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderRecruitmentRubric(items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    return '<p class="module-empty">No scorecard items provided.</p>';
  }

  const cards = list
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      return `
        <article class="rubric-item">
          <div class="rubric-item-head">
            <h4>${escapeHtml(item.category || "Category")}</h4>
            <span class="rubric-weight">Weight ${escapeHtml(item.weight || "-")}</span>
          </div>
          <p>${escapeHtml(item.what_to_look_for || "No details provided.")}</p>
        </article>
      `;
    })
    .join("");

  return `<div class="rubric-grid">${cards || '<p class="module-empty">No scorecard items provided.</p>'}</div>`;
}

function renderInterviewQuestionGroups(groups) {
  if (!groups || typeof groups !== "object") {
    return '<p class="module-empty">No interview questions provided.</p>';
  }

  const sections = [
    { key: "technical", label: "Skills" },
    { key: "behavioral", label: "Behavior" },
    { key: "execution", label: "Execution" },
    { key: "stakeholder", label: "Stakeholders" }
  ];

  return `
    <div class="interview-group-grid">
      ${sections
        .map((section) => {
          const items = toArray(groups[section.key]);
          return `
            <section class="interview-group-card">
              <h4>${escapeHtml(section.label)}</h4>
              ${items.length ? renderModuleList(items) : '<p class="module-empty">No questions provided.</p>'}
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderModuleList(items, className = "result-list") {
  const list = toArray(items);
  if (!list.length) {
    return '<p class="module-empty">Not provided.</p>';
  }

  const normalized = list.map((item) => {
    if (typeof item === "string") {
      return item;
    }

    if (item && typeof item === "object") {
      try {
        return JSON.stringify(item);
      } catch {
        return String(item);
      }
    }

    return String(item);
  });

  return `<ul class="${escapeHtml(className)}">${normalized
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function renderList(items) {
  return renderModuleList(items);
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
