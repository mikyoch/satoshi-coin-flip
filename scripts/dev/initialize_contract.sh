#!/bin/bash   
while IFS= read -r line; do
    if echo $line | grep -q "PACKAGE_ADDRESS";
    then
        # var = $line
        PACKAGE=${line#*=}
        echo $PACKAGE
    fi
done < ../api/.env

BANKER=$(sui client active-address)
echo $BANKER
# 
# sui client call --package $PACKAGE --module single_player_satoshi --function initialize_house_data --args $BANKER coin pk --gas-budget 10000