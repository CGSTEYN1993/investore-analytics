# InvestOre Agent

Tiny dial-out client that lets the InvestOre cloud platform place orders
through **your local** Interactive Brokers Gateway / TWS — without ever
exposing TWS to the internet.

```
┌────────────────────┐    WSS (outbound)    ┌────────────────────┐
│  InvestOre Cloud   │  ◄──────────────►    │ investore-agent    │
│ (FastAPI + UI)     │                      │  (this repo)       │
└────────────────────┘                      │        │           │
                                            │        ▼  TCP 4002 │
                                            │   IB Gateway       │
                                            └────────────────────┘
```

## Quick start

```powershell
# 1. Create a venv & install
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# 2. Configure
$env:INVESTORE_API_URL    = "wss://api.investore.app"          # or ws://localhost:8000
$env:INVESTORE_API_TOKEN  = "<jwt from /auth/login>"
$env:INVESTORE_AGENT_ID   = "my-trading-pc"                    # any stable string
$env:IB_HOST              = "127.0.0.1"
$env:IB_PORT              = "4002"                             # 4001 live / 4002 paper
$env:IB_CLIENT_ID         = "21"                               # must differ from any other consumer

# 3. Run
python agent.py
```

Then in the cloud dashboard, create a trading account with
`broker = 'ib_agent'` and `broker_agent_id = 'my-trading-pc'`.

## Security

* The agent only ever **dials out** — your firewall stays closed.
* The cloud cannot push code to the agent; it can only invoke a fixed set
  of RPC methods (`submit_order`, `cancel_order`, `get_positions`,
  `get_open_orders`, `get_account_summary`, `get_market_price`, `ping`).
* All orders flow through your **own** IB account — InvestOre never
  custodies funds.
