import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { realtimeManager } from '@/lib/realtime';
import { encrypt, decrypt, generateUserId } from '@/lib/encryption';

type ExpenseSplitInput = { userId: string; amount: number | string };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const whereClause: { groupId?: string } = {};

    if (groupId) {
      whereClause.groupId = groupId;
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        splits: {
          include: {
            expense: {
              include: {
                paidBy: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
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
    let expenseData;
    try {
      const decryptedData = decrypt(encryptedPayload);
      expenseData = JSON.parse(decryptedData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid encrypted payload' },
        { status: 400 }
      );
    }

    const { title, description, amount, groupId, splits, paidByWalletAddress } = expenseData;

    if (!title || !amount || !groupId || !paidByWalletAddress) {
      return NextResponse.json(
        { error: 'Title, amount, group, and payer wallet address are required' },
        { status: 400 }
      );
    }

    // Find or create the user who paid by wallet address
    let paidByUser = await prisma.user.findUnique({
      where: { walletAddress: paidByWalletAddress }
    });

    if (!paidByUser) {
      const userId = generateUserId(`wallet_${paidByWalletAddress.slice(0, 8)}`);
      paidByUser = await prisma.user.create({
        data: {
          id: userId,
          name: `Wallet User ${paidByWalletAddress.slice(0, 6)}...${paidByWalletAddress.slice(-4)}`,
          email: `${paidByWalletAddress.slice(0, 8)}@wallet.local`,
          password: 'wallet-auth',
          walletAddress: paidByWalletAddress,
        }
      });
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        title,
        description,
        amount: parseFloat(amount),
        paidById: paidByUser.id,
        groupId,
        splits: {
          create: (splits as ExpenseSplitInput[]).map((split) => ({
            userId: split.userId,
            amount: parseFloat(String(split.amount)),
          })),
        },
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        splits: {
          include: {
            expense: {
              include: {
                paidBy: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Prepare expense data for real-time broadcasting
    const realtimeExpenseData = {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      group: expense.group,
      createdAt: expense.createdAt
    };

    // Broadcast real-time update to all group members
    realtimeManager.broadcast(groupId, {
      type: 'expense_added',
      groupId,
      data: realtimeExpenseData,
      timestamp: new Date(),
    });

    // Also queue the event for clients that connect later
    realtimeManager.queueEvent(groupId, {
      type: 'expense_added',
      groupId,
      data: realtimeExpenseData,
      timestamp: new Date(),
    });

    // Return encrypted expense data
    const responseData = {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      group: expense.group,
      splits: expense.splits,
      createdAt: expense.createdAt
    };

    const encryptedResponse = encrypt(JSON.stringify(responseData));
    return NextResponse.json({ data: encryptedResponse });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
