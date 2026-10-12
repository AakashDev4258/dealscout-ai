export type ScoutCategory = 'all' | 'jobs' | 'hackathons' | 'deals' | 'research' | 'custom';

export interface ScoutFilters {
  location?: string;
  remoteOnly?: boolean;
  budgetMin?: number;
  budgetMax?: number;
  timeframe?: 'any' | '24h' | 'week' | 'month';
}

export interface ScoutRequest {
  query: string;
  category: ScoutCategory;
  filters?: ScoutFilters;
}

export interface RawWebSnippet {
  title: string;
  link: string;
  snippet: string;
  displayed_link?: string;
  date?: string;
  source?: string;
  rich_snippet?: Record<string, unknown>;
}

export interface ScoreBreakdown {
  queryAlignment: number; // 0-35
  evidenceDepth: number;   // 0-25
  freshness: number;       // 0-20
  feasibility: number;     // 0-20
  total: number;           // 0-100
}

export interface CategoryMetadata {
  company?: string;
  role?: string;
  location?: string;
  compensation?: string;
  workType?: 'Remote' | 'Hybrid' | 'On-site' | 'Unspecified';
  experienceLevel?: string;
  organizer?: string;
  prizePool?: string;
  deadline?: string;
  format?: 'Online' | 'In-person' | 'Hybrid';
  eligibility?: string;
  currentPrice?: string;
  originalPrice?: string;
  discountPercentage?: string;
  merchant?: string;
  availability?: string;
  fundingAmount?: string;
  institution?: string;
  grantDeadline?: string;
  field?: string;
  keyHighlights?: string[];
}

export interface ScoutResult {
  id: string;
  title: string;
  sourceUrl: string;
  sourceDomain: string;
  summary: string;
  matchReason: string;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  category: ScoutCategory;
  metadata: CategoryMetadata;
  pros: string[];
  cons: string[];
  verificationNeeded?: string[];
  datePublished?: string;
}

export interface ScoutPlan {
  detectedCategory: ScoutCategory;
  intentSummary: string;
  searchQueries: string[];
  evaluationCriteria: string[];
}

export type PipelineStageId = 'understanding' | 'searching' | 'analyzing' | 'recommendations' | 'complete';

export interface GranularSubStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp?: string;
}

export interface PipelineStep {
  id: PipelineStageId;
  label: string; // 'Understanding request', 'Searching the web', 'Analyzing results', 'Preparing recommendations'
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number; // 0 - 100%
  subSteps: GranularSubStep[];
  details?: string;
}

export interface AgentLogEntry {
  timestamp: string;
  stage: PipelineStageId;
  type: 'info' | 'ai' | 'net' | 'success' | 'warn' | 'error';
  message: string;
}

export interface ScoutResponse {
  success: boolean;
  category: ScoutCategory;
  plan: ScoutPlan;
  results: ScoutResult[];
  totalFound: number;
  searchQueriesUsed: string[];
  methodology: string;
  error?: string;
}

// Chatbot and Conversation Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

export interface ChatContext {
  query?: string;
  category?: ScoutCategory;
  resultsCount?: number;
  topResults?: Array<{
    title: string;
    matchScore: number;
    sourceDomain: string;
    sourceUrl: string;
    summary: string;
    pros: string[];
    cons: string[];
    verificationNeeded?: string[];
  }>;
}
