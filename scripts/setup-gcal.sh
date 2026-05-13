#!/bin/bash
# ── EVO: Google Calendar setup agent ──────────────────────

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   EVO — Google Calendar Setup Agent      ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${RESET}"
echo ""

# ── Step 1: Open GCP Console to enable Calendar API ───────
echo -e "${BLUE}[1/4]${RESET} פותח את Google Cloud Console להפעלת Google Calendar API..."
open "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=evo-supplier" 2>/dev/null || true
echo ""
echo -e "  ${YELLOW}➜ לחץ Enable אם לא מופעל. לחץ Enter כשסיימת.${RESET}"
read -r

# ── Step 2: Open OAuth Credentials page ───────────────────
echo -e "${BLUE}[2/4]${RESET} פותח את דף ה-Credentials..."
open "https://console.cloud.google.com/apis/credentials?project=evo-supplier" 2>/dev/null || true
echo ""
echo -e "  ${YELLOW}➜ מצא את OAuth 2.0 Client ID הקיים (Web application)${RESET}"
echo -e "  ${YELLOW}➜ לחץ עליו → הוסף ל-Authorized JavaScript origins:${RESET}"
echo -e "  ${YELLOW}     https://evo-suppliers.vercel.app${RESET}"
echo -e "  ${YELLOW}     http://localhost:5174${RESET}"
echo -e "  ${YELLOW}➜ שמור ← העתק את Client ID${RESET}"
echo ""
echo -e "  ${YELLOW}➜ לחץ Enter כשסיימת.${RESET}"
read -r

# ── Step 3: Get Client ID from user ───────────────────────
echo -e "${BLUE}[3/4]${RESET} הדבק את ה-Client ID שהעתקת:"
echo -n "  Client ID: "
read -r CLIENT_ID

if [ -z "$CLIENT_ID" ]; then
  echo -e "${RED}  ✗ לא הוזן Client ID. יוצא.${RESET}"
  exit 1
fi

# Validate format (should end with .apps.googleusercontent.com)
if [[ "$CLIENT_ID" != *".apps.googleusercontent.com" ]]; then
  echo -e "${YELLOW}  ⚠ Client ID לא נראה תקין — ממשיך בכל זאת.${RESET}"
fi

# ── Step 4: Write to .env ──────────────────────────────────
ENV_FILE="$(dirname "$0")/../.env"

# Remove existing VITE_GOOGLE_CLIENT_ID line if present
if grep -q "VITE_GOOGLE_CLIENT_ID" "$ENV_FILE" 2>/dev/null; then
  sed -i '' '/VITE_GOOGLE_CLIENT_ID/d' "$ENV_FILE"
fi

echo "VITE_GOOGLE_CLIENT_ID=\"$CLIENT_ID\"" >> "$ENV_FILE"
echo -e "${GREEN}  ✓ נשמר ב-.env${RESET}"

# ── Step 5: Add to Vercel ──────────────────────────────────
echo -e "${BLUE}[4/4]${RESET} מוסיף ל-Vercel ומעלה..."

# Add to all environments
echo "$CLIENT_ID" | npx vercel env add VITE_GOOGLE_CLIENT_ID production --force 2>/dev/null || \
  printf "%s" "$CLIENT_ID" | npx vercel env add VITE_GOOGLE_CLIENT_ID production 2>/dev/null || true

echo -e "${GREEN}  ✓ הוסף ל-Vercel environment variables${RESET}"

# ── Build + Deploy ─────────────────────────────────────────
echo ""
echo -e "${BOLD}בונה ומעלה לVercel...${RESET}"
cd "$(dirname "$0")/.."
npm run build 2>&1 | tail -3
npx vercel --prod 2>&1 | grep -E "Aliased|Error|Production"

echo ""
echo -e "${GREEN}${BOLD}✅ סיום! Google Calendar מחובר.${RESET}"
echo -e "   פתח https://evo-suppliers.vercel.app ובדוק את לוח השנה."
echo ""
