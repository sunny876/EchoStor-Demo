import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from vectara_agentic.agent import Agent

# Load environment variables from .env file
load_dotenv(override=True)

# --- Configuration ---
VECTARA_API_KEY = os.getenv("VECTARA_API_KEY")
VECTARA_CORPUS_KEY = os.getenv("VECTARA_CORPUS_KEY")

if not VECTARA_API_KEY or not VECTARA_CORPUS_KEY:
    raise ValueError("VECTARA_API_KEY and VECTARA_CORPUS_KEY must be set in the .env file")

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app) # Enable CORS for requests from the React frontend

# --- Initialize Vectara Agent ---
# Using the simple from_corpus helper for a single RAG tool agent
# You can customize the description and specialty as needed
agent = Agent.from_corpus(
    vectara_corpus_key=VECTARA_CORPUS_KEY,
    vectara_api_key=VECTARA_API_KEY,
    data_description="EchoStor support documentation including VMware, Security, Enterprise, Mainframe, Brocade, and Semi-conductors", # Describe the data in your corpus
    assistant_specialty="EchoStor Support", # Define the agent's role
    tool_name="ask_echostor_support", # Give the RAG tool a name
    # Add other optional Agent parameters if needed (e.g., llm_config, agent_type)
)

print("Vectara Agent initialized.")

# --- API Endpoint ---
@app.route('/chat', methods=['POST'])
def handle_chat():
    """Handles incoming chat messages from the frontend."""
    try:
        data = request.get_json()
        user_query = data.get('query')

        if not user_query:
            return jsonify({"error": "Missing 'query' in request body"}), 400

        print(f"Received query: {user_query}")

        # --- Call the Agent --- 
        # This is where the agent processes the query using its tools (e.g., RAG)
        agent_response = agent.chat(user_query)

        print(f"Agent response: {agent_response}")

        # For now, we assume agent_response is a string or can be converted to one.
        # Depending on the agent's complexity, you might get structured data.
        response_text = str(agent_response) if agent_response else "Sorry, I couldn't generate a response."

        # You might want to extract citations or other metadata if the agent provides it
        # For now, just return the main text response
        return jsonify({"response": response_text})

    except Exception as e:
        print(f"Error handling chat request: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# --- Run the App ---
if __name__ == '__main__':
    # Runs on port 8001 to match the frontend configuration
    app.run(debug=True, port=8001) 