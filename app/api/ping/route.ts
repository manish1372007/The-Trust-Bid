export const dynamic = 'force-dynamic';

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY?.trim() ?? '';
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY?.trim() ?? '';
  const [gemini, elevenlabs] = await Promise.all([
    check(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiKey)}`,
      {},
      Boolean(geminiKey),
    ),
    check('https://api.elevenlabs.io/v1/models', {
      'xi-api-key': elevenLabsKey,
    }, Boolean(elevenLabsKey)),
  ]);
  return Response.json(
    {
      gemini,
      elevenlabs,
      demoMode: process.env.DEMO_MODE === 'true',
      voiceIntakeReady: elevenlabs === 'ok' && Boolean(process.env.ELEVENLABS_AGENT_ID_INTAKE?.trim()),
      voiceNegotiationReady: elevenlabs === 'ok' && Boolean(process.env.ELEVENLABS_AGENT_ID_NEGOTIATOR?.trim()),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

async function check(url: string, headers: Record<string, string>, hasKey: boolean) {
  if (!hasKey) return 'missing key';
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    return res.ok ? 'ok' : `error ${res.status}`;
  } catch {
    return 'unreachable';
  }
}
