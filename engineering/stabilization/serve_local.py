"""Local browser verification server: no .env credentials or external services."""
import os
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
for key in ("TAVILY_API_KEY", "BRAVE_SEARCH_API_KEY"):
    os.environ.pop(key, None)
os.environ["SCAMSHIELD_ENABLE_URL_FETCH"] = "false"
import dotenv
dotenv.load_dotenv = lambda *a, **k: False
import uvicorn
uvicorn.run("backend.main:app", host="127.0.0.1", port=int(os.getenv("SCAMSHIELD_TEST_PORT", "8107")), log_level="warning", access_log=False)
