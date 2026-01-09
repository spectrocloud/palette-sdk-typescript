#!/bin/bash
# Copyright (c) Spectro Cloud
# SPDX-License-Identifier: Apache-2.0


set -e

# Fetch the latest hapi spec
if [ ! -d "hapi" ]; then
    git clone git@github.com:spectrocloud/hapi.git || git clone https://github.com/spectrocloud/hapi
fi
(
    cd hapi
    # Fetch all tags from origin, forcing update of any moved tags
    git fetch origin --tags --force
    # Get the latest tag starting with 'v' sorted by version
    LATEST_TAG=$(git tag -l 'v*' --sort=-v:refname | head -n 1)
    if [ -z "$LATEST_TAG" ]; then
        echo "Error: No tags starting with 'v' found"
        exit 1
    fi
    echo "Checking out tag: $LATEST_TAG"
    git checkout --force "$LATEST_TAG"
    bash generate_hubble_spec.sh
    go run api/main.go
    cp gen/docs-spec/palette-apis-spec.json ..
)
