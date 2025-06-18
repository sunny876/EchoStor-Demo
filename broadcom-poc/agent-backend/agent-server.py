"""
This script requires the following env variables to be present.
* VECTARA_API_KEY
* VECTARA_CUSTOMER_ID
* VECTARA_CORPUS_ID
* OPENAI_API_KEY

The following env variables are optional.
* VECTARA_AGENTIC_AGENT_TYPE=OPENAI
* VECTARA_AGENTIC_MAIN_LLM_PROVIDER=OPENAI
* VECTARA_AGENTIC_MAIN_MODEL_NAME=gpt-4o-2024-08-06
* VECTARA_AGENTIC_TOOL_LLM_PROVIDER=OPENAI
* VECTARA_AGENTIC_TOOL_MODEL_NAME=gpt-4o-2024-08-06

Run this with no arguments, e.g.
python3 agent-server.py
"""

import sys
import os
# --- Add OTP related imports ---
import random
import string
from datetime import datetime, timedelta, timezone # Use timezone-aware datetime
# --- SendGrid imports ---
# from sendgrid import SendGridAPIClient
# from sendgrid.helpers.mail import Mail
# --- End OTP imports ---

from vectara_agentic.tools import ToolsFactory, VectaraToolFactory, VectaraTool
from vectara_agentic.agent import Agent
#from vectara_agentic.agent_endpoint import start_app
from vectara_agentic.agent_config import AgentConfig

from pydantic import BaseModel, Field

import nest_asyncio

import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from vectara_agentic.agent import AgentStatusType

import json
import ast
import re # Import regex for fallback parsing
import uuid # For potential future use, though using formatted strings now
from typing import List, Dict, Any, Optional # For type hinting

import requests
from requests.auth import HTTPBasicAuth

import dotenv
dotenv.load_dotenv()


# --- Global Storage for Last RAG Result (Potential Concurrency Issue) ---
# WARNING: In a multi-agent/concurrent scenario, this might store results
# from a different request than the one being processed in /chat.
last_rag_result = {"fcs_score": None, "citations": []}
# ---

api_key_header = APIKeyHeader(name="X-API-Key")
session_header = APIKeyHeader(name="session")
email_header = APIKeyHeader(name="email")


NUM_AGENTS = 10

# A hack to get the channel ID is to get the link for the channel, then copy the long number at the end of the link,
# which is a JWT token. Then paste that into a JWT decoder (e.g. https://fusionauth.io/dev-tools/jwt-decoder) and
# decode it. The resulting sid contains the channel ID.
SUPPORT_QUEUES = ["vmware", "mainframe", "carbonblack", "account"]
LIVE_AGENTS = {
    SUPPORT_QUEUES[0]: {"name": "Joe", "id": "ijkl9012", "topic": "vmware", "channel":      "49fb123786864b03ae3536764fa01b38@conference.xmpp.zoom.us"}, #vmware      JWT=eyJzaWQiOiI0OWZiMTIzNzg2ODY0YjAzYWUzNTM2NzY0ZmEwMWIzOEBjb25mZXJlbmNlLnhtcHAuem9vbS51cyJ9
    SUPPORT_QUEUES[1]: {"name": "Amr", "id": "efgh5678", "topic": "mainframe", "channel":   "b820dbf418df4587b47a0995a76ee947@conference.xmpp.zoom.us"}, #mainframe   JWT=eyJzaWQiOiJiODIwZGJmNDE4ZGY0NTg3YjQ3YTA5OTVhNzZlZTk0N0Bjb25mZXJlbmNlLnhtcHAuem9vbS51cyJ9
    SUPPORT_QUEUES[2]: {"name": "Eva", "id": "mnop3456", "topic": "carbonblack", "channel": "d3667e9a8cad467c8dfe10422b55dbbd@conference.xmpp.zoom.us"}, #carbonblack JWT=eyJzaWQiOiJkMzY2N2U5YThjYWQ0NjdjOGRmZTEwNDIyYjU1ZGJiZEBjb25mZXJlbmNlLnhtcHAuem9vbS51cyJ9
    SUPPORT_QUEUES[3]: {"name": "Tony", "id": "abcd1234", "topic": "account", "channel":    "9a342d1189c74cd688b82a103e91bb10@conference.xmpp.zoom.us"}, #account     JWT=eyJzaWQiOiI5YTM0MmQxMTg5Yzc0Y2Q2ODhiODJhMTAzZTkxYmIxMEBjb25mZXJlbmNlLnhtcHAuem9vbS51cyJ9
    #SUPPORT_QUEUES[3]: {"name": "Felicia", "id": "abcd1234", "channel":  "bd89065fd2334a9885abe8f1b9c7988c@conference.xmpp.zoom.us"}, #support   JWT=eyJzaWQiOiJiZDg5MDY1ZmQyMzM0YTk4ODVhYmU4ZjFiOWM3OTg4Y0Bjb25mZXJlbmNlLnhtcHAuem9vbS51cyJ9
    #SUPPORT_QUEUES[4]: {"name": "Tallat", "id": "abcd1234", "channel":  "2c2337ab03604e5c8ea893b44493c9f8@conference.xmpp.zoom.us"}, #general    JWT=eyJzaWQiOiIyYzIzMzdhYjAzNjA0ZTVjOGVhODkzYjQ0NDkzYzlmOEBjb25mZXJlbmNlLnhtcHAuem9vbS51cyJ9
}


