describe('Register E2E', () => {
  beforeEach(() => {
    cy.viewport(1280, 800) // prevent mobile layout issues
    cy.visit('http://localhost:5173/register')
  })

  const fillBaseForm = () => {
    cy.get('#name')
      .scrollIntoView()
      .should('be.visible')
      .type('Test User')

    cy.get('#email')
      .scrollIntoView()
      .should('be.visible')
      .type('test@example.com')

    cy.get('#phone')
      .scrollIntoView()
      .should('be.visible')
      .type('0123456789')
  }

  it('shows error when passwords do not match', () => {
    fillBaseForm()

    cy.get('#password')
      .scrollIntoView()
      .should('be.visible')
      .type('password123')

    cy.get('#confirmPassword')
      .scrollIntoView()
      .should('be.visible')
      .type('different123')

    cy.contains('Create My Account').click()

    cy.contains('Passwords do not match').should('be.visible')
  })

  it('registers successfully and navigates to verification page', () => {
    cy.intercept('POST', '/api/auth/register').as('registerRequest')

    fillBaseForm()

    cy.get('#password')
      .scrollIntoView()
      .type('password123')

    cy.get('#confirmPassword')
      .scrollIntoView()
      .type('password123')

    cy.contains('Create My Account').click()

    cy.wait('@registerRequest')
      .its('response.statusCode')
      .should('eq', 200)

    cy.contains('OTP sent to your email').should('be.visible')
    cy.url().should('include', '/verification-code')
  })

  it('shows backend error when email already exists', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: { message: 'Email already exists' }
    }).as('registerFail')

    fillBaseForm()

    cy.get('#password').type('password123')
    cy.get('#confirmPassword').type('password123')

    cy.contains('Create My Account').click()

    cy.wait('@registerFail')
    cy.contains('Email already exists').should('be.visible')
  })
})