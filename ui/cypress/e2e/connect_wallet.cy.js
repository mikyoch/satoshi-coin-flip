describe('Connect Wallet', () => {
  it('Successfully open\s wallet modal', () => {
    cy.visit('http://localhost:3000');
    cy.log(window.suiWallet) // is sui wallet present in window?
    // Search for connect button and click it
    cy.get('#connect-btn').contains("Connect To Wallet").click();
    cy.get('#connect-btn').click('bottomLeft', { force: true });
    cy.wait(1000);
    cy.get('#wallet-btn-container').get("button>span").eq(1).click({ force: true });
    cy.wait(10000);
    cy.get('#logout-btn').contains("Logout");
  });
})