# configure from environment
JIRA_BASE_URL = os.getenv("JIRA_BASE_URL")
JIRA_EMAIL    = os.getenv("JIRA_EMAIL")
JIRA_API_KEY  = os.getenv("JIRA_API_KEY")

# shared session
_jira_session = requests.Session()
_jira_session.auth = HTTPBasicAuth(JIRA_EMAIL, JIRA_API_KEY)
_jira_session.headers.update({
    "Accept": "application/json",
    "Content-Type": "application/json"
})


# --- OTP Storage (In-memory, suitable for POC) ---
# Structure: { "email@example.com": {"otp": "123456", "expiry": datetime_object} }
otp_storage = {}
OTP_EXPIRY_MINUTES = 5 # Set OTP expiry time
# ---

# --- Pydantic Models for API - Keep Here ---
class ChatRequest(BaseModel):
    query: str
class SendOtpRequest(BaseModel):
    email: str
class VerifyOtpRequest(BaseModel):
    email: str
    otp: str
# ---

# --- Account Management Data Structures ---
class Product(BaseModel):
    name: str
    version: Optional[str] = None
    license_key: Optional[str] = None # Example additional field

class UserRecord(BaseModel):
    user_id: str
    name: str
    company: str
    email: str # Keep email here for easy access within the record
    products: List[Product] = []
    support_tier: str

# In-memory store (dictionary): {email: UserRecord}
account_data_store = {
    "alice@echostor.com": UserRecord(
        user_id="USR-001", name="Alice Alpine", company="EchoStor Inc.", email="alice@echostor.com",
        products=[Product(name="VMware vSphere", version="8.0"), Product(name="Symantec DLP", license_key="DLP-ABC-123")],
        support_tier="Premier"
    ),
    "justin@vectara.com": UserRecord(
        user_id="USR-002", name="Justin Hayes", company="Vectara", email="justin@vectara.com",
        products=[Product(name="CA Automic Automation", version="21.0")],
        support_tier="Standard"
    ),
    "syed@vectara.com": UserRecord(
        user_id="USR-003", name="Syed Ali", company="Vectara", email="syed@vectara.com",
        products=[],
        support_tier="Basic"
    ),
    "diana.prince@stark.com": UserRecord(
        user_id="USR-004", name="Diana Prince", company="Stark Industries", email="diana.prince@stark.com",
        products=[Product(name="Symantec Endpoint Security", license_key="SES-XYZ-789"), Product(name="VMware Cloud Foundation", version="5.1")],
        support_tier="Premier"
    ),
    "edward.engineer@cyb.org": UserRecord(
        user_id="USR-005", name="Edward Engineer", company="Cyberdyne Systems", email="edward.engineer@cyb.org",
        products=[Product(name="Brocade SAN Switches", version="FabricOS 9.x")],
        support_tier="Standard"
    ),
}
# ---

# --- NEW: Helper to Generate Random User Data ---
def generate_random_user_data(email: str) -> UserRecord:
    """Generates a UserRecord with randomized data for a given email."""
    logger = logging.getLogger("uvicorn.error")
    logger.info(f"Generating random user data for new email: {email}")

    # Simple random data generation (can be made more sophisticated)
    random_suffix = str(uuid.uuid4())[:6].upper()
    user_id = f"USR-GEN-{random_suffix}"
    
    first_names = ["Alex", "Jordan", "Morgan", "Taylor", "Casey", "Riley"]
    last_names = ["Smith", "Jones", "Williams", "Brown", "Davis", "Miller"]
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    
    companies = ["Globex Corp", "Cyberdyne", "Wayne Enterprises", "Stark Industries", "Acme Corp", "Umbrella Corp"]
    company = random.choice(companies)
    
    support_tiers = ["Basic", "Standard", "Premier"]
    support_tier = random.choice(support_tiers)
    
    # Optionally add a random product
    products = []
    if random.random() > 0.3: # 70% chance of having a product
        product_names = ["VMware Fusion", "Symantec Ghost", "CA ERwin", "Brocade Adapter", "Clarity PPM"]
        products.append(Product(name=random.choice(product_names)))

    new_record = UserRecord(
        user_id=user_id,
        name=name,
        company=company,
        email=email, # Use the provided email
        products=products,
        support_tier=support_tier
    )
    return new_record
