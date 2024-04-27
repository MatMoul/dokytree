#!/bin/bash

help() {
	echo "gen.sh template script numstart numend [numsize=1]"
}

if [ "${1}" == "-h" ] || [ "${1}" == "--help" ]; then
	help
	exit 0
fi
if [ ${#} -lt 4 ] || [ ${#} -gt 5 ]; then
	echo "Arguments count error"
	echo ""
	help
	exit 1
fi

declare -r MODEL=${1}
declare -r SCRIPT=${2}
declare -r NUMSTART=${3}
declare -r NUMEND=${4}
declare NUMSIZE=${5}

if [ "${NUMSTART}" -gt "${NUMEND}" ]; then
	echo "NUMSTART is greather than NUMEND"
	echo ""
	help
	exit 1
fi

if [ ! -f "${MODEL}" ]; then
	echo "Model file not found"
	echo ""
	help
	exit 1
fi

if [ ! -f "${SCRIPT}" ]; then
	echo "Script file not found"
	echo ""
	help
	exit 1
fi

if [ "${NUMSIZE}" == "" ]; then
	NUMSIZE=1
fi

for ((i=NUMSTART;i<=NUMEND;i++)); do
	NUM=${i}
	while [ "${#NUM}" -lt "${NUMSIZE}" ]; do
		NUM=0"${NUM}"
	done
	cp "${MODEL}" "${MODEL/.yaml/-${NUM}.yaml}"
	sed -i "/^name:/c\name: '${MODEL/.yaml/-${NUM}}'" "${MODEL/.yaml/-${NUM}.yaml}"
	bash "${SCRIPT}" "${MODEL/.yaml/-${NUM}.yaml}" "${NUMSTART}" "${NUMEND}" "${NUM}"
done
