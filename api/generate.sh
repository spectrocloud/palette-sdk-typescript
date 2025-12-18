#!/bin/bash
# Copyright (c) Spectro Cloud
# SPDX-License-Identifier: Apache-2.0


set -e

# Fetch the latest hapi spec
if [ -d "hapi" ]; then
    (cd hapi && git pull origin master --ff)
else
    git clone git@github.com:spectrocloud/hapi.git || git clone https://github.com/spectrocloud/hapi
fi
(
    cd hapi
    bash generate_hubble_spec.sh
    go run api/main.go
    cp gen/docs-spec/palette-apis-spec.json ..
)
