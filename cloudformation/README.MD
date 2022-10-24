## Para recuperar la clave privada en texto sin formato

-   Utilice el siguiente comando para recuperar la clave privada en texto sin formato del Almacén de parámetros.

`aws ssm get-parameter --name /ec2/keypair/key-0ae06946d8085c4e0 --region us-east-1 --with-decryption --output text --query Parameter.Value --profile tryit`

## Get Public Key Public RSA

`aws ec2 describe-key-pairs --key-names aws-key-pair-us-east-1-devolta --include-public-key --profile devolta`

## Fix Error pm2

`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
