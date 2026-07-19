import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

export const runtime = 'edge';
export const alt = `${SITE.name} — comic spider UI tester for React and Next.js`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// 1200x630 Open Graph card. Renders on the edge, cached by Next. Kept simple
// (no external fonts, no images) so it always renders even if the fonts CDN
// is slow.
export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          backgroundImage:
            'radial-gradient(circle, rgba(17,17,17,0.10) 1.4px, transparent 1.8px)',
          backgroundSize: '22px 22px',
          padding: '68px 74px',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          color: '#141414',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <SpiderMark />
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: 4,
              lineHeight: 1,
            }}
          >
            CRAWLY
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 3,
              padding: '8px 18px 6px',
              background: '#141414',
              color: '#fff',
              borderRadius: 999,
            }}
          >
            FREE CHROME EXTENSION
          </span>
          <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 0.95, letterSpacing: 1 }}>
            Record a flow once.
          </div>
          <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 0.95, letterSpacing: 1 }}>
            A spider replays it forever.
          </div>
          <div style={{ fontSize: 30, color: '#333', maxWidth: 900, marginTop: 6 }}>
            Types at 25 ms per key on React & Next.js apps. Yells KPOW! when it passes.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          <span
            style={{
              padding: '6px 18px 4px',
              border: '3px solid #141414',
              borderRadius: 999,
              boxShadow: '4px 4px 0 #141414',
            }}
          >
            OPEN SOURCE
          </span>
          <span
            style={{
              padding: '6px 18px 4px',
              border: '3px solid #141414',
              borderRadius: 999,
              boxShadow: '4px 4px 0 #141414',
            }}
          >
            APACHE 2.0
          </span>
          <span style={{ marginLeft: 'auto', color: '#555' }}>{SITE.domain}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

function SpiderMark() {
  // Small SVG rendered inline. Vercel OG supports SVG via <svg>-like divs, so
  // we use raw shapes.
  return (
    <div
      style={{
        width: 88,
        height: 88,
        borderRadius: '50%',
        background: '#141414',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#fff',
          top: 26,
          left: 22,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#fff',
          top: 26,
          right: 22,
        }}
      />
    </div>
  );
}
