describe("UI Flow", () => {
  // describe("Connect Wallet", () => {});

  it("Successfully opens wallet modal", () => {
    cy.visit("http://localhost:3000");
    // Listen to POST /game/end
    cy.intercept("POST", "**/game/end").as("endGame");

    // check if sui wallet present
    cy.log(window.suiWallet); // is sui wallet present in window?
    // Search for connect button and click it
    cy.get("#connect-but").contains("Connect To Wallet").click();
    cy.wait(1000);
    // Click the first option from the wallets
    cy.get("#but-container").get("button>span").eq(1).click({ force: true });
    // Start a new game
    cy.get("#new-game-btn").click();
    cy.wait(10000);
    // Play Heads
    cy.get("#HEADS").click();
    cy.wait(10000);
    // Check that logout button exists
    cy.get("#logout-but").contains("Logout");
    // Check that the game has ended
    cy.wait("@endGame", { timeout: 100000 })
      .its("response.statusCode")
      .should("be.oneOf", [200]);
  });
});