# --- END Helper --- 

def agent_progress_callback(status_type: AgentStatusType, msg: str):
    """
    Callback using REGEX to parse FCS & Citations (from document=...) from TOOL_OUTPUT msg.
    """
    global last_rag_result
    logger = logging.getLogger("uvicorn.error")
    # Reduced preview length for general logging
    logger.info(f"Agent Progress: Type={status_type}, Msg Preview='{msg[:100]}...'") 

    fcs = None
    citations_list = []
    parsing_successful = False

    if status_type == AgentStatusType.TOOL_OUTPUT:
        # --- ADDED DETAILED LOGGING FOR RAW TOOL OUTPUT ---
        logger.info(f"<<< RAW TOOL_OUTPUT MSG START >>>\n{msg}\n<<< RAW TOOL_OUTPUT MSG END >>>")
        # --------------------------------------------------

        logger.info(f"Attempting REGEX parsing on TOOL_OUTPUT msg (len={len(msg)})") # Removed redundant preview

        try:
            # --- REGEX Definitions ---
            # Pattern to find fcs_score (Updated: removed quotes around key)
            fcs_pattern = r"fcs_score:\s*([0-9]+\.?[0-9]*)"
            # Pattern to find all document dictionary strings: document='{...}'
            doc_pattern = r"document='({.*?})'"
            # ---

            # Find FCS Score
            fcs_match = re.search(fcs_pattern, msg)
            if fcs_match:
                fcs_str = fcs_match.group(1)
                try:
                    fcs = float(fcs_str)
                    logger.info(f"REGEX extracted fcs_score: {fcs}")
                    parsing_successful = True
                except ValueError:
                    logger.error(f"Could not convert extracted FCS string '{fcs_str}' to float.")
            else:
                logger.warning("REGEX could not find fcs_score pattern in TOOL_OUTPUT msg.")

            # Find and Parse All Citations
            document_dict_strings = re.findall(doc_pattern, msg)
            if document_dict_strings:
                logger.info(f"REGEX found {len(document_dict_strings)} document dictionary strings.")
                temp_citations = []
                for i, dict_str in enumerate(document_dict_strings):
                    try:
                        # Use ast.literal_eval to safely parse the dictionary string
                        doc_data = ast.literal_eval(dict_str)
                        if isinstance(doc_data, dict):
                            # Format the citation
                            temp_citations.append({
                                "title": doc_data.get('title', f'Document {i+1}'), # Use index as fallback title
                                "snippet": doc_data.get('text') or doc_data.get('snippet'),
                                "url": doc_data.get('url')
                            })
                        else:
                            logger.error(f"Parsed document string #{i+1} is not a dict: {type(doc_data)}")
                    except (ValueError, SyntaxError, TypeError) as eval_err:
                        logger.error(f"Could not parse document string #{i+1} with literal_eval: {eval_err} | String: {dict_str[:200]}...", exc_info=True)
                
                if temp_citations: # Only assign if we successfully parsed at least one
                    citations_list = temp_citations
                    parsing_successful = True
                    logger.info(f"Successfully parsed {len(citations_list)} citations from document strings.")
            else:
                logger.warning("REGEX could not find any document='{...}' patterns in TOOL_OUTPUT msg.")

        except Exception as e:
            logger.error(f"Unexpected error during REGEX parsing in callback: {e}", exc_info=True)

        # Update global store based on regex parsing results
        if parsing_successful:
            last_rag_result["fcs_score"] = fcs
            last_rag_result["citations"] = citations_list
            logger.info(f"Callback updated last_rag_result (via REGEX v2): FCS={fcs}, Citations={len(citations_list)}")
        else:
            # Reset if regex failed completely to avoid stale data
            last_rag_result["fcs_score"] = None
            last_rag_result["citations"] = []
            logger.warning("REGEX parsing failed to find FCS or Citations; resetting global store.")

