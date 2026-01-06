describe('Login E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login')
  })

  it('shows validation errors for empty form', () => {
    cy.contains('Sign in').click()

    cy.contains('Email is required')
    cy.contains('Password is required')
    cy.contains('Please fix the errors in the form')
  })

  it('shows error for invalid email format', () => {
    cy.get('#email').type('invalid-email')
    cy.get('#password').type('123456')
    cy.contains('Sign in').click()

    cy.contains('Please enter a valid email')
  })

  it('logs in successfully with valid credentials', () => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest')

    cy.get('#email').type('bunthitnuong2805@gmail.com')
    cy.get('#password').type('motconvit')

    cy.contains('Sign in').click()

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)

    cy.contains('Login successful!')

    // Redirected to home page
    cy.url().should('eq', 'http://localhost:5173/')
  })

  it('shows error message for invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid email or password' }
    }).as('loginFail')

    cy.get('#email').type('wrong@example.com')
    cy.get('#password').type('wrongpassword')
    cy.contains('Sign in').click()

    cy.wait('@loginFail')
    cy.contains('Invalid email or password')
  })
})