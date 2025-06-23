#!/bin/bash

# Automatischer Git Commit & Push
MESSAGE=${1:-"Auto-Commit"}  # Nutze Argument, oder Standard-Text

echo "→ git add ."
git add .

echo "→ git commit -m \"$MESSAGE\""
git commit -m "$MESSAGE"

echo "→ git push"
git push


# ./git-auto.sh "Dein Commit-Text" so kann man alles ausführen und nur den Text verändern (wer es wünscht)