import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'
import jwt from 'jsonwebtoken'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://152.42.157.189:3000'
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

export async function POST(_: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No session' },
        { status: 401 }
      )
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Generate JWT token for backend using the shared secret
    const payload = {
      email: session.user.email,
      name: session.user.name,
      picture: session.user.image,
      sub: session.user.id || session.user.email,
      iat: Math.floor(Date.now() / 1000),
    }

    const jwt_token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d',
    })

    // Send the signed JWT to backend
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jwt_token: jwt_token
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Backend auth failed:', data)
      return NextResponse.json(
        { success: false, error: data.message || 'Backend authentication failed' },
        { status: response.status }
      )
    }

    // Return the JWT token along with user data so frontend can use it
    return NextResponse.json({
      ...data,
      jwt_token: jwt_token
    })
  } catch (error: unknown) {
    let message = 'Internal server error';
    if (typeof error === 'object' && error !== null && 'message' in error) {
      message = (error as { message?: string }).message || message;
    }
    console.error('Auth login error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
