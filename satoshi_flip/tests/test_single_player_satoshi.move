// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module satoshi_flip::test_single_player_satoshi {
    // use std::debug::print;

    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::test_scenario;
    use sui::tx_context::TxContext;

    use satoshi_flip::single_player_satoshi::{Self, Game, HouseCap, HouseData, Outcome};
    use satoshi_flip::single_player_satoshi::{ECallerNotHouse, EInvalidGuess, EInsufficientBalance, EInvalidPlayer, ECanNotCancel, EGameHasAlreadyBeenCanceled};

    const EInvalidBlsSig: u64 = 7;
    const EWrongWinner: u64 = 6;
    const EWrongPlayerTotal: u64 = 5;
    const EWrongCoinChange: u64 = 4;
    const EWrongWithdrawAmount: u64 = 3;
    const EWrongHouseBalanceAfterFund: u64 = 2;
    const EWrongHouseBalanceAfterWin: u64 = 1;
    const EWrongHouseBalanceAfterLoss: u64 = 0;

    fun start(ctx: &mut TxContext, house: address, player: address) {
        // send coins to players
        let coinA = coin::mint_for_testing<SUI>(50000, ctx);
        let coinB = coin::mint_for_testing<SUI>(20000, ctx);
        transfer::transfer(coinA, house);
        transfer::transfer(coinB, player);
    }

    // House's public key
    const PK: vector<u8> = vector<u8>[
        167, 231, 90, 249, 221,  77, 134, 138,  65, 173,
        47,  90, 91,   2,  29, 101,  62,  49,   8,  66,
        97, 114, 79, 180,  10, 226, 241, 177, 195,  28,
        119, 141, 59, 148, 100,  80,  45,  89, 156, 246,
        114,   7, 35, 236,  92, 104, 181, 157
    ];

    // Signed object id 9296117f3c9e0a897686ff76df23a12f8282e8ce + random hex bytes (dec: 1975659 hex: 1e256b) guess with house's private key
    const BLS_SIG: vector<u8> = vector<u8>[
        180,   7, 165,  76,  75,  92, 110, 230, 140, 221, 158,  92,
            4,  41, 160,  52,  78, 245, 172, 170, 250,  59, 159,  77,
        232, 226, 122, 118, 189, 206,  35,  35,   8,  85, 139, 153,
        214, 144,  22, 153, 213,  67,  16, 206,  19, 162, 156, 154,
            4, 110, 185, 185,  34, 126, 183, 137, 116,  93,  12, 210,
        152, 255, 127,  25,  82, 163, 152, 164, 172,  93,  21,  43,
        177, 203, 161,  63, 210,  44,  24, 126, 182, 151, 218,  61,
            15, 204, 229, 144, 117,  80, 149, 136,  58,   8,  72, 221
    ];

    const INVALID_BLS_SIG: vector<u8> = vector<u8>[
        129, 108, 254,  61, 148, 134, 105, 218, 212,  49, 136, 118,
        224, 223, 148,  83, 245, 230, 113, 248,  33, 169, 169,  78,
        108,  67, 144, 229, 243,  47, 248, 249, 172, 175, 181,  15,
        213, 223, 198,  85,  69,  15,  81, 234, 141, 240, 196,  88,
        3, 152,  64, 226, 101, 248, 157, 192, 180,  77, 156, 209,
        233,  93, 106,  87, 205,  90,  97, 181, 218,   6, 108, 246,
        17,  39, 197, 223,  36,  36,  86, 143, 130, 147, 212, 213,
        184,  38, 252, 169,  20,  58, 226, 180, 174, 222,  57, 171
    ];

    #[test]
    fun house_wins() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);

            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);

        };

        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 1;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // print(&player_coin);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // player ends the game
        test_scenario::next_tx(scenario, house);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let ctx = test_scenario::ctx(scenario);
            
            single_player_satoshi::play(&mut game, BLS_SIG, &mut house_data, ctx);
            
            test_scenario::return_shared(house_data);
            test_scenario::return_shared(game);
        };

        // check that outcome and house data values are correct
        test_scenario::next_tx(scenario, house);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            // print(&house_data);
            assert!(single_player_satoshi::balance(&house_data) == 55000, EWrongHouseBalanceAfterWin);
            test_scenario::return_shared(house_data);
            let outcome = test_scenario::take_shared<Outcome>(scenario);
            assert!(single_player_satoshi::player_won(&outcome) == false, EWrongWinner);
            // print(&outcome);
            test_scenario::return_shared(outcome);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun player_wins() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);

            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);

        };

        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // print(&player_coin);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // house ends the game
        test_scenario::next_tx(scenario, house);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            // print(&house_data);
            // print(&game);
            let ctx = test_scenario::ctx(scenario);
            
            single_player_satoshi::play(&mut game, BLS_SIG, &mut house_data, ctx);
            
            test_scenario::return_shared(house_data);
            test_scenario::return_shared(game);
        };

        // check that outcome and house data values are correct
        test_scenario::next_tx(scenario, house);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            // print(&house_data);
            assert!(single_player_satoshi::balance(&house_data) == 45000, EWrongHouseBalanceAfterLoss);
            test_scenario::return_shared(house_data);
            let outcome = test_scenario::take_shared<Outcome>(scenario);
            assert!(single_player_satoshi::player_won(&outcome), EWrongWinner);
            // print(&outcome);
            test_scenario::return_shared(outcome);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun house_invalid_bls_sig() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);

            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);

        };

        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 1;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // print(&player_coin);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // player ends the game
        test_scenario::next_tx(scenario, house);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            // print(&house_data);
            // print(&game);
            let ctx = test_scenario::ctx(scenario);
            
            single_player_satoshi::play(&mut game, INVALID_BLS_SIG, &mut house_data, ctx);
            
            assert!(single_player_satoshi::balance(&house_data) == 45000, EWrongHouseBalanceAfterLoss);
            test_scenario::return_shared(house_data);
            test_scenario::return_shared(game);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun house_withdraws() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);

            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);

        };

        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 1;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // player ends the game
        test_scenario::next_tx(scenario, house);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            // print(&house_data);
            // print(&game);
            let ctx = test_scenario::ctx(scenario);
            
            single_player_satoshi::play(&mut game, BLS_SIG, &mut house_data, ctx);
            
            test_scenario::return_shared(house_data);
            test_scenario::return_shared(game);
        };

        // check that outcome and house data values are correct
        test_scenario::next_tx(scenario, house);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            // print(&house_data);
            test_scenario::return_shared(house_data);
            let outcome = test_scenario::take_shared<Outcome>(scenario);
            assert!(single_player_satoshi::player_won(&outcome) == false, EWrongWinner);
            test_scenario::return_shared(outcome);
        };

        // house withdraws funds
        test_scenario::next_tx(scenario, house);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::withdraw(&mut house_data, ctx);
            test_scenario::return_shared(house_data);
        };

        // check that the HouseData balance has been depleted and that the house's account has been credited
        test_scenario::next_tx(scenario, house);
        {
            let withdraw_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            assert!(coin::value(&withdraw_coin) == 55000, EWrongWithdrawAmount);
            test_scenario::return_to_sender(scenario, withdraw_coin);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun house_top_ups() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);
            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);
        };

        // create fund coin & send it to house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            let fund_coin = coin::mint_for_testing<SUI>(50000, ctx);
            transfer::transfer(fund_coin, house);
        };

        // top up with fund coin
        test_scenario::next_tx(scenario, house);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let owned_fund_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::top_up(&mut house_data, owned_fund_coin, ctx);
            let house_balance = single_player_satoshi::balance(&house_data);
            assert!(house_balance == 100000, EWrongHouseBalanceAfterFund);
            test_scenario::return_shared(house_data);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun player_cancels_game() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);
            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);
        };

        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // print(&player_coin);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // Simulate epoch passage
        test_scenario::next_tx(scenario, player);
        {
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
        };

        // Player cancels the game
        test_scenario::next_tx(scenario, player);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::cancel_game(&mut game, ctx);
            test_scenario::return_shared(game);
        };

        // Check that player got their money back
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            assert!(coin::value(&player_coin) == 5000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidGuess)]
    fun player_invalid_guess() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);

            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);

        };

        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 5;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInsufficientBalance)]
    fun player_insufficient_balance() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);

            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);

        };

        // Create coin with not enough balance to play
        test_scenario::next_tx(scenario, player);
        {
            let ctx = test_scenario::ctx(scenario);
            let small_coin = coin::mint_for_testing<SUI>(2000, ctx);
            transfer::transfer(small_coin, player);
        };

        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ECallerNotHouse)]
    fun caller_not_house_on_play() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);

            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);

        };

        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // print(&player_coin);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // wrong address tries to end the game
        test_scenario::next_tx(scenario, player);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            // print(&house_data);
            // print(&game);

            let ctx = test_scenario::ctx(scenario);
            
            single_player_satoshi::play(&mut game, BLS_SIG, &mut house_data, ctx);
            
            test_scenario::return_shared(house_data);
            test_scenario::return_shared(game);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidPlayer)]
    fun caller_not_player_on_cancel() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);
            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);
        };


        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // print(&player_coin);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // Simulate epoch passage
        test_scenario::next_tx(scenario, player);
        {
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
        };

        // Invalid caller tries to cancel game (trying house here)
        test_scenario::next_tx(scenario, player);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            test_scenario::next_tx(scenario, house);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::cancel_game(&mut game, ctx);
            test_scenario::return_shared(game);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ECanNotCancel)]
    fun player_cancel_epochs_did_not_pass() {
       let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);
            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);
        };


        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // print(&player_coin);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // Player cancels the game
        test_scenario::next_tx(scenario, player);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::cancel_game(&mut game, ctx);
            test_scenario::return_shared(game);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EGameHasAlreadyBeenCanceled)]
    fun player_cancel_already_canceled() {
       let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);
            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);
        };


        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // print(&player_coin);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // Simulate epoch passage
        test_scenario::next_tx(scenario, player);
        {
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
            test_scenario::next_epoch(scenario, player);
        };

        // Player cancels the game
        test_scenario::next_tx(scenario, player);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::cancel_game(&mut game, ctx);
            test_scenario::return_shared(game);
        };

        // Player tries to cancel again
        test_scenario::next_tx(scenario, player);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::cancel_game(&mut game, ctx);
            test_scenario::return_shared(game);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ECallerNotHouse)]
    fun caller_not_house_on_withdraw() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);

            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);

        };

        // player creates the game.
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            let user_randomness = x"1e256b";
            single_player_satoshi::start_game(guess, user_randomness, player_coin, ctx);
        };

        // Check that player got change
        test_scenario::next_tx(scenario, player);
        {
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // print(&player_coin);
            assert!(coin::value(&player_coin) == 15000, EWrongCoinChange);
            test_scenario::return_to_sender(scenario, player_coin);
        };

        // player ends the game
        test_scenario::next_tx(scenario, house);
        {
            let game = test_scenario::take_shared<Game>(scenario);
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            // print(&house_data);
            // print(&game);
            let ctx = test_scenario::ctx(scenario);
            
            single_player_satoshi::play(&mut game, BLS_SIG, &mut house_data, ctx);
            
            test_scenario::return_shared(house_data);
            test_scenario::return_shared(game);
        };

        // check that outcome and house data values are correct
        test_scenario::next_tx(scenario, house);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            // print(&house_data);
            test_scenario::return_shared(house_data);
            let outcome = test_scenario::take_shared<Outcome>(scenario);
            // print(&outcome);
            test_scenario::return_shared(outcome);
        };

        // Non house address tries to withdraw
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::withdraw(&mut house_data, ctx);
            test_scenario::return_shared(house_data);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInsufficientBalance)]
    fun house_wrong_initialization() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function, transfer HouseCap to the house
        test_scenario::next_tx(scenario, house);
        {
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::init_for_testing(ctx);
        };

        // create a 0 balance coin
        test_scenario::next_tx(scenario, house);
        {
            let zero_coin = coin::mint_for_testing<SUI>(0, test_scenario::ctx(scenario));
            transfer::transfer(zero_coin, house);
        };

        // House initializes the contract with PK.
        test_scenario::next_tx(scenario, house);
        {
            let house_cap = test_scenario::take_from_sender<HouseCap>(scenario);

            let house_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            single_player_satoshi::initialize_house_data(house_cap, house_coin, PK, ctx);
        };

        test_scenario::end(scenario_val);
    }
    
}