FILE=./.env.local
if ! test -f "$FILE"; then
    touch .env.local
    echo "NEXT_PUBLIC_API_BASE_URL='$NEXT_PUBLIC_API_BASE_URL'" | cat >> .env.local
    echo "NEXT_PUBLIC_PACKAGE='$NEXT_PUBLIC_PACKAGE'" | cat >> .env.local
fi
npm run start