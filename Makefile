# InvestOre Analytics - Makefile
# Common development and deployment commands

.PHONY: help dev dev-up dev-down dev-logs build test lint format migrate shell db-shell clean

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

help: ## Show this help message
	@echo "$(CYAN)InvestOre Analytics$(RESET) - Development Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# ===========================================
# Development Environment
# ===========================================

dev: dev-up ## Start development environment (alias for dev-up)

dev-up: ## Start all development services
	docker-compose up -d
	@echo "$(GREEN)Development environment started!$(RESET)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/api/docs"

dev-down: ## Stop all development services
	docker-compose down
	@echo "$(YELLOW)Development environment stopped$(RESET)"

dev-logs: ## Tail logs from all services
	docker-compose logs -f

dev-logs-backend: ## Tail backend logs only
	docker-compose logs -f backend

dev-logs-frontend: ## Tail frontend logs only
	docker-compose logs -f frontend

dev-tools: ## Start dev environment with extra tools (pgAdmin)
	docker-compose --profile dev-tools up -d
	@echo "$(GREEN)Dev tools started!$(RESET)"
	@echo "  pgAdmin: http://localhost:5050"

dev-rebuild: ## Rebuild and restart all services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# ===========================================
# Backend Commands
# ===========================================

backend-shell: ## Open a shell in the backend container
	docker-compose exec backend bash

backend-test: ## Run backend tests
	docker-compose exec backend pytest -v

backend-test-cov: ## Run backend tests with coverage
	docker-compose exec backend pytest --cov=app --cov-report=html

backend-lint: ## Run linting on backend code
	docker-compose exec backend ruff check app
	docker-compose exec backend mypy app

backend-format: ## Format backend code
	docker-compose exec backend ruff format app
	docker-compose exec backend isort app

# ===========================================
# Database Commands
# ===========================================

db-shell: ## Open a psql shell to the database
	docker-compose exec db psql -U investore -d investore

db-migrate: ## Run database migrations
	docker-compose exec backend alembic upgrade head

db-migrate-new: ## Create a new migration (usage: make db-migrate-new name="migration name")
	docker-compose exec backend alembic revision --autogenerate -m "$(name)"

db-reset: ## Reset database (WARNING: destroys all data)
	@read -p "This will DELETE all data. Are you sure? [y/N] " confirm && \
	[ "$$confirm" = "y" ] && \
	docker-compose down -v && \
	docker-compose up -d db && \
	sleep 5 && \
	docker-compose up -d backend && \
	docker-compose exec backend alembic upgrade head

db-seed: ## Seed database with sample data
	docker-compose exec backend python -m scripts.seed_data

# ===========================================
# Frontend Commands
# ===========================================

frontend-shell: ## Open a shell in the frontend container
	docker-compose exec frontend sh

frontend-lint: ## Run linting on frontend code
	docker-compose exec frontend npm run lint

frontend-format: ## Format frontend code
	docker-compose exec frontend npm run format

frontend-test: ## Run frontend tests
	docker-compose exec frontend npm test

# ===========================================
# Build & Deploy
# ===========================================

build: ## Build all Docker images
	docker-compose build

build-prod: ## Build production Docker images
	docker build -t investore/backend:latest --target production ./backend
	docker build -t investore/frontend:latest --target production ./frontend
	docker build -t investore/etl:latest ./etl

push: ## Push images to registry
	docker push investore/backend:latest
	docker push investore/frontend:latest
	docker push investore/etl:latest

deploy-staging: ## Deploy to staging environment
	kubectl apply -f infra/k8s/deployment.yaml --namespace=investore-staging

deploy-prod: ## Deploy to production environment
	kubectl apply -f infra/k8s/deployment.yaml --namespace=investore

# ===========================================
# ETL Commands
# ===========================================

etl-run: ## Run ETL pipeline manually
	docker-compose exec etl python -m flows.market_data_flow

etl-asx-universe: ## Sync ASX mining/exploration universe (upserts companies)
	docker-compose exec etl python -m flows.company_universe_flow

etl-shell: ## Open a shell in the ETL container
	docker-compose exec etl bash

# ===========================================
# Cleanup
# ===========================================

clean: ## Remove all containers, volumes, and build artifacts
	docker-compose down -v --rmi local
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true

clean-volumes: ## Remove Docker volumes (WARNING: destroys data)
	docker volume rm investore_analytics_postgres_data investore_analytics_redis_data 2>/dev/null || true

# ===========================================
# Local Development (without Docker)
# ===========================================

local-backend: ## Run backend locally (requires venv)
	cd backend && poetry run uvicorn app.main:app --reload --port 8000

local-frontend: ## Run frontend locally (requires node_modules)
	cd frontend && npm run dev

local-install-backend: ## Install backend dependencies locally
	cd backend && poetry install

local-install-frontend: ## Install frontend dependencies locally
	cd frontend && npm install
