#!/bin/bash

declare -r APPNAME=dokytree
declare -r NODEVER=19.7.0
declare BASEDIR=""
declare CURDIR=""
declare TMPDIR=""

BASEDIR="$(pwd)"/$(dirname "${0}")/../..
echo "${BASEDIR}"

CURDIR+="$(pwd)"

TMPDIR=$(mktemp -d -u)
mkdir -p "${TMPDIR}"/"${APPNAME}"

cp -R "${BASEDIR}"/src/* "${TMPDIR}"/"${APPNAME}"
cp -R "${BASEDIR}"/samples "${TMPDIR}"/"${APPNAME}"

cd "${TMPDIR}" || exit
wget https://nodejs.org/dist/v${NODEVER}/node-v${NODEVER}-win-x64.zip
unzip node-v${NODEVER}-win-x64.zip
cp node-v${NODEVER}-win-x64/node.exe "${TMPDIR}"/"${APPNAME}"

zip -r "${CURDIR}"/"${APPNAME}".zip "${APPNAME}"

cd "${CURDIR}" || cd || exit
rm -rf "${TMPDIR}"
