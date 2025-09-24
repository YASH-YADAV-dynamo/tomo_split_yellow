import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { groupSlug, name, email } = await request.json();

    if (!groupSlug || !name || !email) {
      return NextResponse.json(
        { error: 'Group slug, name, and email are required' },
        { status: 400 }
      );
    }

    // Convert slug back to group name
    const groupName = groupSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Find the group by name
    const group = await prisma.group.findFirst({
      where: {
        name: {
          equals: groupName,
          mode: 'insensitive'
        }
      },
      include: {
        members: true
      }
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: 'temp-password', // Will need to be changed on first login
        }
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId: group.id,
        userId: user.id
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this group' },
        { status: 409 }
      );
    }

    // Add user to group
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        role: 'member'
      }
    });

    return NextResponse.json({
      message: 'Successfully joined group',
      group: {
        id: group.id,
        name: group.name,
        description: group.description
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
