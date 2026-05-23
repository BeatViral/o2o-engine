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

  const copyButton = target.closest("[data-copy-boolean]");
  if (!(copyButton instanceof HTMLButtonElement)) {
    return;
  }

  const encodedValue = String(copyButton.getAttribute("data-copy-boolean") || "");
  const decodedValue = decodeURIComponent(encodedValue);
  if (!decodedValue.trim()) {
    return;
  }

  const originalLabel = copyButton.textContent || "Copy";

  try {
    await navigator.clipboard.writeText(decodedValue);
    copyButton.textContent = "Copied";
    copyButton.disabled = true;
    setTimeout(() => {
      copyButton.textContent = originalLabel;
      copyButton.disabled = false;
    }, 1200);
    setStatus("Boolean string copied to clipboard", "success");
  } catch (error) {
    setStatus(error.message || "Could not copy Boolean string", "error");
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
    return "Start With Risk Check";
  }

  if (value === "Workflow System") {
    return "Build Core Hiring Steps";
  }

  if (value === "Full Operating System") {
    return "Build Full Hiring Plan";
  }

  return value || "Build Core Hiring Steps";
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
          <p>Build Full Hiring Plan</p>
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
      ? "Start with risk check and lock the hiring direction before sourcing."
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
  const groundingNotes = toArray(system.grounding_notes);

  const version = system.version || { revision: 1, generated_at: "" };
  const generatedAt = formatResetDate(version.generated_at);
  const riskScan = computeRiskScan(card, blindSpots);

  elements.outputSection.hidden = false;
  setOutputEmptyState(false);
  elements.output.innerHTML = `
    <div class="diagnostic-output-shell">
      <section class="panel risk-scan-panel fade-in-diagnosis">
        <div class="risk-scan-head">
          <p class="diagnosis-kicker">Quick Risk Check</p>
          <h3>Check Risk Before You Search</h3>
          <p class="risk-scan-note">This shows where the brief could fail.</p>
        </div>
        <div class="risk-metric-grid">
          ${renderRiskMetric("Role Clarity", riskScan.roleClarityScore)}
          ${renderRiskMetric("Success Clarity", riskScan.successDefinitionScore)}
          ${renderRiskMetric("Market Match", riskScan.candidateMarketAlignmentScore)}
        </div>
        <div class="risk-level-row">
          <div>
            <p class="risk-label">Risk Of Wrong Hire</p>
            <p class="risk-score">${escapeHtml(String(riskScan.failureModeRiskScore))}/100</p>
          </div>
          <span class="risk-pill risk-${riskScan.failureModeRisk.toLowerCase()} pulse-risk">${escapeHtml(riskScan.failureModeRisk)}</span>
        </div>
      </section>

      <section class="panel blindspot-diagnosis-panel fade-in-diagnosis">
        <div class="diagnosis-head">
          <p class="diagnosis-kicker">Blind Spot Analysis</p>
          <h3>Blind Spot Diagnosis: Fix These First</h3>
          <p class="panel-note">Fix these issues first so you do not waste weeks searching.</p>
        </div>
        <div class="diagnosis-need-grid">
          <article class="diagnosis-need-card">
            <h4>What You Asked For</h4>
            <p>${escapeHtml(blindSpots.stated_need || "Not provided.")}</p>
          </article>
          <article class="diagnosis-need-card emphasis">
            <h4>What You Likely Need</h4>
            <p>${escapeHtml(blindSpots.likely_real_need || "Not inferred yet.")}</p>
          </article>
        </div>
        <div class="diagnosis-list-grid">
          ${renderDiagnosticListCard("&#129513;", "Wrong Assumptions", blindSpots.false_assumptions, "assumptions")}
          ${renderDiagnosticListCard("&#9888;&#65039;", "How This Hire Could Fail", blindSpots.hidden_failure_modes, "failure-modes")}
          ${renderDiagnosticListCard("&#128269;", "Risk Of Hiring The Wrong Person", blindSpots.wrong_candidate_risks, "candidate-risks")}
          ${renderDiagnosticListCard("&#128201;", "Pay Or Level Mismatch", blindSpots.compensation_or_level_mismatch, "mismatch")}
          ${renderDiagnosticListCard("&#10071;", "Missing Success Targets", blindSpots.missing_success_definition, "missing")}
        </div>
        ${renderDiagnosticTextCard("What Good Candidates Will Expect", blindSpots.passive_candidate_reality)}
        <article class="corrected-thesis-card slide-in-thesis">
          <h4><span class="diag-icon" aria-hidden="true">&#127919;</span>What To Hire For Instead</h4>
          <p>${escapeHtml(blindSpots.corrected_search_thesis || "No hiring direction provided.")}</p>
        </article>
      </section>

      <div class="module-divider" role="presentation">
        <span>Your Hiring Plan</span>
      </div>

      <div class="module-card-grid">
        <article class="panel module-card">
          <h3>At A Glance</h3>
          <div class="kv-grid compact">
            <div class="kv"><strong>Role Type</strong><span>${escapeHtml(formatSearchType(card.opportunity_type || ""))}</span></div>
            <div class="kv"><strong>Brief Clarity</strong><span>${escapeHtml(formatClarityLabel(card.clarity_level || ""))}</span></div>
            <div class="kv"><strong>Output Plan</strong><span>${escapeHtml(formatBuildTrack(card.output_pathway))}</span></div>
            <div class="kv"><strong>Confidence</strong><span>${renderBadge(card.confidence_level)}</span></div>
            <div class="kv"><strong>Revision</strong><span>${escapeHtml(String(version.revision || "1"))}</span></div>
            <div class="kv"><strong>Generated</strong><span>${escapeHtml(generatedAt)}</span></div>
          </div>
          <h4>Next Step</h4>
          <p>${escapeHtml(card.recommended_next_step || "No recommendation available.")}</p>
          <h4>Assumptions</h4>
          ${renderModuleList(card.key_assumptions)}
          <h4>Missing Info</h4>
          ${renderModuleList(card.missing_information)}
        </article>

        <article class="panel module-card">
          <h3>Why O2O Gave This Result</h3>
          <h4>Summary</h4>
          <p>${escapeHtml(system.executive_summary || "No executive summary available.")}</p>
          <h4>Brief Diagnosis</h4>
          <p>${escapeHtml(recruitment.job_ad_diagnosis || "No diagnosis narrative provided.")}</p>
          <h4>Why This Hiring Type</h4>
          <p>${escapeHtml(diagnosis.opportunity_type_rationale || "No rationale provided.")}</p>
          <h4>Why This Clarity Score</h4>
          <p>${escapeHtml(diagnosis.clarity_rationale || "No rationale provided.")}</p>
          <h4>Why This Plan Mode</h4>
          <p>${escapeHtml(diagnosis.pathway_rationale || "No rationale provided.")}</p>
          <h4>Why This Confidence</h4>
          <p>${escapeHtml(diagnosis.confidence_rationale || "No rationale provided.")}</p>
        </article>

        <article class="panel module-card">
          <h3>Who To Hire</h3>
          <h4>Best-Fit Profile</h4>
          <p>${escapeHtml(recruitment.candidate_persona || "No candidate persona provided.")}</p>
          <h4>What This Person Must Do Well</h4>
          <p>${escapeHtml(recruitment.hidden_success_profile || "No hidden success profile provided.")}</p>
        </article>

        <article class="panel module-card boolean-module">
          <h3>Search Strings You Can Copy</h3>
          <p class="module-note">Copy these directly into your search tools.</p>
          ${renderBooleanStringBlocks(recruitment.boolean_search_strings)}
        </article>

        <article class="panel module-card">
          <h3>Candidate Scorecard</h3>
          ${renderRecruitmentRubric(recruitment.screening_rubric)}
        </article>

        <article class="panel module-card">
          <h3>Interview Questions</h3>
          ${renderInterviewQuestionGroups(recruitment.interview_questions)}
        </article>

        <article class="panel module-card">
          <h3>Outreach Message</h3>
          <p class="outreach-copy">${escapeHtml(recruitment.outreach_message || "No outreach message provided.")}</p>
        </article>

        <article class="panel module-card timeline-module">
          <h3>21-Day Hiring Plan</h3>
          ${renderSprintTimeline(recruitment.search_sprint_21_day_plan)}
        </article>

        <article class="panel module-card">
          <h3>Questions + Next Steps</h3>
          <div class="kv-grid compact">
            <div class="kv"><strong>Needs More Info</strong><span>${escapeHtml(String(Boolean(clarification.needs_clarification)))}</span></div>
            <div class="kv"><strong>Used Best-Guess Inputs</strong><span>${escapeHtml(String(Boolean(clarification.assumption_based_draft_used)))}</span></div>
          </div>
          <h4>Questions To Ask</h4>
          ${renderModuleList(clarification.questions)}
          <h4>Known</h4>
          ${renderModuleList(knownAssumedUnknown.known)}
          <h4>Assumed</h4>
          ${renderModuleList(knownAssumedUnknown.assumed)}
          <h4>Unknown</h4>
          ${renderModuleList(knownAssumedUnknown.unknown)}
          <h4>Next Actions</h4>
          ${renderModuleList(nextActions)}
          <h4>Notes</h4>
          ${renderModuleList(groundingNotes)}
        </article>
      </div>
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
      <p class="risk-metric-score">${escapeHtml(String(value))}</p>
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
