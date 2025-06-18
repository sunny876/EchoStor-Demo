"""
  Consumes the Vectara Query History API to get telemetry of past queries, compute statistics, identify queries that
  have search result relevance and FCS scores below a defined threshold, and output a report and log files.

  The report summary file is written to whatever value is set for the REPORT_FILE variable.
  It uses the file designated by REPORT_TEMPLATE_FILE as its template.

  Any queries that have a low average search result relevance score are written to the file named by the
  LOW_SEARCH_RELEVANCE_QUERIES_LOG variable.

  Any queries that have a low average FCS are written to the file named by the LOW_FCS_QUERIES_LOG variable.

  This requires the following env variables to be set:
  VECTARA_API_KEY
  VECTARA_CORPUS_KEY

  Run via one of the following (all arguments are optional):
    python3 kb_gap_report
    python3 kb_gap_report --num-queries 100 --avg-search-result-relevance-threshold 0.75 --fcs-threshold 0.5
"""

import os
import json
import re
import argparse
import http.client

VECTARA_API_KEY = os.getenv("VECTARA_API_KEY") #"zut_HNBRQvKNYGAFosBfnun2or80M6WMz020npkT2Q"
VECTARA_CORPUS_KEY = os.getenv("VECTARA_CORPUS_KEY")

CONN = http.client.HTTPSConnection("api.vectara.io")

LOW_SEARCH_RELEVANCE_QUERIES_LOG = "low_search_relevance_queries.json"
LOW_FCS_QUERIES_LOG = "low_fcs_queries.json"
REPORT_TEMPLATE_FILE = "broadcom-support-admin-template.html"
REPORT_FILE = "broadcom-support-admin.html"

def get_query_histories(num_queries: int):
  payload = { }
  headers = { 'Accept': 'application/json', 'x-api-key': VECTARA_API_KEY }

  CONN.request("GET", f"/v2/queries?corpus_key={VECTARA_CORPUS_KEY}&limit={num_queries}", json.dumps(payload), headers)
  res = CONN.getresponse()
  data = res.read()

  query_history_response = json.loads(data.decode("utf-8"))

  return query_history_response


def get_query_details(query_telemetry: dict):
  payload = { "corpus_key": VECTARA_CORPUS_KEY }
  headers = { 'Accept': 'application/json', 'x-api-key': VECTARA_API_KEY }

  CONN.request("GET", f"/v2/queries/{query_telemetry.get('id')}", json.dumps(payload), headers)
  res = CONN.getresponse()
  data = res.read()

  query_history_response = json.loads(data.decode("utf-8"))

  return query_history_response


def get_span_of_type(spans: list, span_type: str):
  if not spans:
    return None

  for span in spans:
    if span['type'] == span_type:
      return span

  return None


def log_queries_to_file(filename: str, queries: list):
  with open(filename, "w") as file:
    file.write(json.dumps(queries, indent=4))
    file.close()


def replace_template_var(target_substr: str, new_substr: str, orig_whole_str: str):
  escaped_target_substr = re.escape(target_substr)
  return re.sub(escaped_target_substr, new_substr, orig_whole_str)


def build_query_output_html(queries: list):
  agg = ""
  for query in queries:
    agg += f"<p><b>Query: </b> {query.get('query')}</p>"
    #if query.get('avg_relevance_score'):
    #  agg += f"<p><b>Avg Search Relevance Score: </b> {query.get('avg_relevance_score')}</p>"
    #elif query.get('fcs'):
    #  agg += f"<p><b>FCS: </b> {query.get('fcs')}</p>"
    agg += f"<p><b>Response: </b>{query.get('response')}</p>"
    agg += f"<p>&nbsp;</p>"

  return agg


def write_report(num_queries_total: int, search_relevance_score_avg: float, num_queries_with_low_search_relevance_score: float,
                 num_queries_using_fcs: float, fcs_avg: float, num_queries_with_low_fcs: float,
                 avg_search_result_relevance_threshold: float, low_search_relevance_score_queries: list,
                 fcs_threshold: float, low_fcs_queries: list):
  # Load REPORT_TEMPLATE_FILE
  with open(REPORT_TEMPLATE_FILE, "r") as template_file:
    # Replace all template vars with actual vars
    template = template_file.read()
    template_file.close()

    template = replace_template_var("$num_queries_total", str(num_queries_total), template)
    template = replace_template_var("$search_relevance_score_avg", str(search_relevance_score_avg), template)
    template = replace_template_var("$num_queries_with_low_search_relevance_score", str(num_queries_with_low_search_relevance_score), template)
    template = replace_template_var("$num_queries_using_fcs", str(num_queries_using_fcs), template)
    template = replace_template_var("$fcs_avg", str(fcs_avg), template)
    template = replace_template_var("$num_queries_with_low_fcs", str(num_queries_with_low_fcs), template)

    template = replace_template_var("$avg_search_result_relevance_threshold", str(round(avg_search_result_relevance_threshold, 2)), template)
    template = replace_template_var("$low_search_relevance_score_queries", build_query_output_html(low_search_relevance_score_queries), template)
    template = replace_template_var("$fcs_threshold", str(round(fcs_threshold, 2)), template)
    template = replace_template_var("$low_fcs_queries", build_query_output_html(low_fcs_queries), template)

    with open(REPORT_FILE, "w") as report_file:
      # Write updated file to REPORT_FILE
      report_file.write(template)
      report_file.close()


