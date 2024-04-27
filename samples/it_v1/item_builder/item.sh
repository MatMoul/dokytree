#!/bin/bash

declare -r FILE=${1}
declare -r NUMSTART=${2}
declare -r NUMEND=${3}
declare -r NUM=${4}
declare -r NUMDIFF=$((NUMSTART + NUM - NUMSTART))

# Custom code
# sed -i "/^name:/c\name: 'crazy-${NUM}'" "${FILE}"
IP=$((230 + NUMDIFF))
sed -i s/YY/${IP}/ "${FILE}"
