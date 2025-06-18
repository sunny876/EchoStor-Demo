// vectaraWorker.ts - Inline Web Worker for streaming Vectara responses
interface VectaraRequest {
  chatId: string;
  query: string;
}

self.addEventListener('message', async (e: MessageEvent<VectaraRequest>) => {
  const { chatId, query } = e.data;
  try {
    const response = await fetch(`https://api.vectara.io/v2/chats/${chatId}/turns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'customer-id': '483414338',
        'x-api-key': 'zwt_HNBRQoXkwfwuWUqURLSd1IBk4BNayCKgvOR9Yg'
      },
      body: JSON.stringify({
        query: query,
        search: {
          corpora: [{
            corpus_key: 'EchoStor',
            metadata_filter: '',
            lexical_interpolation: 0.005,
            custom_dimensions: {}
          }],
          offset: 0,
          limit: 3,
          context_configuration: {
            sentences_before: 2,
            sentences_after: 2,
            start_tag: '%START_SNIPPET%',
            end_tag: '%END_SNIPPET%'
          },
          reranker: {
            type: 'customer_reranker',
            reranker_id: 'rnk_272725719'
          }
        },
        stream_response: true,
        generation: {
          // Use mockingbird-2.0 preset for generation
          generation_preset_name: 'mockingbird-2.0',
          max_used_search_results: 3,
          response_language: 'eng',
          enable_factual_consistency_score: true
        }
      })
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let partial = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      partial += decoder.decode(value, { stream: true });
      // post back the evolving text
      (self as any).postMessage({ token: partial });
    }
    // signal completion
    (self as any).postMessage({ done: true });
  } catch (err) {
    (self as any).postMessage({ error: 'Stream failed' });
  }
}); 