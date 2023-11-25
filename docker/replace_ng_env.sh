#!/bin/bash

key="HOST_IP"

line=$(grep "^$key=" /dev.env)

value=$(echo "$line" | awk -F= '{print $2}')

file="/app/frontend/src/environments/environment.development.ts"

awk -v key="$key" -v value="$value" '{gsub(key":.*", key": \047" value "\047,", $0); print}' "$file" > temp_file && mv temp_file "$file"