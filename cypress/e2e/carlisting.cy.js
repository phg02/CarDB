describe('Car Listing UI', () => {
  it('shows the filter component', () => {
    cy.visit('http://localhost:5173/carlisting')

    cy.get('body').should('contain.text', 'Filters')   // fallback
  })
})
