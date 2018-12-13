# Blocks explorer backend deploy

## General Linux 

`sudo apt-get update`

`sudo apt-get install nginx python3-pip ufw python3-venv`

`pip install redis==2.10.6`
## Start beam-exlplorer node (testnet 3)

`./explorer-node --peer=52.76.251.61:8100`

## Pull lastest blockchain explorer code from git

`mkdir /var/www/blockex` (first time only)

`cd /var/www/blockex`

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