def create_app(agents: list, config: AgentConfig) -> FastAPI:
    """
    Create a FastAPI application with a chat endpoint.
    """
    app = FastAPI()
    origins = [
        "*"
        #"http://localhost",
        #"http://localhost:8080",
        #"http://127.0.0.1",
        #"http://127.0.0.1:8080",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    logger = logging.getLogger("uvicorn.error")
    logging.basicConfig(level=logging.INFO)
    endpoint_api_key = config.endpoint_api_key

    # Load SendGrid details from environment
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")

    if not SENDGRID_API_KEY or not SENDGRID_FROM_EMAIL:
        logger.warning("SENDGRID_API_KEY or SENDGRID_FROM_EMAIL environment variables not set. OTP sending will fail.")
        # Optionally raise an error here if OTP is critical
        # raise ValueError("SendGrid API Key and From Email must be set in environment variables.")

    @app.post("/otp/send", summary="Generate and send an OTP via email")
    async def send_otp(request: SendOtpRequest):
        if not SENDGRID_API_KEY or not SENDGRID_FROM_EMAIL:
             raise HTTPException(status_code=500, detail="Server configuration error: SendGrid not configured.")

        email = request.email
        # Basic email format check (can be more robust)
        if "@" not in email or "." not in email.split("@")[-1]:
             raise HTTPException(status_code=400, detail="Invalid email format provided.")

        try:
            # Generate OTP
            otp_code = "".join(random.choices(string.digits, k=6))
            expiry_time = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

            # Store OTP (overwrite if exists for the same email)
            otp_storage[email] = {"otp": otp_code, "expiry": expiry_time}
            logger.info(f"Generated OTP {otp_code} for {email}, expires at {expiry_time.isoformat()}")

            # Prepare email
            message = Mail(
                from_email=SENDGRID_FROM_EMAIL,
                to_emails=email,
                subject='Your EchoStor Support Verification Code',
                html_content=f'<strong>Your verification code is: {otp_code}</strong><br>This code will expire in {OTP_EXPIRY_MINUTES} minutes.'
            )

            # Send email
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message) 
            # Note: sendgrid library might not be inherently async, consider thread executor if blocking
            # Example using thread executor (requires `anyio` or similar):
            # from anyio import to_thread
            # response = await to_thread.run_sync(sg.client.mail.send.post, request_body=message.get())

            logger.info(f"SendGrid response status code: {response.status_code} for sending OTP to {email}")
            if 200 <= response.status_code < 300:
                 return {"message": "OTP sent successfully."}
            else:
                 logger.error(f"SendGrid error: {response.status_code} - {response.body}")
                 raise HTTPException(status_code=500, detail="Failed to send OTP email.")

        except Exception as e:
            logger.error(f"Error sending OTP to {email}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal server error during OTP sending.")

    @app.post("/otp/verify", summary="Verify an OTP code")
    async def verify_otp(request: VerifyOtpRequest):
        email = request.email
        submitted_otp = request.otp

        if not email or not submitted_otp:
             raise HTTPException(status_code=400, detail="Email and OTP code are required.")

        stored_data = otp_storage.get(email)

        if not stored_data:
            logger.warning(f"OTP verification attempt for unknown email: {email}")
            raise HTTPException(status_code=404, detail="OTP not found or already used for this email.")

        stored_otp = stored_data["otp"]
        expiry_time = stored_data["expiry"]
        is_valid = False
        error_detail = "Invalid OTP."

        # Always remove OTP after first verification attempt
        del otp_storage[email]
        logger.info(f"Removed OTP for {email} after verification attempt.")

        if datetime.now(timezone.utc) > expiry_time:
             logger.warning(f"OTP expired for {email}. Expiry: {expiry_time.isoformat()}")
             error_detail = "OTP has expired."
        elif submitted_otp == stored_otp:
             is_valid = True
             logger.info(f"OTP verified successfully for {email}")
        else:
             logger.warning(f"Invalid OTP entered for {email}.")
             # Keep error_detail as "Invalid OTP."

        if is_valid:
            return {"message": "OTP verified successfully."}
        else:
            raise HTTPException(status_code=400, detail=error_detail)


    def get_free_agent(session: str):
        free_agent = None

        # See if an existing agent has already been used for this session
        for i in range(5):
            agent_entry = agents[i]
            if agent_entry.get("session") == session:
                free_agent = agent_entry["agent"]
                logger.info(f"Using agent {i} which was already claimed for session {agent_entry['session']}")
                break

        # If we don't have an agent yet for this session see if there is a free one
        if not free_agent:
            for i in range(5):
                agent_entry = agents[i]
                if not agent_entry.get("session"):
                    agent_entry["session"] = session
                    free_agent = agent_entry["agent"]
                    logger.info(f"Reserving agent {i} for session {agent_entry['session']}")
                    break

        if not free_agent:
            logger.error("No free agents to handle this session")
            raise HTTPException(status_code=400, detail="No free agents to handle this session")

        return free_agent


    @app.get("/live-agent-lookup", summary="Return the name and ID of a live agent to chat with")
    async def live_agent_lookup(api_key: str = Depends(api_key_header), email: str = Depends(email_header),
                   session: str = Depends(session_header)):
        logger.info(f"Message from session: {session}")
        logger.info(f"Message from email: {email}")

        if api_key != endpoint_api_key:
            logger.warning("Unauthorized access attempt")
            raise HTTPException(status_code=403, detail="Unauthorized")

        free_agent = get_free_agent(session)

        if not email:
            return {
                "code": 404,
                "name": "",
                "id": "",
                "channel": "",
                "message": "You mush authenticate before chatting with a live agent."
            }

        response_object = free_agent.chat(f"live agent chat lookup {email}")
        response_text = str(response_object.response)

        print("response text is: " + response_text)

        live_agent_name = "Tony" if "tony" in response_text.lower() else (
            "Amr" if "amr" in response_text.lower() else (
                "Joe" if "joe" in response_text.lower() else (
                    "Eva" if "eva" in response_text.lower() else (
                        "your dedicated support agent"
                    )
                )
            )
        )

        # TODO this would need to change to match the zoom chat user ID format
        agent_id_pattern = r"[a-zA-Z]{4}\d{4}"
        live_agent_match = re.search(agent_id_pattern, response_text)
        live_agent_id = live_agent_match.group() if live_agent_match else ""

        if not live_agent_name and not live_agent_match:
            return {
                "code": 404,
                "name": "",
                "id": "",
                "channel": "",
                "message": f"Could not determine the support queue and live agent details: {response_text}"
            }

        print(f"live_agent_id is {live_agent_id}")

        # TODO this would need to change to match the zoom channel ID format
        #channel_pattern = r"[^a-zA-Z][a-zA-Z]+-channel-\d+"
        channel_pattern = r"[a-zA-Z0-9]{32}" #r"[a-zA-Z0-9]{32}@conference.xmpp.zoom.us"
        channel_match = re.search(channel_pattern, response_text)
        #print(f"channel_match is: {channel_match}")
        live_agent_channel = channel_match.group().strip() if channel_match else ""

        print(f"live_agent_channel is {live_agent_channel}")

        return {
            "code": 200,
            "name": live_agent_name,
            "id": live_agent_id,
            "channel": live_agent_channel,
            "message": response_text
        }


    @app.post("/chat", summary="Chat with the agent")
    async def chat(request: ChatRequest, api_key: str = Depends(api_key_header), email: str = Depends(email_header),
                   session: str = Depends(session_header)):
        message = request.query  # Extract message from the JSON body
        logger.info(f"Received message: {message}")
        logger.info(f"Message from session: {session}")
        logger.info(f"Message from email: {email}") # Note: This is the email from the OTP step, not necessarily the one in the message

        if api_key != endpoint_api_key:
            logger.warning("Unauthorized access attempt")
            raise HTTPException(status_code=403, detail="Unauthorized")

        if not message:
            logger.error("No message provided in the request")
            raise HTTPException(status_code=400, detail="No message provided")

        # Proceed with finding/assigning an agent
        free_agent = get_free_agent(session)

        # --- Default Agent Processing (if not handled above) ---
        try:
            # Reset global result store BEFORE each call
            global last_rag_result
            last_rag_result = {"fcs_score": None, "citations": []}
            logger.info("Reset last_rag_result before agent call.")

            # Call agent.chat
            response_object = free_agent.chat(message)

            logger.info(f"Agent chat completed. Raw response text: {response_object.response}")
            logger.info(f"Raw full response object: {response_object}")

            # Retrieve results from the global variable (updated by callback during THIS call)
            retrieved_fcs = last_rag_result.get("fcs_score")
            retrieved_citations = last_rag_result.get("citations", [])
            logger.info(f"Retrieved from global store: FCS={retrieved_fcs}, Citations={len(retrieved_citations)}")

            response_text = str(response_object.response) # Get the initial text

            # Add Redirection Logic for Off-Topic/Unknown Answers
            off_topic_keywords = [
                "i don't have the information",
                "i don't have enough information",
                "i cannot answer questions about",
                "i couldn't find information about",
                "looking for about", # From pizza example
            ]
            # Check if the lowercase response contains any of the keywords
            is_off_topic_or_unknown = any(keyword in response_text.lower() for keyword in off_topic_keywords)

            if is_off_topic_or_unknown:
                redirection_suffix = ". If you have a question about EchoStor products or services, please feel free to ask."
                # Append only if it's not already there
                if not response_text.endswith(redirection_suffix):
                    response_text += redirection_suffix
                    logger.info("Appended redirection suffix to off-topic/unknown response.")
            # End Redirection Logic

            # Construct the final JSON response using potentially modified response_text
            final_response = {
                "response_text": response_text,
                "fcs_score": retrieved_fcs,
                "citations": retrieved_citations
            }
            logger.info(f"Returning final structured response: {final_response}")
            return final_response

        except Exception as e:
            logger.error(f"Error during agent processing: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal server error") from e

    return app


