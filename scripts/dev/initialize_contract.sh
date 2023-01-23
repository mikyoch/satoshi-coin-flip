#!/bin/bash   
while IFS= read -r line; do
    if echo $line | grep -q "PACKAGE_ADDRESS";
    then
        # select everything after an equals sign
        PACKAGE=${line#*=}
    fi
done < ../api/.env

HOUSE_CAP=$(cat house_cap.txt)
echo 'Selecting gas coin...'
# Select gas coin manaually so that fund coin obj and gas obj are not the same
GAS_COIN_ID=$(sui client gas --json | jq -r '[.[] | {id: .id.id, balance: .balance.value}] | map(select(.balance > 10000)) | min_by(.balance) | .id')
echo "- Selected gas coin $GAS_COIN_ID"
echo 'Selecting fund coin...'
FUND_COIN_ID=$(sui client gas --json | jq -r '[.[] | {id: .id.id, balance: .balance.value}] | max_by(.balance) | .id')
echo "- Selected fund coin $FUND_COIN_ID"
PUBLIC_KEY=$(cat pk.keystore)
echo 'Initializing house data...'
TX_EFFECTS=$(sui client call --package $PACKAGE --module single_player_satoshi --function initialize_house_data --args $HOUSE_CAP $FUND_COIN_ID $PUBLIC_KEY --gas-budget 10000 --gas $GAS_COIN_ID --json)
HOUSE_DATA_ID=$(echo $TX_EFFECTS | jq -r '.[].created | .[0].reference.objectId | select(. != null)')
echo $TX_EFFECTS >> 'tx.json'
echo "Writing house data id $HOUSE_DATA_ID in api/.env"
apiEnv='./../api/.env'
NEW_VAR="HOUSE_DATA="
NEW_VAR+=$HOUSE_DATA_ID
sed -i "s/HOUSE_DATA=.*/$NEW_VAR/" $apiEnv