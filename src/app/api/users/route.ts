import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt, generateUserId, validateUserData } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const encryptedPayload = await request.text();
    
    // Decrypt the payload
    let userData;
    try {
      const decryptedData = decrypt(encryptedPayload);
      userData = JSON.parse(decryptedData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid encrypted payload' },
        { status: 400 }
      );
    }

    // Validate user data
    const validation = validateUserData(userData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, email } = userData;

    // Check if user already exists by email (if provided)
    let user;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          groupMemberships: {
            include: {
              group: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });
    }

    // If user doesn't exist, create a new one
    if (!user) {
      const userId = generateUserId(name);
      user = await prisma.user.create({
        data: {
          id: userId,
          name: name.trim(),
          email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@tomo-split.local`,
          password: 'no-password-required', // Placeholder since we're not using auth
        },
        include: {
          groupMemberships: {
            include: {
              group: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });
    }

    // Return encrypted user data
    const responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      groups: user.groupMemberships.map(membership => ({
        id: membership.group.id,
        name: membership.group.name,
        role: membership.role
      }))
    };

    const encryptedResponse = encrypt(JSON.stringify(responseData));
    return NextResponse.json({ data: encryptedResponse }, { status: 200 });

  } catch (error) {
    console.error('Error creating/finding user:', error);
    return NextResponse.json(
      { error: 'Failed to process user data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        groupMemberships: {
          include: {
            group: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      groups: user.groupMemberships.map(membership => ({
        id: membership.group.id,
        name: membership.group.name,
        role: membership.role
      }))
    };

    const encryptedResponse = encrypt(JSON.stringify(responseData));
    return NextResponse.json({ data: encryptedResponse }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
