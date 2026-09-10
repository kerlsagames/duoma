/** Public VAPID key — safe to ship in the client. Rotate with `npx web-push generate-vapid-keys`. */
export const VAPID_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ||
  "BFR51veYlvJSjrolRUQPqtBF5jzAbDGDCf441Z9NTcQqTdxO2OhnN3ykCSi45uR2V74fqiZ3ZHyInVLbyTOHvfY";
