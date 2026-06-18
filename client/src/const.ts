export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getLoginConfigIssue = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !appId) {
    return "- Missing Firebase configuration (API Key, Project ID, or App ID).";
  }

  return null;
};
