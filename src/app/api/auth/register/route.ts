import { NextResponse } from 'next/server';
import type { UserRegistration } from '@/types/user';

export async function POST(request: Request) {
  try {
    const body: UserRegistration = await request.json();

    // Validate input
    if (!body.email || !body.password || !body.username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Hash the password
    // 2. Check if user already exists
    // 3. Save user to database
    // For now, we'll just simulate success

    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 