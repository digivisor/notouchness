// Cloudinary upload utility
export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const signed = process.env.NEXT_PUBLIC_CLOUDINARY_SIGNED === 'true';
  
  if (!cloudName) throw new Error('Cloudinary env missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  if (!uploadPreset && !signed) throw new Error('Cloudinary env missing: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const form = new FormData();
  form.append('file', file);

  if (signed) {
    const signRes = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder, upload_preset: uploadPreset }),
    });
    if (!signRes.ok) {
      const t = await signRes.text();
      throw new Error(`Sign failed: ${t}`);
    }
    const { signature, timestamp, apiKey } = await signRes.json() as { signature: string; timestamp: number; apiKey: string };
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('api_key', apiKey);
    if (uploadPreset) form.append('upload_preset', uploadPreset);
    if (folder) form.append('folder', folder);
  } else {
    // Unsigned upload
    if (uploadPreset) form.append('upload_preset', uploadPreset);
    if (folder) form.append('folder', folder);
  }

  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${text}`);
  }
  const json: { secure_url?: string } = await res.json();
  if (!json.secure_url) throw new Error('Upload response missing secure_url');
  return json.secure_url;
};

