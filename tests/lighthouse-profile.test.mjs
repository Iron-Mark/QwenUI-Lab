import assert from "node:assert/strict";
import test from "node:test";
import { throttling } from "lighthouse/core/config/constants.js";
import {
  DEFAULT_PERF_PROFILE,
  lighthouseProfile,
} from "../scripts/lib/lighthouse-profile.mjs";

test("default budget keeps slow-network and CPU constraints with a desktop identity", () => {
  assert.equal(DEFAULT_PERF_PROFILE, "constrained-desktop");
  const profile = lighthouseProfile();
  assert.deepEqual(profile.throttling, throttling.mobileSlow4G);
  assert.equal(profile.throttling.cpuSlowdownMultiplier, 4);
  assert.equal(profile.throttling.rttMs, 150);
  assert.equal(profile.throttling.throughputKbps, 1638.4);
  assert.equal(profile.formFactor, "desktop");
  assert.equal(profile.screenEmulation.mobile, false);
  assert.equal(profile.screenEmulation.width, 1350);
  assert.equal(profile.screenEmulation.height, 940);
  assert.doesNotMatch(profile.emulatedUserAgent, /Mobile|Android/);
  assert.equal(profile.throttlingMethod, "simulate");
});

test("optional desktop and mobile profiles have matching device identities", () => {
  const desktop = lighthouseProfile("desktop");
  assert.deepEqual(desktop.throttling, throttling.desktopDense4G);
  const mobile = lighthouseProfile("mobile");
  assert.equal(mobile.formFactor, "mobile");
  assert.equal(mobile.screenEmulation.mobile, true);
  assert.match(mobile.emulatedUserAgent, /Mobile/);
  assert.deepEqual(mobile.throttling, throttling.mobileSlow4G);
});

test("profile settings cannot be contaminated by a previous run", () => {
  const changed = lighthouseProfile();
  changed.throttling.cpuSlowdownMultiplier = 0;
  changed.screenEmulation.width = 1;
  assert.deepEqual(lighthouseProfile().throttling, throttling.mobileSlow4G);
  assert.equal(lighthouseProfile().screenEmulation.width, 1350);
});

test("unknown profiles fail instead of silently changing measurement conditions", () => {
  assert.throws(() => lighthouseProfile("typo"), /Unknown performance profile/);
});