def start_app(agents: list, host='0.0.0.0', port=8001):
    """
    Start the FastAPI server.

    Args:
        host (str, optional): The host address for the API. Defaults to '127.0.0.1'.
        port (int, optional): The port for the API. Defaults to 8001.
    """
    app = create_app(agents, config=AgentConfig())
    uvicorn.run(app, host=host, port=port)


######## Agent tools ########


# Initialize the vectara tool factory
vec_factory = VectaraToolFactory(
    vectara_api_key=os.environ['VECTARA_API_KEY'],
    vectara_corpus_key=os.environ['VECTARA_CORPUS_KEY']
)


def doc_permitted_filter(user_id: str):
    """
    Returns a string representing the access control filter(s) to be appended to the user's query.
    """
    return f""


######## Tool to query against all EchoStor contents
class QueryEchostorContentArgs(BaseModel):
    query: str

query_echostor_content = vec_factory.create_rag_tool(
    tool_name="query_echostor_content",
    tool_description="Query all of the content related to EchoStor",
    tool_args_schema=QueryEchostorContentArgs,
    reranker="multilingual_reranker_v1", rerank_k=100,
    n_sentences_before=2, n_sentences_after=2, lambda_val=0.005,
    summary_num_results=10,
    vectara_summarizer='vectara-summary-table-md-query-ext-jan-2025-gpt-4o',
    include_citations=True,
    verbose=True,
    #fixed_filter=f"{doc_permitted_filter(get_guid_for_user())}"
)


