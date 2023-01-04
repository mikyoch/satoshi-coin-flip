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

        let scenario_val = test_scenario::begin(player);
        let scenario = &mut scenario_val;
        {
            start(test_scenario::ctx(scenario), house, player);
        };

        // player creates the game.
        let effects = test_scenario::next_tx(scenario, house);
        {
            let coinA = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let ctx = test_scenario::ctx(scenario);
            let guess = 0;
            single_player_satoshi::start_game(guess, coinA, ctx);
        };

        print(&test_scenario::created(&effects));

        // check that house got back the change
        test_scenario::next_tx(scenario, house);
        {
            let coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            assert!(coin::value(&coin) == 45000, EWrongPlayerTotal);
            test_scenario::return_to_sender(scenario, coin);

        };

        test_scenario::end(scenario_val);
    }

}