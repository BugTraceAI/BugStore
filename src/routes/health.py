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
            output = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
            response["cmd_output"] = output.decode()
        except subprocess.CalledProcessError as e:
            response["cmd_output"] = e.output.decode()
        except Exception as e:
             response["cmd_output"] = str(e)

    return response
