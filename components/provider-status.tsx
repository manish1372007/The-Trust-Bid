'use client';

import { useEffect, useState } from 'react';

type ProviderState = 'checking' | 'ok' | 'missing key' | 'unreachable' | `error ${number}`;
type Health = {
  gemini: ProviderState;
  elevenlabs: ProviderState;
  voiceIntakeReady?: boolean;
  voiceNegotiationReady?: boolean;
};

const REFRESH_MS = 60_000;

export function ProviderStatus({ compact = false }: { compact?: boolean }) {
  const [health, setHealth] = useState<Health | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const response = await fetch('/api/ping', { cache: 'no-store' });
        const result: unknown = await response.json();
        if (!response.ok || typeof result !== 'object' || result === null || !('gemini' in result) || !('elevenlabs' in result)) {
          throw new Error(`Provider status request failed (HTTP ${response.status})`);
        }
        const status = result as Health;
        if (active) {
          setHealth(status);
          setUnavailable(false);
        }
      } catch {
        if (active) setUnavailable(true);
      }
    };

    const initial = window.setTimeout(() => void check(), 0);
    const interval = window.setInterval(() => void check(), REFRESH_MS);
    return () => {
      active = false;
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  const gemini = unavailable ? 'status unavailable' : health?.gemini ?? 'checking';
  const elevenlabsKey = unavailable ? 'status unavailable' : health?.elevenlabs ?? 'checking';
  const voiceIntake = health?.voiceIntakeReady ? 'ready' : 'agent ID missing';
  const voiceNegotiation = health?.voiceNegotiationReady ? 'ready' : 'agent ID missing';
  const elevenlabs = elevenlabsKey === 'ok'
    ? `key ok; intake ${voiceIntake}; negotiation ${voiceNegotiation}`
    : elevenlabsKey;
  const ready = gemini === 'ok';
  const tone = ready
    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30'
    : 'border-red-400/60 bg-red-500/15 text-red-200 ring-1 ring-red-400/30';

  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] shadow-lg backdrop-blur-sm',
        tone,
      ].join(' ')}
      aria-live="polite"
      title={`Gemini: ${gemini}; ElevenLabs: ${elevenlabs}`}
    >
      <span className="text-[9px] tracking-[0.2em] text-current/80">AI STATUS</span>
      <span className="inline-flex items-center gap-1.5">
        <span className={['h-2 w-2 rounded-full', ready ? 'bg-emerald-400' : 'bg-red-400'].join(' ')} aria-hidden="true" />
        {compact ? `Gemini ${gemini === 'ok' ? 'ready' : gemini}` : `Gemini ${gemini} · ElevenLabs ${elevenlabs}`}
      </span>
    </div>
  );
}
