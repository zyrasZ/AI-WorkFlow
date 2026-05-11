import React, { useState, useEffect, createContext, useContext } from 'react'
import { apiClient, handleApiError, hasValidAuth, clearAuth, getStoredUser } from '../lib/api'

const AuthContext = createContext(null)

/**
 * Auth Provider Component
 * Wrap your app with this to provide authentication context
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check authentication on mount - ONLY ONCE
  useEffect(() => {
    checkAuth()
  }, []) // Empty dependency array ensures this runs only once

  // Listen for auth changes (e.g., after OAuth callback)
  useEffect(() => {
    const handleAuthChange = (event) => {
      console.log('🔄 Auth changed event received:', event.detail)
      const userData = event.detail
      setUser(userData)
      setError(null)
      setLoading(false)
    }

    window.addEventListener('auth-changed', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange)
    }
  }, [])

  /**
   * Check if user is authenticated
   */
  async function checkAuth() {
    try {
      setLoading(true)
      
      // Check if we have a token first
      const token = localStorage.getItem('office_weave_token')
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }
      
      // Try to restore from localStorage first (faster, no network)
      const storedUser = getStoredUser()
      if (storedUser) {
        console.log('Restored user from localStorage:', storedUser)
        setUser(storedUser)
        setLoading(false)
        return
      }
      
      // If no stored user but have token, fetch from backend
      try {
        const response = await apiClient.getCurrentUser()
        console.log('Auth check successful:', response.data)
        const userData = response.data || response
        localStorage.setItem('user_data', JSON.stringify(userData))
        setUser(userData)
        setError(null)
      } catch (err) {
        console.log('Auth check failed:', err.message)
        // Token invalid - clear everything
        clearAuth()
        setUser(null)
      }
    } catch (err) {
      console.log('checkAuth error:', err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async function login(email, password) {
    try {
      setLoading(true)
      setError(null)
      console.log('Attempting login...')
      const response = await apiClient.login(email, password)
      console.log('Login successful:', response)
      
      // Extract user data from response
      const userData = response.data || response.user || response
      console.log('Extracted user data:', userData)
      
      // Token is already stored by apiClient.login
      // Just verify it's there
      const storedToken = localStorage.getItem('office_weave_token')
      const storedUser = localStorage.getItem('user_data')
      console.log('Verification - stored token:', storedToken)
      console.log('Verification - stored user:', storedUser)
      
      if (!storedToken || !storedUser) {
        console.error('Failed to store authentication data!')
        throw new Error('Failed to store authentication data')
      }
      
      setUser(userData)
      return response
    } catch (err) {
      console.error('Login failed:', err)
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign up new user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async function signup(email, password) {
    try {
      setLoading(true)
      setError(null)
      console.log('Attempting signup...')
      const response = await apiClient.signup(email, password)
      console.log('Signup successful:', response)
      
      // Extract user data from response
      const userData = response.data || response.user || response
      console.log('Extracted user data:', userData)
      
      // Token is already stored by apiClient.signup
      // Just verify it's there
      const storedToken = localStorage.getItem('office_weave_token')
      const storedUser = localStorage.getItem('user_data')
      console.log('Verification - stored token:', storedToken)
      console.log('Verification - stored user:', storedUser)
      
      if (!storedToken || !storedUser) {
        console.error('Failed to store authentication data!')
        throw new Error('Failed to store authentication data')
      }
      
      setUser(userData)
      return response
    } catch (err) {
      console.error('Signup failed:', err)
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Logout user
   */
  async function logout() {
    try {
      setLoading(true)
      await apiClient.logout()
      
      // Clear stored auth data
      clearAuth()
      
      setUser(null)
      setError(null)
      console.log('Logout successful')
    } catch (err) {
      console.error('Logout failed:', err)
      // Even if logout API fails, clear local data
      clearAuth()
      setUser(null)
      
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Manually fix authentication by setting a token
   * This is a temporary fix for when user is logged in but token is missing
   */
  async function fixAuth() {
    try {
      console.log('Attempting to fix authentication...')
      
      // Try to get current user (this should work with cookies)
      const response = await apiClient.getCurrentUser()
      console.log('Got user from cookies:', response)
      
      // Extract user data from response
      const userData = response.data || response.user || response
      console.log('Extracted user data for fix:', userData)
      
      // Store user data
      console.log('Fixing auth - storing user:', userData)
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      // Verify storage immediately
      const storedToken = localStorage.getItem('office_weave_token')
      const storedUser = localStorage.getItem('user_data')
      console.log('Fix verification - stored token:', storedToken)
      console.log('Fix verification - stored user:', storedUser)
      
      if (!storedToken || !storedUser) {
        console.error('Failed to fix authentication data storage!')
        throw new Error('Failed to fix authentication data storage')
      }
      
      setUser(userData)
      setError(null)
      
      return response
    } catch (err) {
      console.error('Failed to fix auth:', err)
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    fixAuth,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use authentication
 * @returns {object} Auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default useAuth
