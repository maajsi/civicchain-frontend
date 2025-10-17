import { getSession } from 'next-auth/react'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://152.42.157.189:3000'

export async function authenticateWithBackend() {
  try {
    // Call our Next.js API route which will generate and send the JWT
    const response = await axios.post('/api/auth/login')
    if (response.data.success && response.data.jwt_token && response.data.user?.user_id) {
      // Store the JWT token, user_id, and role for future requests
      setAuthToken(response.data.jwt_token)
      setUserId(response.data.user.user_id)
      setUserRole(response.data.user.role || 'citizen')
      return response.data
    }
    throw new Error('Authentication failed')
  } catch (error) {
    console.error('Backend authentication error:', error)
    throw error
  }
}

export function setUserId(userId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('civicchain_user_id', userId)
  }
}

export function getUserId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('civicchain_user_id')
  }
  return null
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('civicchain_token', token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('civicchain_token')
  }
  return null
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('civicchain_token')
  }
}

export function setUserRole(role: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('civicchain_user_role', role)
  }
}

export function getUserRole(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('civicchain_user_role')
  }
  return null
}

export function clearAuthData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('civicchain_token')
    localStorage.removeItem('civicchain_user_id')
    localStorage.removeItem('civicchain_user_role')
  }
}
