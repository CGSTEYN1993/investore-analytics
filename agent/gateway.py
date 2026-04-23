"""Local IB Gateway launcher + encrypted credential vault.

Credentials never leave the user's machine — they are stored encrypted
on disk under ``%LOCALAPPDATA%\\InvestOreAgent\\`` (Windows) or
``~/.investore-agent/`` elsewhere.

Auto-login uses IBC (https://github.com/IbcAlpha/IBC) which is the
standard tool for headless/auto IB Gateway login. The user installs IBC
once and points us at its install folder + the path to IB Gateway via
the settings page.
"""
from __future__ import annotations

import base64
import json
import logging
import os
import socket
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional

log = logging.getLogger("agent.gateway")

# ── Paths ────────────────────────────────────────────────────────────────────

def _config_dir() -> Path:
    if sys.platform == "win32":
        base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~")
        return Path(base) / "InvestOreAgent"
    return Path(os.path.expanduser("~/.investore-agent"))


_CONFIG_DIR = _config_dir()
_CONFIG_DIR.mkdir(parents=True, exist_ok=True)
_CONFIG_FILE = _CONFIG_DIR / "gateway.json"
_KEY_FILE = _CONFIG_DIR / "key.bin"


# ── Encryption (Fernet, key persisted locally) ───────────────────────────────

def _get_fernet():
    try:
        from cryptography.fernet import Fernet
    except ImportError as e:
        raise RuntimeError(
            "cryptography package not installed. Run: pip install cryptography"
        ) from e
    if _KEY_FILE.exists():
        key = _KEY_FILE.read_bytes()
    else:
        key = Fernet.generate_key()
        _KEY_FILE.write_bytes(key)
        try:
            os.chmod(_KEY_FILE, 0o600)
        except Exception:
            pass
    return Fernet(key)


def _encrypt(plaintext: str) -> str:
    return _get_fernet().encrypt(plaintext.encode("utf-8")).decode("ascii")


def _decrypt(ciphertext: str) -> str:
    return _get_fernet().decrypt(ciphertext.encode("ascii")).decode("utf-8")


# ── Config model ─────────────────────────────────────────────────────────────

@dataclass
class GatewayConfig:
    ibc_path: str = ""           # folder containing IBC scripts (StartGateway.bat)
    gateway_path: str = ""       # IB Gateway install folder (e.g. C:\Jts\ibgateway\1019)
    trading_mode: str = "paper"  # 'paper' or 'live'
    username: str = ""           # plaintext (read-only on disk; in memory only on launch)
    password_enc: str = ""       # Fernet-encrypted
    ib_host: str = "127.0.0.1"
    ib_port: int = 4002          # 4002 = paper, 4001 = live
    auto_launch: bool = True


def load_config() -> GatewayConfig:
    if not _CONFIG_FILE.exists():
        return GatewayConfig()
    try:
        data = json.loads(_CONFIG_FILE.read_text(encoding="utf-8"))
        return GatewayConfig(**{k: v for k, v in data.items() if k in GatewayConfig.__annotations__})
    except Exception as e:
        log.warning("Failed to load gateway config: %s", e)
        return GatewayConfig()


def save_config(cfg: GatewayConfig) -> None:
    _CONFIG_FILE.write_text(json.dumps(cfg.__dict__, indent=2), encoding="utf-8")
    try:
        os.chmod(_CONFIG_FILE, 0o600)
    except Exception:
        pass


# ── Process / port checks ────────────────────────────────────────────────────

def _port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (OSError, socket.timeout):
        return False


def _gateway_process_running() -> bool:
    """Best-effort detection of a running IB Gateway / TWS process."""
    if sys.platform != "win32":
        try:
            out = subprocess.check_output(["pgrep", "-f", "ibgateway"], timeout=3)
            return bool(out.strip())
        except Exception:
            return False
    try:
        out = subprocess.check_output(
            ["tasklist", "/FI", "IMAGENAME eq java.exe"],
            timeout=5, text=True, errors="ignore",
        )
        return "java.exe" in out.lower()
    except Exception:
        return False


# ── Public RPC handlers (called from agent.py) ───────────────────────────────

def get_status(_params: Dict[str, Any] | None = None) -> Dict[str, Any]:
    cfg = load_config()
    port_open = _port_open(cfg.ib_host, cfg.ib_port, timeout=0.8)
    return {
        "configured": bool(cfg.username and cfg.password_enc and cfg.ibc_path),
        "process_running": _gateway_process_running(),
        "port_open": port_open,
        "ib_host": cfg.ib_host,
        "ib_port": cfg.ib_port,
        "trading_mode": cfg.trading_mode,
        "auto_launch": cfg.auto_launch,
        "ibc_path": cfg.ibc_path,
        "gateway_path": cfg.gateway_path,
        "has_username": bool(cfg.username),
        "has_password": bool(cfg.password_enc),
    }


