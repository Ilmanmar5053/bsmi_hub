#!/bin/bash
set -e

# Setup Apache to listen on PORT provided by Railway (or fallback to 80)
export PORT=${PORT:-80}
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf

# Give correct permissions to storage and bootstrap cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create sqlite database if DB_CONNECTION is sqlite and file doesn't exist
if [ "$DB_CONNECTION" = "sqlite" ] && [ ! -f "$DB_DATABASE" ]; then
    touch "$DB_DATABASE"
    chown www-data:www-data "$DB_DATABASE"
    chmod 664 "$DB_DATABASE"
fi

echo "Running migrations..."
# Use || true to prevent crash if database is not configured yet
php artisan migrate --force || echo "Migration failed. Please check your database connection variables (DB_CONNECTION, DB_HOST, etc) in Railway Variables."

echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting Apache..."
exec "$@"
