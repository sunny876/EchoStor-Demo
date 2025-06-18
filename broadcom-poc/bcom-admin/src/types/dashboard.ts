// Dashboard data type definitions

// Query volume data type
export interface QueryVolumeData {
  date: string;
  volume: number;
  handoffs: number;
}

// Top queries data type
export interface TopQueryData {
  query: string;
  count: number;
  relevance: number;
}

// Feedback data type
export interface FeedbackData {
  name: string;
  value: number;
}

// Hallucination risk data type
export interface HallucinationData {
  id: number;
  query: string;
  risk: 'High' | 'Medium' | 'Low';
  score: number;
  date: string;
}

// Knowledge gap data type
export interface KnowledgeGapData {
  id: number;
  query: string;
  count: number;
  date: string;
}