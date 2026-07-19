import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#141414',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#141414', border: '4px solid #fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: 26, height: 26, borderRadius: '50%', background: '#fff', top: 34, left: 20 }} />
          <div style={{ position: 'absolute', width: 26, height: 26, borderRadius: '50%', background: '#fff', top: 34, right: 20 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
