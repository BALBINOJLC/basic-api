#!/bin/bash

# Variables
# Domain Staging: api.signatures.tufirma.gux.cl
ip=************
keyPair=**********.pem
dirStaging="/home/ubuntu/api-staging"
dirProduction="/home/ubuntu/api-production"
connection="ssh -i $keyPair ubuntu@$ip"
distZip="dist.zip"

# Function: Deploy staging
f-deploy-staging() {
	rm $distZip
	cp -v package.json ./dist/package.json
	cp -v process.staging.json ./dist/process.staging.json
	cp -v firebase-admin.json ./dist/firebase-admin.json
	zip -r $distZip dist/*
	scp -i ~/.ssh/${keyPair} $distZip ubuntu@${ip}:/home/ubuntu/

	ssht="unzip $distZip"
	ssht+=" && sudo rm -Rf ${dirStaging}/*"
	ssht+=" && mkdir -p ${dirStaging}"
	ssht+=" && sudo mv dist $dirStaging/"
	ssht+=" && sudo mv ${dirStaging}/dist/* ${dirStaging}"
	ssht+=" && sudo chown -R $USER $dirStaging"
	ssht+=" && cd /home/ubuntu/"
	ssht+=" && rm $distZip"
	ssht+=" && cd ${dirStaging}"
	ssht+=" && sudo rm -Rf dist"
	ssht+=" && sudo chown -R $USER $dirStaging"
	ssht+=" && yarn"
}

# Function: Deploy production api.teams.staging.sicrux.app
f-deploy-production() {

	rm $distZip
	cp -v package.json ./dist/package.json
	cp -v process.json ./dist/process.json
	cp -v firebase-admin.json ./dist/firebase-admin.json
	zip -r $distZip dist/*
	scp -i ~/.ssh/${keyPair} $distZip ubuntu@${ip}:/home/ubuntu/

	ssht="unzip $distZip"
	ssht+=" && sudo rm -Rf ${dirProduction}/*"
	ssht+=" && sudo mv dist ${dirProduction}/"
	ssht+=" && sudo mv ${dirProduction}/dist/* ${dirProduction}"
	ssht+=" && cd /home/ubuntu/"
	ssht+=" && rm $distZip"
	ssht+=" && cd ${dirProduction}"
	ssht+=" && sudo rm -Rf dist"
	ssht+=" && yarn"

}

# Main Script
while [[ "$#" -gt 0 ]]; do
	case $1 in
	-d | --deploy)
		deploy="$2"
		;;
	-s | --send)
		send="send=$2"
		;;
	esac
	shift
done

case "$deploy" in
"staging")
	f-deploy-staging
	;;
"production")
	f-deploy-production
	;;
esac

if [ "$deploy" == "production" ] || [ "$deploy" == "staging" ]; then
	ssh -t -i ~/.ssh/${keyPair} ubuntu@${ip} "$ssht"
fi
