#!/bin/sh

#path = src/@base
cd src/@base
git checkout main
git pull origin main
cd ../..
#path = src/@modules/userauth
cd src/@modules/userauth
git checkout main
git pull origin main
cd ../../..

#path = src/@modules/ecommerce
cd src/@modules/ecommerce
git checkout main
git pull origin main
cd ../../..
#path = src/@modules/transbank
cd src/@modules/transbank
git checkout main
git pull origin main
cd ../../..

