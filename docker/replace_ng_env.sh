#!/bin/bash

file="/app/frontend/src/environments/environment.ts"

awk -v key="HOST_IP" -v value="$HOST_IP" '{gsub(key":.*", key": \047" value "\047,", $0); print}' "$file" > temp_file && mv temp_file "$file"