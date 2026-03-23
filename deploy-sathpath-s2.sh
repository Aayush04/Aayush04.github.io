#!/bin/bash

# Deploy script for sathpath-s2
# This script deploys the satpath-quiz-s2 project

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
SOURCE_DIR="$REPO_ROOT/satpath-quiz-s2"
ZIP_FILE="$REPO_ROOT/satpath-quiz.zip"

echo "Extracting sathpath-quiz.zip into satpath-quiz-s2"

# Extract the zip into satpath-quiz-s2
unzip -o "$ZIP_FILE" -d "$SOURCE_DIR"

echo "Extraction complete."