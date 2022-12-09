describe('Connect Wallet', () => {
  it('Successfully open\s wallet modal', () => {
    cy.visit('http://localhost:3000');
    // Search for connect button and click it
    cy.get('#connect-but').contains("Connect To Wallet").click();
    // cy.get('#connect-but').click('bottomLeft', {force: true});
    // cy.get('#but-container').get("button").contains("Connect");
    // cy.get('#but-container').get("button>span").eq(1).click({force: true});
    //   cy.get('#logout-but').contains("Logout");
  });
})