describe('Homepage UI', () => {
  it('shows Explore Now button and navigates to car listing', () => {
    cy.visit('http://localhost:5173/')

    cy.contains('button', 'Explore Now')
      .should('be.visible')
      .click()

    cy.url().should('include', '/carlisting')
  })
})
