describe('Connect Wallet', () => {

  it('Joins page', () => {
    cy.visit('http://localhost:3000')
  });

  it('Looks for Connect to Wallet button', () => {
    cy.get('#connect-but').contains("Connect To Wallet");
  });

  it('Press the connect to wallet button', () => {
    cy.get('#connect-but').click('bottomLeft', {force: true});
    cy.get('#but-container').get("button").contains("Connect");
    cy.get('#but-container').get("button>span").eq(1).click({force: true});
    cy.get('#logout-but').contains("Logout");
  })
})