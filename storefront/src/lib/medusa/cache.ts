/**
 * Returns true during `next build` (static generation phase).
 * API calls should be skipped at build time to prevent caching
 * empty results when the external API is unreachable.
 * ISR will populate the cache on the first real visitor request.
 */
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build"
}
