/**
 * The details the legal pages quote: who runs the site and how to reach them.
 *
 * Kept in one place so the privacy policy, the terms and the accessibility
 * statement never disagree. A value that starts with "[" is a placeholder still
 * waiting for the owner to fill it in, and the pages draw it highlighted so it
 * cannot go live unnoticed.
 */
export const LEGAL = {
  /** Registered name of the person or company that runs the site (עוסק / חברה). */
  entityName: "[שם הישות המשפטית — להשלמה]",
  /** עוסק מורשה / פטור / ח"פ number. Required on the page once payments start. */
  businessId: "[מספר עוסק / ח\"פ — להשלמה]",
  /** Postal address for legal notices and cancellation letters. */
  address: "[כתובת למשלוח דואר — להשלמה]",
  phone: "[מספר טלפון — להשלמה]",
  email: "recipespaceapp@gmail.com",
  /** Name of the accessibility coordinator. */
  accessibilityCoordinator: "[שם רכז/ת הנגישות — להשלמה]",
  accessibilityEmail: "recipespaceapp@gmail.com",
  accessibilityPhone: "[טלפון לפניות נגישות — להשלמה]",
} as const;

export const isPlaceholder = (value: string) => value.startsWith("[");

/** When each page was last revised, as shown on it. */
export const UPDATED = {
  privacy: "אוקטובר 2026",
  terms: "אוקטובר 2026",
  accessibility: "אוקטובר 2026",
} as const;
