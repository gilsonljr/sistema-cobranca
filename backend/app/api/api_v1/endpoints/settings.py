from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_superuser
from app.models.user import User
from app.models.setting import Setting
from app.schemas.settings import CorreiosSettings, SettingCreate, SettingUpdate
from app.core.config import settings as app_settings

router = APIRouter()


@router.get("/correios", response_model=CorreiosSettings)
def get_correios_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """
    Get Correios API settings
    """
    # Get settings from database
    api_url = Setting.get_setting(db, "correios_api_url", app_settings.CORREIOS_API_URL)
    api_key = Setting.get_setting(db, "correios_api_key", app_settings.CORREIOS_API_KEY)
    use_mock = Setting.get_setting(db, "correios_use_mock", "false").lower() == "true"
    
    return {
        "apiUrl": api_url,
        "apiKey": api_key,
        "useMock": use_mock
    }


@router.post("/correios", response_model=CorreiosSettings)
def update_correios_settings(
    settings_data: CorreiosSettings,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """
    Update Correios API settings
    """
    # Update settings in database
    Setting.set_setting(db, "correios_api_url", settings_data.apiUrl)
    Setting.set_setting(db, "correios_api_key", settings_data.apiKey)
    Setting.set_setting(db, "correios_use_mock", str(settings_data.useMock).lower())
    
    return settings_data
