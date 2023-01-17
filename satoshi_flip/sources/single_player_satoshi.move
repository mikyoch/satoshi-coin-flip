// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module satoshi_flip::single_player_satoshi {
    // imports
    use std::vector;

    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::bls12381::bls12381_min_sig_verify;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    use satoshi_flip::satoshi_flip::{Self};

    // consts 
    // do we care about cancelation in this version?
    const EpochsCancelAfter: u64 = 7;
    const STAKE: u64 = 5000;

    // errors
    const EInvalidBlsSig: u64 = 10;
    const EInvalidPlayer: u64 = 11;
    const ECallerNotHouse: u64 = 12;
    // const ECoinBalanceNotEnough: u64 = 9; // reserved from satoshi_flip.move

    // structs
    struct Outcome has key {
        id: UID,
        guess: u8,
        player_won: bool
    }

    struct HouseData has key {
        id: UID,
        balance: Balance<SUI>,
        house: address,
        public_key: vector<u8>
    }

    struct Game has key {
        id: UID,
        guess_placed_epoch: u64,
        stake: Balance<SUI>,
        guess: u8,
        player: address,
    }

    struct HouseCap has key {
        id: UID
    }
    
    // constructor
    fun init(ctx: &mut TxContext) {
        let house_cap = HouseCap {
            id: object::new(ctx)
        };

        transfer::transfer(house_cap, tx_context::sender(ctx))
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }

    // functions
    public entry fun initialize_house_data(house_cap: HouseCap, coin: Coin<SUI>, public_key: vector<u8>, ctx: &mut TxContext) {
        let house_data = HouseData {
            id: object::new(ctx),
            balance: coin::into_balance(coin),
            house: tx_context::sender(ctx),
            public_key
        };

        // initializer function that should only be called once and by the creator of the contract
        let HouseCap { id } = house_cap;
        object::delete(id);

        transfer::share_object(house_data);
    }

    // House can have multiple accounts so giving the contract balance is not limited
    public entry fun top_up(house_data: &mut HouseData, coin: Coin<SUI>, ctx: &mut TxContext) {
        let balance = coin::into_balance(coin);
        balance::join(&mut house_data.balance, balance);
    }

    public entry fun withdraw(house_data: &mut HouseData, ctx: &mut TxContext) {
        // only the house address can withdraw funds
        assert!(tx_context::sender(ctx) == house_data.house, ECallerNotHouse);

        let total_balance = balance::value(&house_data.balance);
        let balance = balance::split(&mut house_data.balance, total_balance);
        let coin = coin::from_balance(balance, ctx);
        transfer::transfer(coin, house_data.house);
    }

    public entry fun start_game(guess: u8, coin: Coin<SUI>, ctx: &mut TxContext) {

        // get the user coin
        // @todo: check that there is enough balance
        let stake_coin = satoshi_flip::give_change(coin, STAKE, ctx);
        let stake = coin::into_balance(stake_coin);

        let new_game = Game {
            id: object::new(ctx),
            guess_placed_epoch: tx_context::epoch(ctx),
            stake,
            guess,
            player: tx_context::sender(ctx)
        };

        transfer::transfer(new_game, tx_context::sender(ctx));
    }

    // this is the old play + end_game function combined
    public entry fun play(game: Game, bls_sig: vector<u8>, house_data: &mut HouseData, ctx: &mut TxContext) {
        // Ensure tx sender is the same as game.player
        assert!(game.player == tx_context::sender(ctx), EInvalidPlayer);

        // Step 1: Check the bls signature, if its invalid abort
        let is_sig_valid = bls12381_min_sig_verify(&bls_sig, &house_data.public_key, &object::id_bytes(&game));
        assert!(!is_sig_valid, EInvalidBlsSig);

        // Step 2: Determine winner
        let first_byte = vector::borrow(&bls_sig, 0);
        let player_won: bool = game.guess == *first_byte % 2;

        // Step 3: Game destruction Distribute funds based on result
        let Game {id, guess_placed_epoch: _, stake, guess, player} = game;
        object::delete(id);
        if(player_won) {
            // Step 3.b: If player wins, get the stake from the house and merge it inside the games stake. Then transfer the balance to the player
            // @todo: check that there is enough balance. What if the user funds are taken but the house doesn't have enough balance?
            let house_stake = balance::split(&mut house_data.balance, STAKE);
            balance::join(&mut stake, house_stake);

            let coin: Coin<SUI> = coin::from_balance(stake, ctx);
            transfer::transfer(coin, player);
            // @todo: create an outcome object here or emit an event?
        }else{
            // Step 3.c: If house wins, then add the game stake to the house_data.house_balance
            balance::join(&mut house_data.balance, stake);
        };

        let outcome = Outcome {
            id: object::new(ctx),
            player_won,
            guess
        };

        transfer::share_object(outcome);
    }

}