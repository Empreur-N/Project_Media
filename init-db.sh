#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE user_db;
    CREATE DATABASE content_db;
    CREATE DATABASE comment_db;
    CREATE DATABASE notification_db;
    CREATE DATABASE live_db;
    CREATE DATABASE ad_db;
EOSQL
