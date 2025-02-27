#!/bin/bash
git add .

# Create a commit message with files changed and current date
commit_message="Updated files: $(git diff --cached --name-only) - $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$commit_message"

# Push the changes
git push
