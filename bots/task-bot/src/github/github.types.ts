export interface GitHubIssue {
  arc: string | null;
  title: string;
  priority: string;
  engine: string;
  requirements: string[];
  scope: string[];
}

export interface IssueData {
  state: string;
  title: string;
  body: string;
  comments: Array<{ body: string; createdAt: string }>;
  labels: Array<{ name: string }>;
}

export interface SimpleIssueData {
  state: string;
  title: string;
}

export interface PRData {
  state: string;
  headRefName: string;
  statusCheckRollup: Array<{ name: string; conclusion: string | null }>;
}

export interface PRCheck {
  name: string;
  state: string;
  link: string;
}

export interface PRReview {
  body: string;
  state: string;
}

export interface IssueListItem {
  number: number;
  title: string;
  state: string;
  labels: Array<{ name: string }>;
  comments: Array<{ body: string; createdAt: string }>;
}

export interface Label {
  name: string;
}

export interface CreateWorktreeResult {
  success: boolean;
  path?: string;
  message?: string;
}

export interface VerifyResult {
  ok: boolean;
  errors: string[];
}

export interface InstallDepsResult {
  success: boolean;
  message?: string;
}

export interface CreateIssueResult {
  success: boolean;
  url?: string;
  message?: string;
}

export interface CreatePRResult {
  success: boolean;
  prUrl?: string;
  message: string;
}

export interface ResolveConflictsResult {
  success: boolean;
  message: string;
}

export interface PushBranchResult {
  success: boolean;
  message: string;
}

export interface ImplementLocallyResult {
  success: boolean;
  message: string;
  branchName?: string;
}

export interface FixPRResult {
  success: boolean;
  message: string;
  branchName?: string;
}

export interface CheckAndFixCIResult {
  success: boolean;
  message: string;
  branchName?: string;
}

export interface CreateWorktreeOptions {
  jobId: string;
  baseBranch?: string;
}

export interface RemoveWorktreeOptions {
  jobId: string;
}

export type GitHubIssueView = IssueData;
export type GitHubIssueSimple = SimpleIssueData;
export type GitHubPRView = PRData;
export type GitHubCheck = PRCheck;
export type GitHubReview = PRReview;
export type GitHubIssueListItem = IssueListItem;
export type GitHubIssueBody = GitHubIssue;

export namespace GitHubService {
  export type GitHubPR = PRData;
}