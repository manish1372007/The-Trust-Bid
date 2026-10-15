import type { NextRequest } from 'next/server';

// Mints a WebRTC conversation token server-side so the API key never reaches the browser.
export async function GET(req: NextRequest) {
  const agent = req.nextUrl.searchParams.get('agent') === 'negotiator' ? 'NEGOTIATOR' : 'INTAKE';
  const agentId = process.env[`ELEVENLABS_AGENT_ID_${agent}`]?.trim();
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: 'ELEVENLABS_API_KEY is missing. Add it to .env.local and restart the dev server.' }, { status: 503 });
  }
  if (!agentId) {
    return Response.json({ error: `ELEVENLABS_AGENT_ID_${agent} is missing. Add your ElevenLabs ${agent.toLowerCase()} agent ID to .env.local.` }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { 'xi-api-key': apiKey }, signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) {
      return Response.json(
        { error: `ElevenLabs token request failed (HTTP ${res.status}). Check that the API key is valid and has access to this agent.` },
        { status: 502 }
      );
    }
    return Response.json(await res.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: `Could not reach ElevenLabs: ${message}` }, { status: 502 });
  }
}