def main():
    """Parse command line arguments with validation"""
    parser = argparse.ArgumentParser(description="Knowledge Base Gap Analysis Report Builder")

    parser.add_argument("--num-queries",
                        type=int,
                        help="Max number of queries to analyze",
                        default=100)
    parser.add_argument("--avg-search-result-relevance-threshold",
                        type=float,
                        help="Average search result relevance score threshold to qualify for 'low relevance'",
                        default=0.5)
    parser.add_argument("--fcs-threshold",
                        type=float,
                        help="FCS threshold to qualify for 'low FCS'",
                        default=0.2)

    args = parser.parse_args()

    query_history_response = get_query_histories(args.num_queries)
    print(f"Total queries being analyzed: {len(query_history_response.get('queries'))}")

    num_queries = 0
    num_queries_with_bad_telemetry = 0

    search_relevance_score_agg = 0
    num_queries_with_low_search_relevance_score = 0
    low_search_relevance_score_queries = []

    num_queries_using_fcs = 0
    fcs_agg = 0
    num_queries_with_low_fcs = 0
    low_fcs_queries = []

    for query_telemetry in query_history_response.get("queries"):
      query_details = get_query_details(query_telemetry)

      query_container = query_details.get('query')

      query = query_container.get('query')
      max_used_search_results = query_container.get('generation').get('max_used_search_results')

      spans = query_details.get('spans')

      if not spans:
        num_queries_with_bad_telemetry += 1
        continue

      search_span = get_span_of_type(spans, "search")
      max_used_search_results_relevance_score_agg = 0
      search_results = search_span.get("search_results")
      for r in range(min(max_used_search_results, len(search_results))):
        max_used_search_results_relevance_score_agg+= search_results[r].get("score")
      max_used_search_results_relevance_score_avg = (max_used_search_results_relevance_score_agg / max_used_search_results)
      search_relevance_score_agg+= max_used_search_results_relevance_score_avg

      generation_span = get_span_of_type(spans, "generation")
      generation = generation_span.get('generation')

      if max_used_search_results_relevance_score_avg < args.avg_search_result_relevance_threshold:
        num_queries_with_low_search_relevance_score += 1
        low_search_relevance_score_queries.append({"query": query, "response": generation,
                                                   "avg_relevance_score": round(max_used_search_results_relevance_score_avg, 2)})

      fcs_span = get_span_of_type(spans, "fcs")
      fcs = None
      if fcs_span:
        fcs = fcs_span.get('score')
        num_queries_using_fcs+= 1
        fcs_agg+= fcs
        if fcs < args.fcs_threshold:
          num_queries_with_low_fcs += 1
          low_fcs_queries.append({"query": query, "response": generation, "fcs": round(fcs, 2)})

      #print(f"[{num_queries}] Query: {query} | max_used_search_results: {max_used_search_results} | "
      #      f"Response: {generation} | FCS: {fcs} | avg_search_result_relevance_score {max_used_search_results_relevance_score_avg}")

      num_queries+= 1

    # Factor out any queries that had bad telemetry
    if num_queries_with_bad_telemetry > 0:
      num_queries-= num_queries_with_bad_telemetry
      num_queries_using_fcs -= num_queries_with_bad_telemetry
      num_queries_with_low_fcs-= num_queries_with_bad_telemetry

    search_relevance_score_avg = round(search_relevance_score_agg/num_queries, 2)
    fcs_avg = round(fcs_agg/num_queries_using_fcs, 2)
    print("")
    print(f"search_relevance_score_avg={search_relevance_score_avg}")
    print(f"num_queries_with_low_search_relevance_score={num_queries_with_low_search_relevance_score}")
    print(f"num_queries_using_fcs={num_queries_using_fcs}")
    print(f"fcs_avg={fcs_avg}")
    print(f"num_queries_with_low_fcs={num_queries_with_low_fcs}")
    print(f"num_queries_with_bad_telemetry={num_queries_with_bad_telemetry}")
    print("")

    # Write stats to a clean report, and maybe output all the bad queries at the bottom?
    write_report(num_queries, search_relevance_score_avg, num_queries_with_low_search_relevance_score,
                 num_queries_using_fcs, fcs_avg, num_queries_with_low_fcs,
                 args.avg_search_result_relevance_threshold, low_search_relevance_score_queries,
                 args.fcs_threshold, low_fcs_queries)

    # log the bad queries to files
    if low_search_relevance_score_queries:
      log_queries_to_file(LOW_SEARCH_RELEVANCE_QUERIES_LOG, low_search_relevance_score_queries)
      print(f"Wrote {len(low_search_relevance_score_queries)} queries with low search relevance score "
            f"(<{args.avg_search_result_relevance_threshold}) {LOW_SEARCH_RELEVANCE_QUERIES_LOG}")
    if low_fcs_queries:
      log_queries_to_file(LOW_FCS_QUERIES_LOG, low_fcs_queries)
      print(f"Wrote {len(low_fcs_queries)} queries with low FCS score "
            f"(<{args.fcs_threshold})to {LOW_FCS_QUERIES_LOG}")


if __name__ == "__main__":
    main()
