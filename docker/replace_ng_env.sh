#!/bin/bash

key="HOST_IP"

line=$(grep "^$key=" ./docker/dev.env)

value=$(echo "$line" | awk -F= '{print $2}')

file="app/frontend/src/environments/environment.development.ts"

sed -i'' -e "s/'$key:*'/'$key: $value'/api,/g" \"$file"
