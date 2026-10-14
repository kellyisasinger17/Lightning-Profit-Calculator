import { DEFAULTS, PRICING } from "./config.js";
import { calculateEstimate, calculateProjections, formatCurrency } from "./calculator.js";
import { getCalibrationEstimate, MANUFACTURERS, MODEL_YEARS } from "./vehicle-data.js";

const OPERATIONS = ["Front Bumper", "Rear Bumper", "Quarter Panel", "Side Mirror", "Windshield", "Module", "Trunk", "Alignment", "Steering System", "Battery"];
const state = { year: DEFAULTS.year, manufacturer: null, operations: Object.fromEntries(OPERATIONS.map((name) => [name, { repair: false, install: false }])), calibrationOverride: null, safetyOperations: DEFAULTS.safetyOperations, monthlyVolume: DEFAULTS.monthlyRepairOrders };
const byId = (id) => document.getElementById(id);
const dom = {
  year: byId("vehicle-year"), manufacturerGrid: byId("manufacturer-grid"), vehicleEstimate: byId("vehicle-estimate"), estimateNote: byId("estimate-note"), calibrationCount: byId("calibration-count"), resetCalibrations: byId("reset-calibrations"),
  operationsList: byId("operations-list"), operationsSummary: byId("operations-summary"), clearOperations: byId("clear-operations"), safetyCount: byId("safety-count"), safetyCountDisplay: byId("safety-count-display"), resultsEmpty: byId("results-empty"),
  resultsContent: byId("results-content"), vehicleLabel: byId("selected-vehicle-label"), projectionEmpty: byId("projection-empty"), projectionContent: byId("projection-content"), volumeRange: byId("monthly-volume"), volumeNumber: byId("monthly-volume-number"),
  resetCalculator: byId("reset-calculator"),
};
["metric-profit", "summary-monthly-profit", "summary-annual-profit", "row-cal-profit", "row-safety-profit", "row-total-profit", "projection-volume", "monthly-profit", "annual-profit", "chart-monthly-profit", "chart-annual-profit", "monthly-profit-bar", "annual-profit-bar"].forEach((id) => { dom[id] = byId(id); });

function createCheckbox(operation, type) {
  const label = document.createElement("label"); label.className = "check-cell";
  const input = document.createElement("input"); input.type = "checkbox"; input.dataset.operation = operation; input.dataset.type = type; input.setAttribute("aria-label", `${operation} ${type}`);
  const visual = document.createElement("span"); visual.className = "custom-check";
  const text = document.createElement("span"); text.className = "mobile-check-label"; text.textContent = type;
  label.append(input, visual, text); return label;
}

function initializeControls() {
  const years = document.createDocumentFragment();
  MODEL_YEARS.forEach((year) => { const option = document.createElement("option"); option.value = year; option.textContent = year; years.append(option); }); dom.year.append(years);
  const makes = document.createDocumentFragment();
  MANUFACTURERS.forEach((manufacturer) => { const button = document.createElement("button"); button.type = "button"; button.className = "make-button"; button.dataset.manufacturer = manufacturer; button.textContent = manufacturer; button.setAttribute("aria-pressed", "false"); makes.append(button); }); dom.manufacturerGrid.append(makes);
  const operations = document.createDocumentFragment();
  OPERATIONS.forEach((operation) => { const row = document.createElement("div"); row.className = "operation-row"; const label = document.createElement("strong"); label.textContent = operation; row.append(label, createCheckbox(operation, "repair"), createCheckbox(operation, "install")); operations.append(row); }); dom.operationsList.append(operations);
}

const normalizeInput = (value, min, max = Number.MAX_SAFE_INTEGER) => { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min; };
const selectedCalibrationCount = () => state.manufacturer ? (state.calibrationOverride ?? getCalibrationEstimate(state.year, state.manufacturer)) : 0;

