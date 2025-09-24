import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUserId } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Find user by wallet address
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
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

    // If user doesn't exist, create a new one
    if (!user) {
      const userId = generateUserId(`wallet_${address.slice(0, 8)}`);
      user = await prisma.user.create({
        data: {
          id: userId,
          name: `Wallet User ${address.slice(0, 6)}...${address.slice(-4)}`,
          email: `${address.slice(0, 8)}@wallet.local`,
          password: 'wallet-auth', // Placeholder since we're using wallet auth
          walletAddress: address,
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

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Error fetching wallet user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { name } = await request.json();

    if (!address || !name) {
      return NextResponse.json(
        { error: 'Wallet address and name are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { walletAddress: address },
      data: { name: name.trim() },
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

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Error updating wallet user:', error);
    return NextResponse.json(
      { error: 'Failed to update user data' },
      { status: 500 }
    );
  }
}
