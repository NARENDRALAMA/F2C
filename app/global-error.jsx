'use client';

export default function GlobalError({ error, reset }) {
  if (typeof window !== 'undefined') console.error(error);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '32rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>F2C — unexpected error</h1>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
          The app failed to render. Use the button below, then ensure you run <code>npm run dev</code> (Next.js on port 3000).
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            background: '#16a34a',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