######## Tools to do account management
# --- NEW: Tool to Update Account Field --- 
def update_account_field_tool_impl(
        email: str,
        field: str,
        value: str
) -> str:
    """
    Updates a specific field (name, company, or support_tier) for a user account identified by their email.
    This tool should ONLY be called AFTER the user's intent to update a specific field is clear and they have provided the NEW value.
    Args:
        email (str): The email address of the user whose account needs updating.
        field (str): The specific field to update (e.g., 'name', 'company', 'support_tier'). Case sensitive.
        value (str): The new value for the specified field.
    Returns:
        A message indicating the result of the account field update.
    """

    """Dummy implementation to update a field in the in-memory account store."""
    logger = logging.getLogger("uvicorn.error")

    logger.info(f"Attempting to update field '{field}' for user '{email}' to '{value}'")

    # Validate field
    valid_fields = ['name', 'company', 'support_tier'] # Only allow updating these for now
    if field not in valid_fields:
        logger.error(f"Update failed: Invalid field '{field}' requested for update.")
        return f"Error: Cannot update the field '{field}'. Only {', '.join(valid_fields)} can be updated."

    # Find user
    user_record = account_data_store.get(email)
    if not user_record:
        logger.error(f"Update failed: User '{email}' not found in data store.")
        return f"Error: Could not find account for email {email}."

    # Update the field
    try:
        old_value = getattr(user_record, field)
        setattr(user_record, field, value)
        logger.info(f"Successfully updated field '{field}' for user '{email}' from '{old_value}' to '{value}'.")
        # Persist change (already done by modifying the object in the dict)
        return f"Successfully updated field '{field}' for user '{email}' from '{old_value}' to '{value}'."
    except AttributeError:
        # Should not happen due to valid_fields check, but as a safeguard
        logger.error(f"Update failed: Attribute '{field}' does not exist on UserRecord.")
        return f"Error: Internal error trying to update field '{field}'."
    except Exception as e:
        logger.error(f"Update failed: Unexpected error updating field '{field}' for '{email}': {e}", exc_info=True)
        return f"Error: An unexpected error occurred while trying to update the {field}."
# --- END Update Tool ---

# --- NEW: Tool to Lookup Account Info ---
def lookup_account_field_tool_impl(
        email: str,
        field: str
) -> str:
    """
    Looks up the specified field from a user account for a user account identified by their email.
    The specified field must be one of the following fields (name, company, or support_tier).
    Args:
        email (str): The email address of the user whose account needs updating.
        field (str): The specific field to look up (e.g., 'name', 'company', 'support_tier'). Case sensitive.
    Returns:
        A message indicating the result of the account field lookup request.
    """

    logger = logging.getLogger("uvicorn.error")

    logger.info(f"Attempting to look up field '{field}' for user '{email}'")

    # Validate field
    valid_fields = ['name', 'company', 'support_tier'] # Only allow looking up these for now
    if field not in valid_fields:
        logger.error(f"Lookup failed: Invalid field '{field}' requested.")
        return f"Error: Cannot look up the field '{field}'. Only {', '.join(valid_fields)} can be looked up."

    # Find user
    user_record = account_data_store.get(email)
    if not user_record:
        logger.error(f"Lookup failed: User '{email}' not found in data store.")
        return f"Error: Could not find account for email {email}."

    # Look up the field
    try:
        old_value = getattr(user_record, field)
        logger.info(f"Successfully looked up field '{field}' for user '{email}'; it is '{old_value}'.")
        return f"The value of the '{field}' field for user '{email}' is '{old_value}'."
    except AttributeError:
        # Should not happen due to valid_fields check, but as a safeguard
        logger.error(f"Lookup failed: Attribute '{field}' does not exist on UserRecord.")
        return f"Error: Internal error trying to look up field '{field}'."
    except Exception as e:
        logger.error(f"Update failed: Unexpected error looking up field '{field}' for '{email}': {e}", exc_info=True)
        return f"Error: An unexpected error occurred while trying to look up the {field}."
