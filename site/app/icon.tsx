import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: '#141414',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: '#fff', top: 10, left: 8 }} />
        <div style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: '#fff', top: 10, right: 8 }} />
      </div>
    ),
    { ...size },
  );
}
