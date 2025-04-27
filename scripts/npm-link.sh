#!/bin/bash

# Scan direct dependencies and devDependencies in package.json
# check if there are linked packages globally available
# and link them to the local node_modules

# Get all dependencies and devDependencies into one array
allDependencies=()
if jq -e '.dependencies' package.json >/dev/null; then
  allDependencies+=($(jq -r '.dependencies | keys[]' package.json))
fi
if jq -e '.devDependencies' package.json >/dev/null; then
  allDependencies+=($(jq -r '.devDependencies | keys[]' package.json))
fi

separator="------------------------------------------"

echo -e "Checking for linked packages from dependencies and devDependencies..."
# Extract available global link package names only
# npm ls -g --depth=0 --link=true
#  example output per package: typesafe-utilities@0.2.2 -> ./../../../../../SAPDevelop/git/personal/VolksRebal/typesafe-utilities
#  We extract only the package name `typesafe-utilities`
available_global_link_packages=$(
  npm ls -g --depth=0 --link=true 2>/dev/null | \
  awk -F ' -> ' '/ -> / {print $1}' | \
  awk -F '@' '{print $1}' | \
  sed 's/^[^ ]* //g' | \
  # remove duplicates
  sort -u | \
  # replace '\n' with ' '
  tr '\n' ' '
)
echo -e "Available global link packages:\n${separator}\n${available_global_link_packages}\n${separator}\n"

# Now construct the list of packages to link
packages_to_link=()
for package in "${allDependencies[@]}"; do
  # Check if the package is available globally linked
  if [[ " ${available_global_link_packages[@]} " =~ " ${package} " ]]; then
    # If it is, add it to the list of packages to link
    packages_to_link+=("$package")
  fi
done
echo -e "Packages to link:\n${separator}\n${packages_to_link[@]}\n${separator}\n"

# Now link the packages in one npm link command, if there are any
if [ ${#packages_to_link[@]} -eq 0 ]; then
  echo "No packages to link."
  exit 0
fi
npm link "${packages_to_link[@]}" 2>/dev/null
echo -e "\033[1;33mWarning: You may need to make sure that the linked packages are released and up to date.\033[0m"
echo -e "\033[1;33mWarning: While the checks may work locally, they may fail on CI/CD if the linked packages are not released and up to date.\033[0m"
