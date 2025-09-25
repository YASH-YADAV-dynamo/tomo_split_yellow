import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NITROLITE_MESSAGE } from '@/lib/nitrolite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = (searchParams.get('walletAddress') || '').toLowerCase();

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) return NextResponse.json({ dues: [] });

    // Find unpaid splits for this user
    const splits = await prisma.expenseSplit.findMany({
      where: { userId: user.id, isPaid: false },
      include: {
        expense: { include: { group: true, paidBy: true } },
      },
      orderBy: { id: 'desc' },
    });

    const dues = splits.map((s) => ({
      splitId: s.id,
      amount: s.amount,
      expenseTitle: s.expense.title,
      groupName: s.expense.group.name,
      owedToUserId: s.expense.paidById,
      owedToUserName: s.expense.paidBy.name,
    }));

    return NextResponse.json({ dues });
  } catch (error) {
    console.error('List settlements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, splitIds, signature } = await request.json();
    if (!walletAddress || !Array.isArray(splitIds) || splitIds.length === 0 || !signature) {
      return NextResponse.json({ error: 'walletAddress, splitIds, and signature are required' }, { status: 400 });
    }

    // NOTE: For production you should verify `signature` recovers `walletAddress`
    // against the NITROLITE_MESSAGE. In this minimal implementation we trust the
    // client signature and store it.

    const user = await prisma.user.findUnique({ where: { walletAddress: walletAddress.toLowerCase() } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Mark splits paid and create settlement rows
    const updated = await prisma.$transaction(async (tx) => {
      // Fetch splits to ensure ownership
      const splits = await tx.expenseSplit.findMany({
        where: { id: { in: splitIds as string[] }, userId: user.id, isPaid: false },
        include: { expense: true },
      });

      if (splits.length === 0) return { count: 0 };

      // Create settlements to the payee (expense.paidById)
      for (const s of splits) {
        await tx.settlement.create({
          data: {
            fromId: user.id,
            toId: s.expense.paidById,
            amount: s.amount,
            isPaid: true,
            paidAt: new Date(),
          },
        });
      }

      // Mark splits paid
      await tx.expenseSplit.updateMany({
        where: { id: { in: splits.map((s) => s.id) } },
        data: { isPaid: true },
      });

      return { count: splits.length };
    });

    return NextResponse.json({ ok: true, settled: updated.count, message: NITROLITE_MESSAGE, signature });
  } catch (error) {
    console.error('Settle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


