import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { userId, salary, emi } = await req.json();

    if (!userId || !salary || !emi) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.salary = salary;
    user.emi = emi;
    await user.save();

    return NextResponse.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Profile API Error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
