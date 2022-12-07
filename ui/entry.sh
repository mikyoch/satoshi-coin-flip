FILE=./.env.local
if ! test -f "$FILE"; then
    touch .env.local
    echo "NEXT_PUBLIC_API_BASE_URL='$NEXT_PUBLIC_API_BASE_URL'" | cat >> $FILE
    echo "NEXT_PUBLIC_PACKAGE='$NEXT_PUBLIC_PACKAGE'" | cat >> $FILE
fi
npm run start