#!/usr/bin/env bash
# Vérifie qu'un déploiement répond et sert bien la version attendue.
# Usage : scripts/smoke-test.sh <url-api> <version-attendue>
set -euo pipefail

API_URL="${1:?URL manquante}"
EXPECTED_VERSION="${2:?version manquante}"

for attempt in 1 2 3 4 5; do
  if body=$(curl -fsS "${API_URL}/health"); then
    echo "Réponse /health : ${body}"
    if echo "${body}" | grep -q "\"version\":\"${EXPECTED_VERSION}\""; then
      curl -fsS -o /dev/null "${API_URL}/openapi.json"
      echo "Smoke test OK (${EXPECTED_VERSION})"
      exit 0
    fi
  fi
  echo "Tentative ${attempt} échouée, nouvelle tentative dans $((attempt * 3))s..."
  sleep $((attempt * 3))
done

echo "Smoke test KO : ${API_URL} ne sert pas la version ${EXPECTED_VERSION}" >&2
exit 1
