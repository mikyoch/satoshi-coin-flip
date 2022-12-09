describe('Connect Wallet', () => {
  it('Successfully open\s wallet modal', () => {
    cy.visit('http://localhost:3000');
    cy.log(window.suiWallet) // is sui wallet present in window?
    // Search for connect button and click it
    cy.get('#connect-but').contains("Connect To Wallet").click();
    cy.get('#connect-but').click('bottomLeft', { force: true });
    cy.wait(1000);
    cy.get('#but-container').get("button>span").eq(1).click({ force: true });
    cy.wait(10000);
    cy.get('#logout-but').contains("Logout");
  });
})