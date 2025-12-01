import React from 'react'
import { LoginForm } from '../components/login/LoginForm'
import { LoginWelcomeCard } from '../components/login/LoginWelcomeCard'
export const Login = () => {
  return (
    <div className="max-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="flex justify-center lg:justify-end">
            <LoginForm />
          </div>
          <div className="flex justify-center lg:justify-start">
            <LoginWelcomeCard />
          </div>
        </div>
      </main>
    </div>
  )
}
