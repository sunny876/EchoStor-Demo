// Query volume data over time
export const queryVolumeData = [
  { date: 'Apr 24', volume: 248, handoffs: 56 },
  { date: 'Apr 25', volume: 312, handoffs: 68 },
  { date: 'Apr 26', volume: 156, handoffs: 37 },
  { date: 'Apr 27', volume: 142, handoffs: 29 },
  { date: 'Apr 28', volume: 305, handoffs: 73 },
  { date: 'Apr 29', volume: 294, handoffs: 64 },
  { date: 'Apr 30', volume: 328, handoffs: 79 },
];

// Top queries by volume
export const topQueriesData = [
  { query: 'license activation', count: 87, relevance: 0.82 },
  { query: 'password reset', count: 76, relevance: 0.91 },
  { query: 'download software', count: 64, relevance: 0.78 },
  { query: 'installation error', count: 53, relevance: 0.64 },
  { query: 'activation key', count: 49, relevance: 0.80 },
  { query: 'upgrade process', count: 42, relevance: 0.58 },
  { query: 'compatibility issue', count: 37, relevance: 0.72 },
];

// Feedback distribution data
export const feedbackData = [
  { name: 'Helpful', value: 68 },
  { name: 'Not Helpful', value: 32 },
];

// Hallucination risk monitor data
export const hallucinations = [
  { id: 1, query: 'How do I renew my license for Carbon Black?', risk: 'High', score: 0.76, date: '30 Apr 2025' },
  { id: 2, query: 'Where can I find documentation for zSeries integration?', risk: 'Medium', score: 0.54, date: '30 Apr 2025' },
  { id: 3, query: 'What\'s the process for upgrading Symphony to version 10?', risk: 'High', score: 0.82, date: '29 Apr 2025' },
  { id: 4, query: 'How do I configure RACF with Advanced Authentication?', risk: 'Medium', score: 0.51, date: '29 Apr 2025' },
];

// Knowledge gaps data
export const knowledgeGaps = [
  { id: 1, query: 'VMware vSphere integration with Broadcom tools', count: 24, date: '30 Apr 2025' },
  { id: 2, query: 'Carbon Black cloud migration steps', count: 18, date: '30 Apr 2025' },
  { id: 3, query: 'Brocade switch firmware update procedure', count: 15, date: '29 Apr 2025' },
  { id: 4, query: 'Support for semiconductor design tools', count: 12, date: '28 Apr 2025' },
];