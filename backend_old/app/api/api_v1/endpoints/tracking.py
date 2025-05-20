from typing import Dict, Any, List, Optional
import time
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user, get_current_active_superuser
from app.services.correios_service import correios_service
from app.models.user import User
from app.models.setting import Setting
from app.models.tracking_history import TrackingHistory
from app.schemas.tracking import TrackingRequest, TrackingResponse, MultiTrackingRequest, ApiStatus, TrackingHistoryResponse

router = APIRouter()


@router.get("/{tracking_code}", response_model=TrackingResponse)
def track_package(
    tracking_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Track a package by its tracking code
    """
    try:
        # Track the package
        result = correios_service.track_package(tracking_code)

        # Record tracking history
        status = "Sem eventos"
        if result.get("eventos") and result["eventos"]:
            status = result["eventos"][0]["status"]

        TrackingHistory.add_history(
            db=db,
            tracking_code=tracking_code,
            status=status,
            success=True,
            user_id=current_user.id,
            details=None
        )

        return result
    except Exception as e:
        # Record failed tracking attempt
        try:
            TrackingHistory.add_history(
                db=db,
                tracking_code=tracking_code,
                status="Erro: " + str(e),
                success=False,
                user_id=current_user.id,
                details=str(e)
            )
        except:
            # If recording history fails, just log it
            pass

        raise HTTPException(status_code=500, detail=f"Error tracking package: {str(e)}")


@router.post("/batch", response_model=Dict[str, TrackingResponse])
def track_multiple_packages(
    request: MultiTrackingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Track multiple packages at once
    """
    try:
        # Track multiple packages
        results = correios_service.track_multiple_packages(request.tracking_codes)

        # Record tracking history for each package
        for tracking_code, result in results.items():
            try:
                status = "Sem eventos"
                if result.get("eventos") and result["eventos"]:
                    status = result["eventos"][0]["status"]

                TrackingHistory.add_history(
                    db=db,
                    tracking_code=tracking_code,
                    status=status,
                    success=True,
                    user_id=current_user.id,
                    details=None
                )
            except:
                # If recording history fails, just continue
                pass

        return results
    except Exception as e:
        # Record failed tracking attempt for each code
        for tracking_code in request.tracking_codes:
            try:
                TrackingHistory.add_history(
                    db=db,
                    tracking_code=tracking_code,
                    status="Erro: " + str(e),
                    success=False,
                    user_id=current_user.id,
                    details=str(e)
                )
            except:
                # If recording history fails, just continue
                pass

        raise HTTPException(status_code=500, detail=f"Error tracking packages: {str(e)}")


@router.get("/check-critical", response_model=List[TrackingResponse])
def check_critical_packages(
    tracking_codes: List[str] = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Check if any of the provided tracking codes have critical status
    """
    try:
        results = correios_service.track_multiple_packages(tracking_codes)

        # Filter only critical packages
        critical_packages = []
        for code, info in results.items():
            if info.get("eventos") and info["eventos"]:
                latest_status = info["eventos"][0]["status"]
                if correios_service.is_status_critical(latest_status):
                    critical_packages.append(info)

        return critical_packages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking critical packages: {str(e)}")


@router.get("/status", response_model=ApiStatus)
def check_api_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Check the status of the Correios API
    """
    try:
        # Record start time
        start_time = time.time()

        # Check if we're using mock data
        use_mock = Setting.get_setting(db, "correios_use_mock", "false").lower() == "true"

        if use_mock:
            # If using mock data, API is always "online"
            return {
                "status": "online",
                "message": "Using mock data",
                "timestamp": datetime.now(),
                "response_time": 0
            }

        # Try to make a test request to the Correios API
        # Use a known tracking code for testing
        test_code = "AA123456789BR"
        correios_service.track_package(test_code)

        # Calculate response time
        response_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds

        return {
            "status": "online",
            "message": "API is responding normally",
            "timestamp": datetime.now(),
            "response_time": response_time
        }
    except Exception as e:
        # If there's an error, API is offline
        return {
            "status": "offline",
            "message": str(e),
            "timestamp": datetime.now(),
            "response_time": None
        }


@router.get("/history", response_model=TrackingHistoryResponse)
def get_tracking_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get tracking history for the current user
    """
    try:
        # Get history from database
        history = TrackingHistory.get_history(db, limit=limit, user_id=current_user.id)

        return {
            "items": history,
            "total": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting tracking history: {str(e)}")


@router.delete("/history", response_model=dict)
def clear_tracking_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Clear tracking history for the current user
    """
    try:
        # Clear history from database
        count = TrackingHistory.clear_history(db, user_id=current_user.id)

        return {
            "message": f"Deleted {count} tracking history entries",
            "count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing tracking history: {str(e)}")
