#!/bin/bash

# First parameter is optional commit message, defaults to "update"
COMMIT_MESSAGE=${1:-"update"}

# Push the changes to the remote repository
git add .
git commit -m "$COMMIT_MESSAGE" --allow-empty
git push
