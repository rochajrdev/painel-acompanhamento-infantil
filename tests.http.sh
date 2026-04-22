#!/bin/bash

# Script de testes para validar a API Painel de Acompanhamento Infantil
# Usage: bash tests.http.sh

BASE_URL="http://localhost:3333"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Painel de Acompanhamento Infantil - Testes HTTP         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============ TESTES ============

echo "TEST 1: GET /summary (sem autenticação)"
echo "GET $BASE_URL/summary"
curl -s "$BASE_URL/summary" | jq .
echo ""

echo "TEST 2: POST /auth/token (Login)"
echo "POST $BASE_URL/auth/token"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"tecnico@prefeitura.rio","password":"painel@2024"}')

echo "$RESPONSE" | jq .

TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
echo "✓ Token obtido: ${TOKEN:0:30}..."
echo ""

echo "TEST 3: GET /children (lista com paginação)"
echo "GET $BASE_URL/children?page=1&pageSize=3"
curl -s "$BASE_URL/children?page=1&pageSize=3" | jq '.items[0], .total, .page, .totalPages'
echo ""

echo "TEST 4: GET /children/:id (detalhe da criança)"
echo "GET $BASE_URL/children/c001"
curl -s "$BASE_URL/children/c001" | jq .
echo ""

echo "TEST 5: GET /children com filtro q (busca por nome)"
echo "GET $BASE_URL/children?q=Ana&pageSize=5"
curl -s "$BASE_URL/children?q=Ana&pageSize=5" | jq '.items[] | {id, nome}'
echo ""

echo "TEST 6: GET /children com filtro bairro"
echo "GET $BASE_URL/children?bairro=Rocinha&pageSize=5"
curl -s "$BASE_URL/children?bairro=Rocinha&pageSize=5" | jq '.items[] | {id, nome, bairro}'
echo ""

echo "TEST 7: GET /children com filtro revisado=false"
echo "GET $BASE_URL/children?revisado=false&pageSize=3"
curl -s "$BASE_URL/children?revisado=false&pageSize=3" | jq '.items[] | {id, nome, revisado}'
echo ""

echo "TEST 8: GET /children com filtro incompleto=true"
echo "GET $BASE_URL/children?incompleto=true&pageSize=3"
curl -s "$BASE_URL/children?incompleto=true&pageSize=3" | jq '.items[] | {id, nome, saude, educacao}'
echo ""

echo "TEST 9: PATCH /children/:id/review (com autenticação)"
echo "PATCH $BASE_URL/children/c005/review"
echo "Authorization: Bearer $TOKEN"
curl -s -X PATCH "$BASE_URL/children/c005/review" \
  -H "Authorization: Bearer $TOKEN" | jq '.revisado_em, .revisado_por'
echo ""

echo "TEST 10: GET /children/:id (verificar revisão)"
echo "GET $BASE_URL/children/c005"
curl -s "$BASE_URL/children/c005" | jq '{id, nome, revisado, revisado_por, revisado_em}'
echo ""

echo "TEST 11: PATCH /children/:id/review sem token (deve falhar com 401)"
echo "PATCH $BASE_URL/children/c006/review (sem Authorization)"
curl -s -X PATCH "$BASE_URL/children/c006/review" | jq .
echo ""

echo "TEST 12: POST /auth/token com credenciais inválidas"
echo "POST $BASE_URL/auth/token (credenciais erradas)"
curl -s -X POST "$BASE_URL/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"tecnico@prefeitura.rio","password":"senhaerrada"}' | jq .
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   Testes Concluídos ✓                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
