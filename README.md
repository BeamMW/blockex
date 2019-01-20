# Beam Blockchain explorer 

Requirements:

1. Beam explorer node from https://github.com/BeamMW/beam
2. redis
3. Python Django 2 (backend)
4. Celery (for periodic blockchain updates)
5. Angular 6 with Angular Material (frontend)

# Running Beam Blockchain Explorer on local machine

TODO: Add instructions

# Deploying Beam Blockchain Explorer backend on Linux platform

## General Linux 

`sudo apt-get update`

`sudo apt-get install nginx python3-pip ufw python3-venv redis==2.10.6`

## Start beam-exlplorer node (testnet 3)

`./explorer-node --peer=52.76.251.61:8100`

## Pull lastest blockchain explorer code from git

`git clone https://github.com/BeamMW/blockex.git` or
`git pull origin master` to update


## Create virtual environment (first time only)

`mkdir ~/venvs`

`python3 -m venv ~/venvs/blockex`

`source ~/venvs/blockex/bin/activate` to activate the environment

`pip3 install -r requirements.txt`

`pip3 install gunicorn`

## Initialize Django environment (first time only)


`python3 manage.py makemigrations`

`python3 manage.py migrate`

`python3 manage.py collectstatic`

`sudo ufw allow 8000` (for testing only, open 8000 port in the firewall)

`python3 manage.py runserver 0.0.0.0:8000 --noreload &`

## Create gunicorn service

`nano /etc/systemd/system/gunicorn.service`

Paste following configurations:

    [Unit]
    Description=gunicorn service
    After=network.target
    
    [Service]
    User=root
    Group=www-data
    WorkingDirectory=/var/www/blockex/
    ExecStart=/root/venvs/blockex/bin/gunicorn --access-logfile - --workers 3 --bind unix:/var/www/blockex/blockex.sock blockex.wsgi:application
    
    [Install]
    WantedBy=multi-user.target



`sudo systemctl enable gunicorn.service`

`sudo systemctl start gunicorn.service`

`sudo systemctl status gunicorn.service`

To reload gunicorn after config change

`sudo systemctl daemon-reload`

`sudo systemctl restart gunicorn`

## Configure nginx

Add SSL certificate

1. `mkdir /root/keys` and `cd /root/keys`
2. Copy certificate file and key file to /root/keys
3. `chmod 400 ~/<certificate_key_name>.key`
4. Create conf.d/blockex.conf `nano /etc/nginx/conf.d/blockex.conf`
5. Paste following configurations:


     server {
       listen              443 ssl default_server;
       listen              [::]:443 ssl default_server ;
       server_name   t2-explorer.beam.mw;
     
       access_log /var/log/blockex-nginx-access.log;
       error_log /var/log/blockex-nginx-error.log;
     
       location / {
         proxy_pass http://127.0.0.1:8000;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
     
       location /static/ {
         alias /var/www/blockex/static/;
       }
     
         ssl_certificate     /root/keys/<certificate_name>.crt;
         ssl_certificate_key   /root/keys/<certificate_key_name>.key;
     }
      
To test configurations run: `sudo nginx -t`

To reload nginx after config init or change `sudo systemctl restart nginx`

`ufw sudo ufw allow 'Nginx Full'`

You are done with the backend!!!

# Explorer API documentation 

## Return coins in circulation mined value.

###schemes: 
- https

###host: 
mainnet-explorer.beam.mw

###basePath: 
/explorer 


URL

/coins_in_circulation_mined/?format=json

Success Response:

Code: 200 
Content: { coins_text_value }

## Return coins in circulation treasury value.

URL

/coins_in_circulation_treasury/?format=json

Success Response:

Code: 200 
Content: { coins_text_value }

## Return total coins in circulation value.

URL

/explorer/total_coins_in_circulation/?format=json

Success Response:

Code: 200 
Content: { coins_text_value }

## Return next treasury emission block height value.

URL

/next_treasury_emission_block_height/?format=json

Success Response:

Code: 200 
Content: { height_text_value }

## Return next treasury emission coin amount.

URL

/next_treasury_emission_coin_amount/?format=json

Success Response:

Code: 200 
Content: { coins_text_value }

## Return total emission value.

URL

/total_emission/?format=json

Success Response:

Code: 200 
Content: { total_emission_text_value }
