.PHONY: help

.DEFAULT_GOAL := help
SHELL := /usr/bin/env bash
AWS_DEFAULT_REGION = eu-central-1

RED = $(shell tput -T xterm setaf 1)
RESET = $(shell tput -T xterm sgr0)


# -------------------------------------------------------------------
# HELPERS
# -------------------------------------------------------------------
check-%:
	@if [ "${${*}}" = "" ]; then \
		echo -e "${RED} Variable $* not set ❌${RESET}"; \
		exit 1; \
	fi


router-config: check-ENV check-STAGE
	@sops exec-env env/secrets/${ENV}.${STAGE}.env \
	'yq -o json '\''(.. | select(tag == "!!str")) |= envsubst(nu) | .${ENV}.${STAGE} | explode(.)'\'' env/router.yaml'

sequencer-config: check-ENV check-STAGE
	@sops exec-env env/secrets/${ENV}.${STAGE}.env \
	'yq -o json '\''(.. | select(tag == "!!str")) |= envsubst(nu) | .${ENV}.${STAGE} | explode(.)'\'' env/sequencer.yaml'

chain-config: check-ENV check-STAGE
	@sops exec-env env/secrets/${ENV}.${STAGE}.env \
	'yq -o json '\''(.. | select(tag == "!!str")) |= envsubst(ne) | .${ENV}.${STAGE} | explode(.)'\'' env/chains.yaml'

mq-config: check-ENV check-STAGE
	@sops exec-env env/secrets/${ENV}.${STAGE}.env \
	'yq -o json '\''(.. | select(tag == "!!str")) |= envsubst(ne) | .${ENV}.${STAGE} | explode(.)'\'' env/mq.yaml'

