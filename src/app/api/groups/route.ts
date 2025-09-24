import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt, generateUserId } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const groups = await prisma.group.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        expenses: {
          include: {
            splits: true,
          },
        },
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const encryptedPayload = await request.text();
    
    // Decrypt the payload
    let groupData;
    try {
      const decryptedData = decrypt(encryptedPayload);
      groupData = JSON.parse(decryptedData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid encrypted payload' },
        { status: 400 }
      );
    }

    const { name, description, creatorWalletAddress } = groupData;

    if (!name || !creatorWalletAddress) {
      return NextResponse.json(
        { error: 'Group name and creator wallet address are required' },
        { status: 400 }
      );
    }

    // Find or create the creator user by wallet address
    let creatorUser = await prisma.user.findUnique({
      where: { walletAddress: creatorWalletAddress }
    });

    if (!creatorUser) {
      const userId = generateUserId(`wallet_${creatorWalletAddress.slice(0, 8)}`);
      creatorUser = await prisma.user.create({
        data: {
          id: userId,
          name: `Wallet User ${creatorWalletAddress.slice(0, 6)}...${creatorWalletAddress.slice(-4)}`,
          email: `${creatorWalletAddress.slice(0, 8)}@wallet.local`,
          password: 'wallet-auth',
          walletAddress: creatorWalletAddress,
        }
      });
    }

    // Create group
    const group = await prisma.group.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: creatorUser.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Return encrypted group data
    const responseData = {
      id: group.id,
      name: group.name,
      description: group.description,
      members: group.members,
      createdAt: group.createdAt
    };

    const encryptedResponse = encrypt(JSON.stringify(responseData));
    return NextResponse.json({ data: encryptedResponse });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
