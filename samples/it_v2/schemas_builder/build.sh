#!/bin/bash

declare -r PARTDIR=./parts
declare -r SCHEMADIR=../schemas
declare -r OBJECTSDIR=./objects

getSchemaHeader() {
	local DOC="{\n"
  DOC+="\t\""'$schema'"\": \"http://json-schema.org/draft-07/schema#\",\n"
	DOC+="\t\"title\": \"YAML Schema for computer\",\n"
	DOC+="\t\"type\": \"object\",\n"
	DOC+="\t\"additionalProperties\": false,\n"
	DOC+="\t\"properties\": {\n"
	echo -e "${DOC}"
}
getSchemaFooter() {
	local DOC+="\t}\n"
	DOC+="}\n"
	echo -e "${DOC}"
}
getPart() {
	local -r PARTFILE=${PARTDIR}/${1}.json
	if [ ! -f "${PARTFILE}" ]; then
		echo "${PARTFILE} not found"
		exit 1
	fi
	tail -n +4 "${PARTFILE}" | head -n -2
}

buildObject() {
	local -r OBJECTFILE=${1}
	local DOC=$(getSchemaHeader)"\n"

	while IFS= read -r LINE; do
		if [[ ! $LINE =~ ^[[:space:]]*\#.*$ ]]; then
			if [ -f ${PARTDIR}/"${LINE}".json ]; then
				DOC+=$(getPart "${LINE}")",\n"
			else
				echo "Error: Part not found : ${LINE} in ${OBJECTFILE}"
			fi
		fi
	done < "${OBJECTFILE}"
	DOC="${DOC::-3}\n"

	DOC+=$(getSchemaFooter)
	local SCHEMAFILE=${SCHEMADIR}/$(basename "${OBJECTFILE}").json
	echo -e "${DOC}" > "${SCHEMAFILE}"
}

for OBJECTFILE in "${OBJECTSDIR}"/*; do
	buildObject "${OBJECTFILE}"
done
