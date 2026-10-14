import test from "node:test";
import assert from "node:assert/strict";
import { PRICING } from "../js/config.js";
import { calculateEstimate, calculateProjections, formatCurrency } from "../js/calculator.js";
import { getCalibrationEstimate, MANUFACTURERS, MODEL_YEARS, MODERN_CALIBRATION_ESTIMATES } from "../js/vehicle-data.js";

test("all required years are present newest first", () => { assert.deepEqual(MODEL_YEARS, [2026,2025,2024,2023,2022,2021,2020,2019,2018,2017,2016,2015]); });
test("all legacy vehicles estimate one calibration", () => { for (const year of MODEL_YEARS.filter((value) => value < 2020)) for (const make of MANUFACTURERS) assert.equal(getCalibrationEstimate(year, make), 1); });
test("modern estimates match manufacturer configuration", () => { for (const year of MODEL_YEARS.filter((value) => value >= 2020)) for (const make of MANUFACTURERS) assert.equal(getCalibrationEstimate(year, make), MODERN_CALIBRATION_ESTIMATES[make]); });
test("invalid quantities stay safe", () => { const result = calculateEstimate("bad", -4, PRICING); assert.equal(result.totalRevenue, 0); assert.equal(formatCurrency(Infinity), "$0"); });
test("2026 Audi required validation scenario", () => { const estimate = calculateEstimate(getCalibrationEstimate(2026, "Audi"), 3, PRICING); assert.deepEqual({ calibrationRevenue: estimate.calibrationRevenue, safetyRevenue: estimate.safetyRevenue, totalRevenue: estimate.totalRevenue, totalProfit: estimate.totalProfit, cost: estimate.estimatedServiceCost }, { calibrationRevenue: 135000, safetyRevenue: 12000, totalRevenue: 147000, totalProfit: 44100, cost: 102900 }); const projections = calculateProjections(estimate, 25); assert.deepEqual(projections, { volume: 25, monthlyRevenue: 3675000, monthlyProfit: 1102500, annualRevenue: 44100000, annualProfit: 13230000 }); });
