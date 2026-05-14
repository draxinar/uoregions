#!/bin/bash
#
# Stage the GitHub Pages artifact at _site/.
#
# Inputs:
#   - This repo's static files (index.html, style.css, uoregions.js, map.png,
#     heightmap.bin.gz)
#   - A draxinar/rundir checkout at ./rundir
#
# Output:
#   - _site/  ready for actions/upload-pages-artifact
#
set -euo pipefail

SITE=_site
RUNDIR=${RUNDIR:-rundir}

rm -rf "$SITE"
mkdir -p "$SITE/rundir/uogolddemo" "$SITE/rundir/bank"

cp index.html style.css uoregions.js map.png heightmap.bin.gz "$SITE/"

echo 'uoregions.serpent-isle.com' > "$SITE/CNAME"

cp "$RUNDIR/tiledata.mul"            "$SITE/rundir/"
cp "$RUNDIR/bank/templatestable.dat" "$SITE/rundir/bank/"
cp "$RUNDIR/uogolddemo/regions.txt"  "$SITE/rundir/uogolddemo/"
cp "$RUNDIR/uogolddemo/dynamic0.mul" "$SITE/rundir/uogolddemo/"
cp "$RUNDIR/uogolddemo/dynidx0.mul"  "$SITE/rundir/uogolddemo/"
