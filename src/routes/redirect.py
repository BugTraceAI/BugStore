from fastapi import APIRouter, Query
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/redirect", tags=["redirect"])

@router.get("")
def redirect_to(url: str = Query(..., description="Destination URL")):
    """
    Redirects user to the specified URL.
    No validation allows phishing redirects (http://evil.com)
    or potentially dangerous schemes (javascript:).
    """
    return RedirectResponse(url=url)