function render() {
  const selected = Boolean(state.manufacturer); const vehicleDefault = selected ? getCalibrationEstimate(state.year, state.manufacturer) : 0; const calibrationCount = selectedCalibrationCount();
  const estimate = calculateEstimate(calibrationCount, state.safetyOperations, PRICING); const projections = calculateProjections(estimate, state.monthlyVolume);
  dom.vehicleEstimate.textContent = selected ? calibrationCount : "—"; dom.estimateNote.textContent = selected ? (state.calibrationOverride === null ? "Vehicle-based estimate" : `Manually adjusted (vehicle estimate: ${vehicleDefault})`) : "Select a manufacturer to calculate.";
  dom.calibrationCount.disabled = !selected; dom.resetCalibrations.disabled = !selected || state.calibrationOverride === null; dom.calibrationCount.value = selected ? calibrationCount : "";
  dom.safetyCount.value = state.safetyOperations; dom.safetyCountDisplay.textContent = state.safetyOperations; dom.volumeRange.value = state.monthlyVolume; dom.volumeNumber.value = state.monthlyVolume;
  document.querySelectorAll(".make-button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.manufacturer === state.manufacturer)));
  dom.resultsEmpty.hidden = selected; dom.resultsContent.hidden = !selected; dom.projectionEmpty.hidden = selected; dom.projectionContent.hidden = !selected; dom.vehicleLabel.textContent = selected ? `${state.year} ${state.manufacturer}` : "Select a manufacturer";
  if (!selected) return;
  dom["metric-profit"].textContent = formatCurrency(estimate.totalProfit); dom["summary-monthly-profit"].textContent = formatCurrency(projections.monthlyProfit); dom["summary-annual-profit"].textContent = formatCurrency(projections.annualProfit);
  dom["row-cal-profit"].textContent = formatCurrency(estimate.calibrationProfit); dom["row-safety-profit"].textContent = formatCurrency(estimate.safetyProfit); dom["row-total-profit"].textContent = formatCurrency(estimate.totalProfit);
  dom["projection-volume"].textContent = projections.volume; dom["monthly-profit"].textContent = formatCurrency(projections.monthlyProfit); dom["annual-profit"].textContent = formatCurrency(projections.annualProfit); dom["chart-monthly-profit"].textContent = formatCurrency(projections.monthlyProfit); dom["chart-annual-profit"].textContent = formatCurrency(projections.annualProfit);
  dom["monthly-profit-bar"].style.width = projections.annualProfit ? `${Math.max(2, projections.monthlyProfit / projections.annualProfit * 100)}%` : "0%"; dom["annual-profit-bar"].style.width = projections.annualProfit ? "100%" : "0%";
}

function renderOperationsSummary() {
  const selected = [];
  Object.entries(state.operations).forEach(([name, values]) => { const types = []; if (values.repair) types.push("Repair"); if (values.install) types.push("Install"); if (types.length) selected.push(`${name} (${types.join(" + ")})`); });
  dom.operationsSummary.textContent = selected.length ? `Selected: ${selected.join(" • ")}` : "No repair operations selected.";
}
function resetOperations() { Object.values(state.operations).forEach((value) => { value.repair = false; value.install = false; }); dom.operationsList.querySelectorAll("input").forEach((input) => { input.checked = false; }); renderOperationsSummary(); }

dom.year.addEventListener("change", () => { state.year = Number(dom.year.value); state.calibrationOverride = null; render(); });
dom.manufacturerGrid.addEventListener("click", (event) => { const button = event.target.closest("button[data-manufacturer]"); if (!button) return; state.manufacturer = button.dataset.manufacturer; state.calibrationOverride = null; render(); });
dom.calibrationCount.addEventListener("input", () => { state.calibrationOverride = normalizeInput(dom.calibrationCount.value, 0); render(); });
dom.resetCalibrations.addEventListener("click", () => { state.calibrationOverride = null; render(); });
dom.operationsList.addEventListener("change", (event) => { const input = event.target.closest("input[data-operation]"); if (!input) return; state.operations[input.dataset.operation][input.dataset.type] = input.checked; renderOperationsSummary(); });
dom.clearOperations.addEventListener("click", resetOperations);
dom.safetyCount.addEventListener("input", () => { state.safetyOperations = normalizeInput(dom.safetyCount.value, 0); render(); });
const updateVolume = (value) => { state.monthlyVolume = normalizeInput(value, 1, 200); render(); };
dom.volumeRange.addEventListener("input", () => updateVolume(dom.volumeRange.value)); dom.volumeNumber.addEventListener("input", () => updateVolume(dom.volumeNumber.value)); dom.volumeNumber.addEventListener("blur", render);
dom.resetCalculator.addEventListener("click", () => { state.year = DEFAULTS.year; state.manufacturer = null; state.calibrationOverride = null; state.safetyOperations = DEFAULTS.safetyOperations; state.monthlyVolume = DEFAULTS.monthlyRepairOrders; dom.year.value = state.year; resetOperations(); render(); window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });

initializeControls(); renderOperationsSummary(); render();
