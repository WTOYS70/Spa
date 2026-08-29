#!/bin/sh
# Régénère les fichiers minifiés que le site sert réellement.
# À lancer après CHAQUE modification de assets/css/style.css ou assets/js/main.js,
# sinon le site continue de servir l'ancienne version.
#
#   ./minify.sh
#
# Nécessite Node.js. esbuild est téléchargé à la volée par npx : rien à installer.
set -e
cd "$(dirname "$0")"

npx --yes esbuild@0.28 assets/css/style.css \
    --minify --outfile=assets/css/style.min.css --log-level=warning
npx --yes esbuild@0.28 assets/js/main.js \
    --minify --target=es2020 --outfile=assets/js/main.min.js --log-level=warning

echo "Fichiers régénérés :"
ls -l assets/css/style.min.css assets/js/main.min.js | awk '{printf "  %-32s %6.1f Ko\n", $9, $5/1024}'
