import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Create sample groups
    const sampleGroups = [
      {
        name: 'Friends Trip',
        description: 'Weekend getaway with friends',
      },
      {
        name: 'Roommates',
        description: 'Shared apartment expenses',
      },
      {
        name: 'Work Team',
        description: 'Office lunch and team activities',
      }
    ];

    const createdGroups = [];
    for (const groupData of sampleGroups) {
      const group = await prisma.group.create({
        data: groupData,
      });
      createdGroups.push(group);
    }

    return NextResponse.json({
      message: 'Sample groups created successfully',
      groups: createdGroups
    });
  } catch (error) {
    console.error('Sample data creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
}
