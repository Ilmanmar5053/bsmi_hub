#!/bin/bash

# Setup Apache to listen on PORT provided by Railway dynamically
export PORT=${PORT:-80}
echo "Listen ${PORT}" > /etc/apache2/ports.conf
cat > /etc/apache2/sites-available/000-default.conf <<EOF
<VirtualHost *:${PORT}>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html/public
    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined
    <Directory /var/www/html/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF

# Give correct permissions to storage and bootstrap cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Create sqlite database if DB_CONNECTION is sqlite and file doesn't exist
if [ "$DB_CONNECTION" = "sqlite" ] && [ ! -f "$DB_DATABASE" ]; then
    touch "$DB_DATABASE"
    chown www-data:www-data "$DB_DATABASE" || true
    chmod 664 "$DB_DATABASE" || true
fi

echo "Running migrations..."
php artisan migrate --force || echo "Migration failed. (Ignore if no DB is connected yet)"

echo "Caching configuration..."
php artisan config:cache || echo "Config cache failed"
php artisan route:cache || echo "Route cache failed"
php artisan view:cache || echo "View cache failed"

echo "Ensuring only prefork MPM is loaded..."
rm -f /etc/apache2/mods-enabled/mpm_event.conf
rm -f /etc/apache2/mods-enabled/mpm_event.load
rm -f /etc/apache2/mods-enabled/mpm_worker.conf
rm -f /etc/apache2/mods-enabled/mpm_worker.load

echo "Starting Apache..."
exec "$@"
