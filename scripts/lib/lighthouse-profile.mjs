import {
  screenEmulationMetrics,
  throttling,
  userAgents,
} from "lighthouse/core/config/constants.js";

// Preserve the existing slow-network/4x CPU budget; only align the desktop UA.
export const DEFAULT_PERF_PROFILE = "constrained-desktop";

export function lighthouseProfile(name = DEFAULT_PERF_PROFILE) {
  const device = name === "mobile" ? "mobile" : "desktop";
  const network = name === "desktop" ? "desktopDense4G" : "mobileSlow4G";
  if (![DEFAULT_PERF_PROFILE, "desktop", "mobile"].includes(name)) {
    throw new Error(`Unknown performance profile: ${name}`);
  }
  return {
    formFactor: device,
    emulatedUserAgent: userAgents[device],
    screenEmulation: { ...screenEmulationMetrics[device] },
    throttling: { ...throttling[network] },
    throttlingMethod: "simulate",
  };
}

export function performanceSettings(lhr) {
  const { formFactor, emulatedUserAgent, screenEmulation, throttling, throttlingMethod } =
    lhr.configSettings;
  return { formFactor, emulatedUserAgent, screenEmulation, throttling, throttlingMethod };
}
