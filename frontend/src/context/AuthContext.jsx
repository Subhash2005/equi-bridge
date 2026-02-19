import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('equibridge_user')
        return stored ? JSON.parse(stored) : null
    })

    const login = (userData) => {
        setUser(userData)
        localStorage.setItem('equibridge_user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('equibridge_user')
        localStorage.removeItem('equibridge_student')
        localStorage.removeItem('equibridge_worker')
        localStorage.removeItem('equibridge_disability')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
