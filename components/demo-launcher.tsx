'use client';

import { useState } from 'react';

export default function DemoLauncher() {
  const [busy, setBusy] = useState(false);
  const [demoError, setDemoError] = useState('');

  async function runDemo() {
    setBusy(true);
    setDemoError('');
    try {
      const response = await fetch('/api/demo-seed', { method: 'POST' });
      if (!response.ok) throw new Error(`Demo setup failed (HTTP ${response.status})`);
      window.location.href = '/intake?demo=1';
    } catch (error) {
      setDemoError(String(error));
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={runDemo}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-2xl bg-[#C65A78] px-6 py-3 font-semibold text-[#FFF5F2] shadow-[0_18px_42px_rgba(198,90,120,0.3)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? 'Setting up…' : '▶ Run demo'}
      </button>
      {demoError && <p role="alert" className="text-sm text-red-300">{demoError}</p>}
    </>
  );
}
