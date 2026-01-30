import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const process = Bun.spawn(['which', 'claude'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const output = await new Response(process.stdout).text();
    await process.exited;

    const installed = output.trim().length > 0;

    return NextResponse.json({ installed });
  } catch {
    return NextResponse.json({ installed: false });
  }
}
