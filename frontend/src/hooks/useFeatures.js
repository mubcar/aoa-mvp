// Feature flags — Solana and voice have been removed.
// Hook kept for forward-compatibility; always returns empty features object.
export function useFeatures() {
  return { features: {}, loading: false };
}
