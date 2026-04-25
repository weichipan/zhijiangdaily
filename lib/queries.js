import { getIssueByDate, getIssues, getLatestPublishedIssue } from "./repository";
import { formatIssueDate, getTodayDateString } from "./date";

export async function getHomepageData() {
  const issues = await getIssues();
  const latestPublished = await getLatestPublishedIssue();
  const today = getTodayDateString();
  const todayIssue = await getIssueByDate(today);

  return {
    latestIssue: latestPublished || todayIssue,
    history: issues.slice(0, 8),
    todayLabel: formatIssueDate(today),
  };
}
