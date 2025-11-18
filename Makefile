.PHONY: help install dev build start db-up db-down db-reset db-seed test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm start

db-up: ## Start PostgreSQL database
	docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5

db-down: ## Stop PostgreSQL database
	docker-compose down

db-reset: db-up ## Reset database schema
	npx prisma migrate reset --force
	npm run db:seed

db-seed: ## Seed database with sample data
	npm run db:seed

db-studio: ## Open Prisma Studio
	npm run db:studio

test: ## Run tests
	npm test
