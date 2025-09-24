import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Create a sample user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        name: 'Demo User',
        email: 'demo@example.com',
        password: hashedPassword,
      },
    });

    // Create a sample group
    const group = await prisma.group.upsert({
      where: { id: 'demo-group' },
      update: {},
      create: {
        id: 'demo-group',
        name: 'Demo Group',
        description: 'A sample group for testing',
        members: {
          create: {
            userId: user.id,
            role: 'admin',
          },
        },
      },
    });

    return NextResponse.json({ 
      message: 'Sample data created successfully',
      user: { id: user.id, email: user.email, name: user.name },
      group: { id: group.id, name: group.name }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
}