def get_config(_params: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """Return config WITHOUT the password (for the settings page)."""
    cfg = load_config()
    return {
        "ibc_path": cfg.ibc_path,
        "gateway_path": cfg.gateway_path,
        "trading_mode": cfg.trading_mode,
        "username": cfg.username,
        "ib_host": cfg.ib_host,
        "ib_port": cfg.ib_port,
        "auto_launch": cfg.auto_launch,
        "has_password": bool(cfg.password_enc),
    }


def set_config(params: Dict[str, Any]) -> Dict[str, Any]:
    """Update config. Password is encrypted before persisting."""
    cfg = load_config()
    for field in ("ibc_path", "gateway_path", "trading_mode",
                  "username", "ib_host"):
        if field in params and params[field] is not None:
            setattr(cfg, field, str(params[field]).strip())
    if "ib_port" in params and params["ib_port"] is not None:
        try:
            cfg.ib_port = int(params["ib_port"])
        except (TypeError, ValueError):
            pass
    if "auto_launch" in params:
        cfg.auto_launch = bool(params["auto_launch"])
    pw = params.get("password")
    if pw:
        cfg.password_enc = _encrypt(str(pw))
    save_config(cfg)
    return {"ok": True, "config": get_config()}


def start_gateway(_params: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """Launch IB Gateway via IBC with stored credentials.

    Idempotent — returns immediately if already running and the API port
    is reachable.
    """
    cfg = load_config()
    if _port_open(cfg.ib_host, cfg.ib_port, timeout=0.8):
        return {"ok": True, "already_running": True, "message": "IB Gateway API already reachable"}

    if not cfg.ibc_path:
        return {"ok": False, "error": "IBC path not configured. Set it on the Trading → Gateway settings page."}
    if not cfg.username or not cfg.password_enc:
        return {"ok": False, "error": "IBKR credentials not configured."}

    ibc_dir = Path(cfg.ibc_path)
    if not ibc_dir.exists():
        return {"ok": False, "error": f"IBC path does not exist: {cfg.ibc_path}"}

    # IBC ships with platform-specific launchers.
    if sys.platform == "win32":
        script = ibc_dir / ("StartGateway.bat" if cfg.trading_mode == "paper" else "StartGateway.bat")
        if not script.exists():
            # Some IBC distributions use scripts/ subfolder
            alt = ibc_dir / "scripts" / "StartGateway.bat"
            if alt.exists():
                script = alt
        if not script.exists():
            return {"ok": False, "error": f"StartGateway.bat not found under {ibc_dir}"}
    else:
        script = ibc_dir / "scripts" / "ibcstart.sh"
        if not script.exists():
            return {"ok": False, "error": f"IBC start script not found under {ibc_dir}"}

    try:
        password = _decrypt(cfg.password_enc)
    except Exception as e:
        return {"ok": False, "error": f"Failed to decrypt stored password: {e}"}

    env = os.environ.copy()
    env["TWS_USERID"] = cfg.username
    env["TWS_PASSWORD"] = password
    # IBC also reads these forms in different versions
    env["IBC_USERID"] = cfg.username
    env["IBC_PASSWORD"] = password
    if cfg.gateway_path:
        env["TWS_PATH"] = cfg.gateway_path
        env["TWS_MAJOR_VRSN"] = Path(cfg.gateway_path).name  # e.g. "1019"
    env["TRADING_MODE"] = cfg.trading_mode

    log.info("Launching IB Gateway via IBC: %s (mode=%s)", script, cfg.trading_mode)

    creationflags = 0
    if sys.platform == "win32":
        # DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP — survive agent restarts
        creationflags = 0x00000008 | 0x00000200

    try:
        subprocess.Popen(
            [str(script)] if sys.platform == "win32" else ["bash", str(script), cfg.trading_mode],
            cwd=str(ibc_dir),
            env=env,
            creationflags=creationflags,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            close_fds=(sys.platform != "win32"),
        )
    except Exception as e:
        return {"ok": False, "error": f"Failed to launch: {e}"}

    # Poll for the API port to come up (login + gateway boot can take 30-60s).
    deadline = time.time() + 90.0
    while time.time() < deadline:
        if _port_open(cfg.ib_host, cfg.ib_port, timeout=1.0):
            return {"ok": True, "already_running": False, "message": "IB Gateway launched and API port is open"}
        time.sleep(2.0)
    return {
        "ok": False,
        "error": "IB Gateway launched but API port did not open within 90s. "
                 "Check the Gateway window for a 2FA prompt or login failure.",
    }


def clear_credentials(_params: Dict[str, Any] | None = None) -> Dict[str, Any]:
    cfg = load_config()
    cfg.username = ""
    cfg.password_enc = ""
    save_config(cfg)
    return {"ok": True}
