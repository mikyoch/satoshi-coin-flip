// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module satoshi_flip::test_single_player_satoshi {
    use std::debug::print;

    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::test_scenario;
    use sui::tx_context::TxContext;

    use satoshi_flip::single_player_satoshi::{Self};

    const EWrongPlayerTotal: u64 = 5;

    fun start(ctx: &mut TxContext, house: address, player: address) {
        // send coins to players
        let coinA = coin::mint_for_testing<SUI>(50000, ctx);
        let coinB = coin::mint_for_testing<SUI>(20000, ctx);
        transfer::transfer(coinA, house);
        transfer::transfer(coinB, player);
    }

    #[test]
    fun create_game() {
        //  let world = @0x1EE7; // needed only for beginning the test_scenario.
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // Call init function
        // let effects = test_scenario::next_tx(scenario, house);
        // {
        //     let ctx = test_scenario::ctx(scenario);
        //     single_player_satoshi::init(ctx);
        // };

        // print(&test_scenario::created(&effects));
        // House initializes the contract with PK.
        // let effects1 = test_scenario::next_tx(scenario, house);
        // {
            // let pk:vector<u8> = [149, 162,  84,  80,  27, 119,  51,  35, 158, 211,
            //         206, 196, 213, 103,  55, 151, 123, 208, 158, 222,
            //         136,  29, 138,  35,  69,  96, 232,  62,  85,  37,
            //         1, 122, 221,  59,  29, 204,  62, 171, 251, 133,
            //         225,  42,  65,  49, 177, 156,  37,  59];
            // let pk = x"95a254501b7733239ed3cec4d56737977bd09ede881d8a234560e83e5525017add3b1dcc3eabfb85e12a4131b19c253b";
            // single_player_satoshi::initialize_house_data(house_cap: HouseCap, coin: Coin<SUI>, public_key: vector<u8>, ctx: &mut TxContext)

        // }

        // print(&test_scenario::created(&effects1));

        // player creates the game.
        let effects2 = test_scenario::next_tx(scenario, player);
        {
            let coinA = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            single_player_satoshi::start_game(guess, coinA, ctx);
        };
        print(&test_scenario::created(&effects2));


        test_scenario::end(scenario_val);
    }

}