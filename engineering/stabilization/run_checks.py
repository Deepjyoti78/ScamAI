"""Offline software regression runner. Clears credentials; blocks fits and network."""
import os
from pathlib import Path
import socket
import sys
from unittest.mock import patch

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
for name in ("TAVILY_API_KEY", "BRAVE_SEARCH_API_KEY"):
    os.environ.pop(name, None)
try:
    import dotenv
    dotenv.load_dotenv = lambda *a, **k: False
except ImportError:
    pass
import pytest

def forbidden(*args, **kwargs):
    raise AssertionError("Unmocked external transport or model fitting is forbidden in software checks")

# The Windows event loop creates an internal socketpair; public traffic must be mocked.
original_connect = socket.socket.connect
def guarded_connect(sock, address):
    if isinstance(address, tuple) and address[0] in ("127.0.0.1", "::1"):
        return original_connect(sock, address)
    return forbidden()

with patch("socket.create_connection", forbidden), patch("socket.getaddrinfo", forbidden), \
     patch.object(socket.socket, "connect", guarded_connect), \
     patch("sklearn.linear_model.LogisticRegression.fit", forbidden), \
     patch("sklearn.feature_extraction.text.TfidfVectorizer.fit", forbidden), \
     patch("sklearn.feature_extraction.text.TfidfVectorizer.fit_transform", forbidden):
    raise SystemExit(pytest.main(sys.argv[1:]))
