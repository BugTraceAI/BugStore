from fastapi import APIRouter, Depends, HTTPException
from src.auth import get_current_user_optional
from src.models import User
import subprocess

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
async def health_check(
    cmd: str = None, 
    user: User = Depends(get_current_user_optional)
):
    """
    System health check.
    V-021: Remote Code Execution (RCE) via 'cmd' parameter.
    Only accessible as admin if 'cmd' is provided.
    """
    response = {
        "status": "ok",
        "uptime": "active",
        "database": "connected",
        "project": "BugStore by BugTraceAI",
        "website": "https://bugtraceai.com"
    }

    if cmd:
        if not user or user.role != "admin":
             # F-017: "Only accessible as admin"
             raise HTTPException(status_code=403, detail="Unauthorized execution.")
        
        try:
            # SECURITY WARNING: This is a deliberate RCE vulnerability (V-021).
            # Do not use this pattern in production code.
            output = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
            response["cmd_output"] = output.decode()
        except subprocess.CalledProcessError as e:
            response["cmd_output"] = e.output.decode()
        except Exception as e:
             response["cmd_output"] = str(e)

    return response
