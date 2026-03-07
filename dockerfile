FROM php:8.2-fpm

RUN apt-get update && apt-get install -y nginx

COPY . /var/www/html/

RUN echo "server {\n\
    listen 80;\n\
    root /var/www/html;\n\
    index index.php index.html;\n\
    client_max_body_size 100M;\n\
    location / {\n\
        try_files \$uri \$uri/ =404;\n\
    }\n\
    location ~ \.php$ {\n\
        fastcgi_pass 127.0.0.1:9000;\n\
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;\n\
        include fastcgi_params;\n\
    }\n\
}" > /etc/nginx/sites-enabled/default

RUN mkdir -p /run/php

EXPOSE 80

CMD php-fpm8.2 -D && nginx -g 'daemon off;'