# --- END Account Info Lookup Tool ---


######## Tools to look up the correct live agent chat info
def find_support_agent(email: str, support_topic: str) -> dict[str]:
    """
    Returns the name and ID of a live support agent who can discuss the support topic specified.
    Args:
        email (str): The email address of the user.
        support_topic (str): The support topic of interest, which must be one of the following: 'vmware', 'mainframe', 'carbonblack', 'account'.
    Returns:
        A dictionary where the 'name' item is the name of the chosen live agent,
        the 'id' is the id of the chosen live agent, and the 'channel' is the channel ID to use.
    """
    print(f"Choosing support agent for user {email} for topic {support_topic}")

    if support_topic.lower() in SUPPORT_QUEUES:
        return LIVE_AGENTS.get(support_topic.lower())
    else:
        return f"Topic should be one of {SUPPORT_QUEUES}. Please try again with a valid support topic."

# --- END Live Agent Chat Lookup Tools ---


######## Tools for Jira integration
def list_issues(
        project_key: str,
        max_results: int = 50
) -> dict:
    """
    List issues in a given project.

    Args:
        project_key (str): Key of the project in Jira.
        max_results (int, optional): Maximum number of issues to return. Defaults to 50.

    Returns:
        dict: Parsed JSON response containing the matching issues.

    Raises:
        requests.HTTPError: If the HTTP request fails.
    """
    url = f"{JIRA_BASE_URL}/rest/api/3/search"
    params = {
        "jql": f"project={project_key}",
        "maxResults": max_results
    }
    resp = _jira_session.get(url, params=params)
    resp.raise_for_status()
    return resp.json()


def create_issue(
        project_key: str,
        summary: str,
        description: str,
        priority: str = "Medium"
) -> dict:
    """
    Create a new issue in a Jira project.

    Args:
        project_key (str): Key of the target project.
        summary (str): Brief summary/title of the issue.
        description (str): Detailed description of the issue.
        priority (str, optional): Priority of the issue (e.g., 'Highest', 'High', 'Medium', 'Low', 'Lowest'). Defaults to "Medium".

    Returns:
        dict: Parsed JSON response containing details of the newly created issue.

    Raises:
        ValueError: If issue_type is not in valid_issue_types.
        requests.HTTPError: If the HTTP request fails.
    """
    url = f"{JIRA_BASE_URL}/rest/api/3/issue"

    # Convert plain text description to Atlassian Document Format
    description_adf = {
        "type": "doc",
        "version": 1,
        "content": [
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": description
                    }
                ]
            }
        ]
    }

    payload = {
        "fields": {
            "project": {"key": project_key},
            "summary": summary,
            "description": description_adf,
            "priority": {"name": priority},
            "issuetype": {"name": "Task"},
        }
    }
    resp = _jira_session.post(url, json=payload)
    resp.raise_for_status()
    return resp.json()


def update_issue(
        issue_id: str,
        fields: dict
) -> dict:  # Keep the return type hint as dict for consistency with the tool framework
    """
    Update fields of an existing Jira issue.

    Args:
        issue_id (str): ID or key of the issue to update.
        fields (dict): Mapping of Jira field names to their new values.
                       Example: {"priority": {"name": "High"}, "summary": "New Summary"}
                       For description, provide plain text; it will be converted to ADF.

    Returns:
        dict: A dictionary indicating success or containing error details if JSON is returned unexpectedly.

    Raises:
        requests.HTTPError: If the HTTP request fails with a 4xx or 5xx error.
    """
    url = f"{JIRA_BASE_URL}/rest/api/3/issue/{issue_id}"

    # Convert description to ADF format if present in the fields
    if "description" in fields and isinstance(fields["description"], str):
        fields["description"] = {
            "type": "doc",
            "version": 1,
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": fields["description"]
                        }
                    ]
                }
            ]
        }

    payload = {"fields": fields}
    resp = _jira_session.put(url, json=payload)

    # Raise exception ONLY for actual client/server errors (4xx, 5xx)
    resp.raise_for_status()

    # Check for the successful 'No Content' response BEFORE trying .json()
    if resp.status_code == 204:
        # Return a simple dictionary indicating success, as no body was returned
        return {"status": "success", "message": f"Issue {issue_id} updated successfully."}
    else:
        # If the status code is something else successful (like 200 OK, though unlikely for PUT update)
        # or potentially an error response that didn't raise_for_status (unusual), try parsing JSON.
        try:
            # Attempt to parse JSON only if status code wasn't 204
            return resp.json()
        except requests.exceptions.JSONDecodeError:
            # Handle the edge case where the response wasn't 204 but still had no valid JSON
            return {
                "status": "warning",
                "message": f"Request successful (status {resp.status_code}) but no JSON body returned.",
                "status_code": resp.status_code
            }


