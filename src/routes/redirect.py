from fastapi import APIRouter, Query
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/redirect", tags=["redirect"])

@router.get("")
def redirect_to(url: str = Query(..., description="Destination URL")):
    """
    Redirects user to the specified URL.
    V-005, V-006: Open Redirect vulnerability.
    No validation allows phishing redirects (http://evil.com) 
    or potentially dangerous schemes (javascript:).
    """
    # V-005: Unvalidated Redirect
    return RedirectResponse(url=url)
