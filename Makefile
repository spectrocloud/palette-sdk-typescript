# If you update this file, please follow:
# https://suva.sh/posts/well-documented-makefiles/

.DEFAULT_GOAL:=help
.PHONY: help generate install-dependencies test clean license

# Output
TIME   = `date +%H:%M:%S`
GREEN  := $(shell printf "\033[32m")
RED    := $(shell printf "\033[31m")
CNone  := $(shell printf "\033[0m")
OK   = echo ${TIME} ${GREEN}[ OK ]${CNone}
ERR  = echo ${TIME} ${RED}[ ERR ]${CNone} "error:"

##@ Help Targets

help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Build Targets

generate: install-dependencies ## Generate models with tags-split organization
	(cd api && ./generate.sh)
	python3 api/fix-duplicates.py api/palette-apis-spec.json api/palette-apis-spec-fixed.json
	node api/tag-transformer.js api/palette-apis-spec-fixed.json api/palette-apis-spec-tagged.json
	npx @openapitools/openapi-generator-cli generate \
		-g openapi-yaml \
		-i /local/api/palette-apis-spec-tagged.json \
		-o /local
	npx orval
	node api/post-processing.js
	npm run build
	@$(OK) "Code generation complete with tags-split organization and JavaScript build"

install-dependencies:
	npm install --save-dev @openapitools/openapi-generator-cli orval
	@$(OK) "Dependencies installed"

##@ Test Targets

test: ## Run integration tests
	npm test
	@$(OK) "Integration tests passed"

##@ Static Analysis Targets

check-diff: reviewable ## Execute branch is clean
	git --no-pager diff
	git diff --quiet || ($(ERR) please run 'make reviewable' to include all changes && false)
	@$(OK) branch is clean

reviewable: pre-commit-install ## Ensure code is ready for review
	git submodule update --remote

pre-commit-install: pre-commit ## Install pre-commit hooks
	@if [ "$(GITHUB_ACTIONS)" != "true" ]; then \
		pre-commit install --hook-type commit-msg; \
		pre-commit install --hook-type pre-commit; \
	fi

##@ Tools Targets

.PHONY: pre-commit
pre-commit:
	@if [ "$(GITHUB_ACTIONS)" != "true" ]; then \
		@command -v pre-commit >/dev/null 2>&1 || { \
			echo "pre-commit not found, downloading..."; \
			pip install pre-commit; \
		} \
	fi

##@ Formatting Targets
prettier:
	npx prettier --write .

license:
	copywrite headers .

##@ Maintenance Targets

clean: ## Clean generated files except httpClient folder
	rm -rf palette/
	rm rf api/hapi
	rm -f api/palette-apis-spec-tagged.json
	rm -rf dist/
	@$(OK) "Clean complete"