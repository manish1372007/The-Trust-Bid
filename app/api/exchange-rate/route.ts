type ExchangeRateResponse = {
  result?: string;
  time_last_update_utc?: string;
  time_next_update_utc?: string;
  rates?: Record<string, number>;
};

export const revalidate = 900;

export async function GET() {
  const response = await fetch('https://open.er-api.com/v6/latest/USD', {
    next: { revalidate },
  });
  if (!response.ok) {
    return Response.json({ error: `Exchange-rate provider returned HTTP ${response.status}` }, { status: 502 });
  }

  const data = await response.json() as ExchangeRateResponse;
  const rate = data.rates?.INR;
  if (data.result !== 'success' || !Number.isFinite(rate) || !rate || !data.time_last_update_utc) {
    return Response.json({ error: 'Exchange-rate provider returned an invalid USD/INR rate' }, { status: 502 });
  }

  return Response.json({
    base: 'USD',
    quote: 'INR',
    rate,
    updatedAt: data.time_last_update_utc,
    nextUpdateAt: data.time_next_update_utc ?? null,
    source: 'ExchangeRate-API',
  });
}
