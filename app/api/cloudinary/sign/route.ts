import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { folder, upload_preset } = await req.json().catch(() => ({ folder: '', upload_preset: undefined }));

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET' }, { status: 500 });
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Build params to sign (alphabetically by key)
    const params: Record<string, string | number | undefined> = {
      folder: folder || undefined,
      timestamp,
      upload_preset,
    };

    const toSign = Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== '')
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    const signature = crypto.createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');

    return NextResponse.json({ signature, timestamp, apiKey, upload_preset });
  } catch (e) {
    console.error('Cloudinary sign error', e);
    return NextResponse.json({ error: 'Sign error' }, { status: 500 });
  }
}
