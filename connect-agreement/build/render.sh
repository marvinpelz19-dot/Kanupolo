#!/bin/sh
# Rebuild everything: logo variants, backgrounds, .docx and a PDF preview.
set -e
cd "$(dirname "$0")/.."
python3 build/logo.py assets/connect-logo-original.jpg assets
node build/backgrounds.js
node build/build.js
soffice --headless --convert-to pdf Connect_Athlete_Affiliate_Agreement.docx >/dev/null 2>&1