def delete_issue(issue_id: str) -> bool:
    """
    Delete a Jira issue by its ID or key.

    Args:
        issue_id (str): ID or key of the issue to delete.

    Returns:
        bool: True if deletion succeeded (HTTP 204), False otherwise.

    Raises:
        requests.HTTPError: If the HTTP request fails.
    """
    url = f"{JIRA_BASE_URL}/rest/api/3/issue/{issue_id}"
    resp = _jira_session.delete(url)
    resp.raise_for_status()
    return resp.status_code == 204


# The list of all tools available to the agent
def create_assistant_tools():
    tools_factory = ToolsFactory()
    return (
        [tools_factory.create_tool(tool) for tool in
         [
             find_support_agent,
             update_account_field_tool_impl,
             lookup_account_field_tool_impl,
             create_issue,
             update_issue,
             delete_issue,
             list_issues
         ]
         ] + [query_echostor_content]
    )


# Function to execute a single query. This gives the agent instructions for how to call the different tools.
def main():
    topic_of_expertise = "Information about EchoStor products, services, and support, including basic account management."

    live_agent_chat_lookup_instructions = f"""
        If the user's input is 'live agent chat lookup' followed by an email address then use the 'find_support_agent' tool.
        For the support_topic argument, choose one of the following topics that best summarizes the most recent topics discussed in this conversation: vmware, mainframe, carbonblack, account
        Do not call the 'find_support_agent' tool unless the user's input is 'live agent chat lookup'.
        Always include the name, id, topic, and channel in your response to the user.
    """

    agent_instructions = f"""
        You are a knowledgeable, professional AI assistant trained to answer questions related to EchoStor products, such as Mainframe Operational Intelligence, Advanced Authentication Mainframe, VMware vSphere, and Carbon Black App Control Agent. 
        You are also able to answer questions related to EchoStor Services and Support.
        You have access to a ticketing system, and can answer questions about issue with the Jira project key named 'BROAD'.
        You can also assist verified users via the 'update_account_field_tool' tool with updating some of their account details (name, company, support tier).
        You can also assist verified users via the 'lookup_account_field_tool' tool with looking up  of their account details (name, company, support tier).
        You use trusted content retrieved through the 'query_echostor_content' tool, which includes citations, URLs, factual consistency scores (fcs_score), and article metadata.
        If asked a question that is not related to EchoStor products, services, support docs, or licensing, then tell the user that you are not able to answer that question but you can help them with EchoStor products, support, documentation, and basic account management.
        If the question is in Japanese, then translate the question to English before answering it. Always answer the question in English, in a polite and professional manner. 
        Do not engage in any conversation with the user that involves hate speech, racism, sexism, or any other form of discrimination.
        Your response should always be in Markdown format.
        {live_agent_chat_lookup_instructions}
        ***IMPORTANT: You MUST always formulate your final response in English, regardless of the language of the user's query or any source documents retrieved.***
    """

    # --- END Instruction Update --- 

    # --- Agent Creation Loop --- 
    tools = create_assistant_tools() # Call the updated function
    agents = []
    print(f"Creating {NUM_AGENTS} agents...")
    for i in range(NUM_AGENTS): # Use index for potential future per-agent storage
        agent = Agent(
            tools=tools, # Pass the updated tools list
            topic=topic_of_expertise,
            custom_instructions=agent_instructions, # Pass the updated instructions
            verbose=True,
            agent_progress_callback=agent_progress_callback
        )
        agents.append({
            "agent": agent,
            "session": None
            })

    agents[0]["agent"].report()

    print("Agents created.")
    
    # Apply nest_asyncio for running FastAPI within environments like Jupyter/Colab
    nest_asyncio.apply()
    
    # Start the FastAPI application
    start_app(agents, port=8001) # Change to port 8001

if __name__ == "__main__":
    main()
