// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module satoshi_flip::single_player_satoshi {
    // imports
    use std::vector;

    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::bls12381::bls12381_min_pk_verify;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    use satoshi_flip::satoshi_flip::{Self};

    // consts 
    // do we care about cancelation in this version?
    const EPOCHS_CANCEL_AFTER: u64 = 7;
    const STAKE: u64 = 5000;

    // errors
    const EInvalidBlsSig: u64 = 10;
    // const EInvalidPlayer: u64 = 11;
    const ECallerNotHouse: u64 = 12;
    const ECanNotCancel: u64 = 13;
    const EInvalidGuess: u64 = 14;
    const EInsufficientBalance: u64 = 15;
    const EGameHasAlreadyBeenCanceled: u64 = 16;
    const EInsufficientHouseBalance: u64 = 17;
    // const ECoinBalanceNotEnough: u64 = 9; // reserved from satoshi_flip.move

    // structs
    struct Outcome has key {
        id: UID,
        guess: u8,
        player_won: bool,
        message: vector<u8>
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
        user_randomness: vector<u8>
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

    // --------------- Outcome Accessors ---------------
    public fun outcome_guess(outcome: &Outcome): u8 {
        outcome.guess
    }

    public fun player_won(outcome: &Outcome): bool {
        outcome.player_won
    }

    // --------------- HouseData Accessors ---------------
    public fun balance(house_data: &HouseData): u64 {
        balance::value(&house_data.balance)
    }

    public fun house(house_data: &HouseData): address {
        house_data.house
    }

    public fun public_key(house_data: &HouseData): vector<u8> {
        house_data.public_key
    }

    // --------------- Game Accessors ---------------
    public fun guess_placed_epoch(game: &Game): u64 {
        game.guess_placed_epoch
    }

    public fun stake(game: &Game): u64 {
        balance::value(&game.stake)
    }

    public fun game_guess(game: &Game): u8 {
        game.guess
    }

    public fun player(game: &Game): address {
        game.player
    }

    public fun player_randomness(game: &Game): vector<u8> {
        game.user_randomness
    }

    // functions
    public entry fun initialize_house_data(house_cap: HouseCap, coin: Coin<SUI>, public_key: vector<u8>, ctx: &mut TxContext) {
        assert!(coin::value(&coin) > 0, EInsufficientBalance);
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
    public entry fun top_up(house_data: &mut HouseData, coin: Coin<SUI>, _: &mut TxContext) {        
        let balance = coin::into_balance(coin);
        balance::join(&mut house_data.balance, balance);
    }

    // House can withdraw the entire balance of the house
    public entry fun withdraw(house_data: &mut HouseData, ctx: &mut TxContext) {
        // only the house address can withdraw funds
        assert!(tx_context::sender(ctx) == house_data.house, ECallerNotHouse);

        let total_balance = balance::value(&house_data.balance);
        let coin = coin::take(&mut house_data.balance, total_balance, ctx);
        transfer::transfer(coin, house_data.house);
    }

    public entry fun start_game(guess: u8, user_randomness: vector<u8>, coin: Coin<SUI>, house_data: &mut HouseData, ctx: &mut TxContext) {
        // Ensure that guess is either 0 or 1
        assert!(guess == 1 || guess == 0, EInvalidGuess);
        // Ensure that the house has enough balance to play for this game
        assert!(balance(house_data) >= STAKE, EInsufficientHouseBalance);
        // get the user coin and convert it into a balance
        assert!(coin::value(&coin) >= STAKE, EInsufficientBalance);
        let stake_coin = satoshi_flip::give_change(coin, STAKE, ctx);
        let stake = coin::into_balance(stake_coin);
        // get the house balance
        let house_stake = balance::split(&mut house_data.balance, STAKE);
        balance::join(&mut stake, house_stake);

        let new_game = Game {
            id: object::new(ctx),
            guess_placed_epoch: tx_context::epoch(ctx),
            stake,
            guess,
            player: tx_context::sender(ctx),
            user_randomness
        };

        transfer::share_object(new_game);
    }

    // this is the old play + end_game function combined
    // Anyone can end the game, if you didnt pass the right sig just abort
    public entry fun play(game: &mut Game, bls_sig: vector<u8>, house_data: &mut HouseData, ctx: &mut TxContext) {
        // Step 1: Check the bls signature, if its invalid, house loses
        let messageVector = *&object::id_bytes(game);
        // let Game {id, guess_placed_epoch: _, user_randomness, stake, guess, player} = game;
        vector::append(&mut messageVector, player_randomness(game));
        let is_sig_valid = bls12381_min_pk_verify(&bls_sig, &house_data.public_key, &messageVector);
        assert!(is_sig_valid, EInvalidBlsSig);
        // Step 2: Determine winner
        let first_byte = vector::borrow(&bls_sig, 0);
        let player_won: bool = game.guess == *first_byte % 2;

        // Step 3: Distribute funds based on result

        if(player_won){
            // Step 3.a: If player wins transfer the game balance as a coin to the player
            let total_value =  stake(game);
            let coin = coin::take(&mut game.stake, total_value, ctx);
            transfer::transfer(coin, game.player);
        } else {
            // Step 3.b: If house wins, then add the game stake to the house_data.house_balance
            let total_value =  stake(game);
            let coin = coin::take(&mut game.stake, total_value, ctx);
            balance::join(&mut house_data.balance, coin::into_balance(coin));
        };

        let outcome = Outcome {
            id: object::new(ctx),
            player_won,
            guess: game.guess,
            message: messageVector
        };

        transfer::share_object(outcome);
    }

    public entry fun dispute_and_win(game: &mut Game, ctx: &mut TxContext) {
        let caller_epoch = tx_context::epoch(ctx);
        // Ensure that minimum epochs have passed before user can cancel
        assert!(game.guess_placed_epoch + EPOCHS_CANCEL_AFTER <= caller_epoch, ECanNotCancel);
        let total_balance = balance::value(&game.stake);
        assert!(total_balance > 0, EGameHasAlreadyBeenCanceled);
        let coin = coin::take(&mut game.stake, total_balance, ctx);
        transfer::transfer(coin, game.player);
    }

}