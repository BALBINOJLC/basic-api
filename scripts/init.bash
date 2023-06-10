#!/bin/bash

# update 
sudo apt-get update

# Install nestjs Cli
npm install -g @nestjs/cli

# Install yarn
sudo apt remove cmdtest
sudo apt remove yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update
sudo apt-get install yarn -y

# Install Dependencies
exec yarn install -y
# Create folder dist if not exists
mkdir -p dist
# Dounload remotes dependencies
exec yarn update:remotes