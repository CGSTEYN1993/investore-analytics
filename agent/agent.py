"""
investore-agent — dial-out broker proxy.

Connects to the InvestOre cloud over WSS, registers an agent_id, then
services JSON-RPC method calls by translating them into the official
`ibapi` (TWS API) and forwarding to a *local* IB Gateway / TWS.

Designed to be a single-file deployment — no other modules required
beyond `websockets` and `ibapi`.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
import threading
import time
from typing import Any, Dict, List, Optional

import websockets
from ibapi.client import EClient
from ibapi.contract import Contract
from ibapi.order import Order
from ibapi.wrapper import EWrapper

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
log = logging.getLogger("agent")


# ─── Config ───────────────────────────────────────────────────────────────────

# Optional: load .env from the agent directory (created by setup.py)
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.isfile(_env_path):
    for _line in open(_env_path, "r", encoding="utf-8"):
        _line = _line.strip()
        if not _line or _line.startswith("#") or "=" not in _line:
            continue
        _k, _v = _line.split("=", 1)
        os.environ.setdefault(_k.strip(), _v.strip())

API_URL = os.environ.get("INVESTORE_API_URL", "ws://localhost:8000")
API_TOKEN = os.environ.get("INVESTORE_API_TOKEN", "")
AGENT_ID = os.environ.get("INVESTORE_AGENT_ID", "default-agent")
IB_HOST = os.environ.get("IB_HOST", "127.0.0.1")
IB_PORT = int(os.environ.get("IB_PORT", "4002"))
IB_CLIENT_ID = int(os.environ.get("IB_CLIENT_ID", "21"))

if not API_TOKEN:
    log.error("INVESTORE_API_TOKEN env var is required (run setup.py first)")
    sys.exit(2)


# ─── ibapi bridge ─────────────────────────────────────────────────────────────

class _IB(EWrapper, EClient):
    def __init__(self) -> None:
        EClient.__init__(self, self)
        self._next_id_lock = threading.Lock()
        self._next_id: int = 1
        self._order_status: Dict[int, Dict[str, Any]] = {}
        self._positions: List[Dict[str, Any]] = []
        self._positions_done = threading.Event()
        self._open_orders: List[Dict[str, Any]] = []
        self._open_orders_done = threading.Event()
        self._account_summary: Dict[str, Any] = {}
        self._account_summary_done = threading.Event()
        self._prices: Dict[int, Dict[int, float]] = {}

    # --- EWrapper callbacks ---
    def nextValidId(self, orderId: int) -> None:  # noqa: N802
        with self._next_id_lock:
            self._next_id = max(self._next_id, orderId)

    def orderStatus(self, orderId, status, filled, remaining, avgFillPrice,  # noqa: N802,N803
                    permId, parentId, lastFillPrice, clientId, whyHeld, mktCapPrice):
        self._order_status[orderId] = {
            "status": status, "filled": float(filled), "remaining": float(remaining),
            "avg_fill_price": float(avgFillPrice or 0),
        }

    def position(self, account, contract, position, avgCost):  # noqa: N802,N803
        self._positions.append({
            "account": account,
            "symbol": contract.symbol,
            "exchange": contract.primaryExchange or contract.exchange or "",
            "quantity": float(position),
            "avg_cost": float(avgCost or 0),
        })

    def positionEnd(self):  # noqa: N802
        self._positions_done.set()

    def openOrder(self, orderId, contract, order, orderState):  # noqa: N802,N803
        self._open_orders.append({
            "order_id": int(orderId),
            "symbol": contract.symbol,
            "side": order.action,
            "quantity": float(order.totalQuantity),
            "type": order.orderType,
            "limit_price": float(order.lmtPrice or 0),
            "status": orderState.status,
        })

    def openOrderEnd(self):  # noqa: N802
        self._open_orders_done.set()

    def accountSummary(self, reqId, account, tag, value, currency):  # noqa: N802,N803
        self._account_summary[tag] = {"value": value, "currency": currency, "account": account}

    def accountSummaryEnd(self, reqId):  # noqa: N802,N803
        self._account_summary_done.set()

    def tickPrice(self, reqId, tickType, price, attrib):  # noqa: N802,N803
        self._prices.setdefault(reqId, {})[int(tickType)] = float(price)

    def error(self, reqId, errorCode, errorString, advancedOrderRejectJson=""):  # noqa: N802,N803
        log.warning("IB error req=%s code=%s %s", reqId, errorCode, errorString)


class IB:
    """Thin wrapper that runs ibapi's EClient.run() loop in a background thread."""

    def __init__(self) -> None:
        self.app = _IB()
        self._thread: Optional[threading.Thread] = None
        self._connected = False

    def next_id(self) -> int:
        with self.app._next_id_lock:
            self.app._next_id += 1
            return self.app._next_id

    def connect(self) -> bool:
        if self._connected:
            return True
        try:
            self.app.connect(IB_HOST, IB_PORT, IB_CLIENT_ID)
        except Exception as e:
            log.error("ibapi connect failed: %s", e)
            return False
        self._thread = threading.Thread(target=self.app.run, daemon=True)
        self._thread.start()
        # Wait for nextValidId
        for _ in range(50):
            if self.app._next_id > 1:
                self._connected = True
                log.info("connected to IB Gateway %s:%s clientId=%s", IB_HOST, IB_PORT, IB_CLIENT_ID)
                return True
            time.sleep(0.1)
        log.error("IB handshake timed out")
        return False

    @staticmethod
    def _make_contract(symbol: str, exchange: str) -> Contract:
        """Build an IB Contract from (symbol, exchange).

        Recognises common exchange codes used by InvestOre and maps them to
        the IB-native (exchange, primaryExchange, currency) triple.
        ``symbol`` may be passed with a suffix (e.g. ``BHP.AX``) — the suffix
        is stripped and used as the exchange hint when no exchange is given.
        """
        # Strip Yahoo-style suffixes (BHP.AX -> BHP, exchange=ASX)
        ex = (exchange or "").upper().strip()
        sym = symbol.upper().strip()
        if "." in sym and not ex:
            base, suffix = sym.rsplit(".", 1)
            sym = base
            ex = {
                "AX": "ASX", "TO": "TSX", "V": "TSXV", "L": "LSE",
                "JO": "JSE", "HK": "HKEX", "NS": "NSE", "SI": "SGX",
            }.get(suffix, suffix)

        # IB exchange/currency map (mirror of backend ib_native.py IB_EXCHANGE_MAP)
        ib_map = {
            "ASX":    {"exchange": "ASX",   "primary": "ASX",     "currency": "AUD"},
            "TSX":    {"exchange": "SMART", "primary": "TSE",     "currency": "CAD"},
            "TSXV":   {"exchange": "SMART", "primary": "VENTURE", "currency": "CAD"},
            "NYSE":   {"exchange": "SMART", "primary": "NYSE",    "currency": "USD"},
            "NASDAQ": {"exchange": "SMART", "primary": "NASDAQ",  "currency": "USD"},
            "LSE":    {"exchange": "SMART", "primary": "LSE",     "currency": "GBP"},
            "JSE":    {"exchange": "JSE",   "primary": "JSE",     "currency": "ZAR"},
            "CSE":    {"exchange": "SMART", "primary": "CSE",     "currency": "CAD"},
            "HKEX":   {"exchange": "SEHK",  "primary": "SEHK",    "currency": "HKD"},
            "SEHK":   {"exchange": "SEHK",  "primary": "SEHK",    "currency": "HKD"},
            "":       {"exchange": "SMART", "primary": "",        "currency": "USD"},
            "SMART":  {"exchange": "SMART", "primary": "",        "currency": "USD"},
        }
        m = ib_map.get(ex, {"exchange": ex or "SMART", "primary": ex, "currency": "USD"})

        c = Contract()
        c.symbol = sym
        c.secType = "STK"
        c.currency = m["currency"]
        c.exchange = m["exchange"]
        if m["primary"]:
            c.primaryExchange = m["primary"]
        return c

    @staticmethod
    def _make_order(side: str, qty: int, order_type: str,
                    limit_price: Optional[float]) -> Order:
        o = Order()
        o.action = "BUY" if side.lower() == "buy" else "SELL"
        o.totalQuantity = int(qty)
        o.orderType = "LMT" if order_type.lower() == "limit" else "MKT"
        if o.orderType == "LMT" and limit_price is not None:
            o.lmtPrice = float(limit_price)
        o.tif = "DAY"
        return o

    # --- RPC handlers ---

    def submit_order(self, params: Dict[str, Any]) -> Dict[str, Any]:
        if not self.connect():
            raise RuntimeError("IB Gateway not reachable")
        contract = self._make_contract(params["symbol"], params.get("exchange") or "SMART")
        order = self._make_order(
            params["side"], int(params["quantity"]),
            params.get("order_type") or "market", params.get("limit_price"),
        )
        oid = self.next_id()
        self.app.placeOrder(oid, contract, order)
        # Wait briefly for an initial status update
        for _ in range(20):
            if oid in self.app._order_status:
                break
            time.sleep(0.05)
        st = self.app._order_status.get(oid, {})
        return {
            "broker_order_id": str(oid),
            "status": st.get("status") or "submitted",
            "filled": st.get("filled", 0),
            "avg_fill_price": st.get("avg_fill_price", 0),
        }

    def cancel_order(self, params: Dict[str, Any]) -> Dict[str, Any]:
        if not self.connect():
            raise RuntimeError("IB Gateway not reachable")
        try:
            self.app.cancelOrder(int(params["broker_order_id"]), "")
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    def get_positions(self, _params: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.connect():
            return []
        self.app._positions.clear()
        self.app._positions_done.clear()
        self.app.reqPositions()
        self.app._positions_done.wait(10.0)
        return [p for p in self.app._positions if p["quantity"] != 0]

    def get_open_orders(self, _params: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.connect():
            return []
        self.app._open_orders.clear()
        self.app._open_orders_done.clear()
        self.app.reqAllOpenOrders()
        self.app._open_orders_done.wait(10.0)
        return list(self.app._open_orders)

    def get_account_summary(self, _params: Dict[str, Any]) -> Dict[str, Any]:
        if not self.connect():
            return {}
        self.app._account_summary.clear()
        self.app._account_summary_done.clear()
        req_id = self.next_id()
        tags = "NetLiquidation,TotalCashValue,BuyingPower,AvailableFunds,GrossPositionValue"
        self.app.reqAccountSummary(req_id, "All", tags)
        self.app._account_summary_done.wait(10.0)
        try:
            self.app.cancelAccountSummary(req_id)
        except Exception:
            pass
        return dict(self.app._account_summary)

    def get_market_price(self, params: Dict[str, Any]) -> Optional[float]:
        if not self.connect():
            return None
        contract = self._make_contract(params["symbol"], params.get("exchange") or "SMART")
        req_id = self.next_id()
        self.app._prices[req_id] = {}
        self.app.reqMktData(req_id, contract, "", False, False, [])
        for _ in range(20):
            time.sleep(0.1)
            slot = self.app._prices.get(req_id, {})
            price = slot.get(4) or slot.get(2) or slot.get(1) or slot.get(9)
            if price:
                try:
                    self.app.cancelMktData(req_id)
                except Exception:
                    pass
                return float(price)
        try:
            self.app.cancelMktData(req_id)
        except Exception:
            pass
        return None


# ─── WebSocket loop ───────────────────────────────────────────────────────────

ib = IB()

RPC_HANDLERS = {
    "ping": lambda _p: {"pong": True},
    "submit_order": ib.submit_order,
    "cancel_order": ib.cancel_order,
    "get_positions": ib.get_positions,
    "get_open_orders": ib.get_open_orders,
    "get_account_summary": ib.get_account_summary,
    "get_market_price": ib.get_market_price,
}


async def _handle_message(ws, raw: str) -> None:
    try:
        msg = json.loads(raw)
    except json.JSONDecodeError:
        return
    mtype = msg.get("type")
    if mtype == "rpc":
        rpc_id = msg.get("id")
        method = msg.get("method")
        params = msg.get("params") or {}
        handler = RPC_HANDLERS.get(method)
        if handler is None:
            await ws.send(json.dumps({"type": "rpc_result", "id": rpc_id,
                                      "ok": False, "error": f"unknown method {method}"}))
            return
        try:
            # Run sync ibapi calls in a thread so we don't block the WS loop.
            result = await asyncio.get_running_loop().run_in_executor(
                None, lambda: handler(params),
            )
            await ws.send(json.dumps({"type": "rpc_result", "id": rpc_id,
                                      "ok": True, "result": result}))
        except Exception as e:
            log.exception("rpc handler %s failed", method)
            await ws.send(json.dumps({"type": "rpc_result", "id": rpc_id,
                                      "ok": False, "error": str(e)}))
    elif mtype == "pong":
        pass
    elif mtype == "welcome":
        log.info("server welcome: %s", msg.get("server"))


async def _run_once() -> None:
    url = f"{API_URL.rstrip('/')}/api/v1/trading/agent/connect?token={API_TOKEN}&agent_id={AGENT_ID}"
    log.info("connecting to %s", API_URL)
    async with websockets.connect(url, ping_interval=30, ping_timeout=10, max_size=2**20) as ws:
        await ws.send(json.dumps({"type": "hello", "agent_id": AGENT_ID, "version": "1"}))
        async for raw in ws:
            await _handle_message(ws, raw)


async def main() -> None:
    backoff = 1.0
    while True:
        try:
            await _run_once()
            backoff = 1.0
        except (websockets.ConnectionClosed, OSError) as e:
            log.warning("connection lost: %s — reconnecting in %.1fs", e, backoff)
        except Exception as e:
            log.exception("unexpected error: %s", e)
        await asyncio.sleep(backoff)
        backoff = min(backoff * 2, 30.0)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("shutting down")
