import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { createResponse } = vi.hoisted(() => ({ createResponse: vi.fn() }));

vi.mock('@/lib/openai', () => ({
  getGeminiClient: () => ({
    responses: { create: createResponse },
    chat: { completions: { create: createResponse } },
  }),
}));

import { MAX_UPLOAD_BYTES, POST } from '@/app/api/extract/route';

const requestWithFile = (file?: File) => {
  const form = new FormData();
  if (file) form.set('file', file);
  return new NextRequest('http://localhost/api/extract', { method: 'POST', body: form });
};

beforeEach(() => {
  createResponse.mockReset();
  createResponse.mockResolvedValue({
    output_text: JSON.stringify({
      origin: { city: null, zip: null, floor: null, hasElevator: null },
      destination: { city: null, zip: null, floor: null, hasElevator: null },
      distanceMiles: null,
      homeSize: null,
      largeItems: [],
      boxCountEst: null,
      stairsFlights: null,
      longCarry: null,
      packingService: null,
      preferredDate: null,
      specialNotes: null,
    }),
  });
});

describe('/api/extract upload validation', () => {
  test('rejects a missing file', async () => {
    const response = await POST(requestWithFile());

    expect(response.status).toBe(400);
    expect(createResponse).not.toHaveBeenCalled();
  });

  test('rejects an empty file', async () => {
    const response = await POST(requestWithFile(new File([], 'empty.pdf', { type: 'application/pdf' })));

    expect(response.status).toBe(400);
    expect(createResponse).not.toHaveBeenCalled();
  });

  test('rejects unsupported media types', async () => {
    const response = await POST(requestWithFile(new File(['data'], 'payload.txt', { type: 'text/plain' })));

    expect(response.status).toBe(415);
    expect(createResponse).not.toHaveBeenCalled();
  });

  test('rejects files above the 10 MB limit', async () => {
    const oversized = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], 'large.pdf', {
      type: 'application/pdf',
    });
    const response = await POST(requestWithFile(oversized));

    expect(response.status).toBe(413);
    expect(createResponse).not.toHaveBeenCalled();
  });

  test('accepts supported PDFs and returns the structured extraction', async () => {
    const response = await POST(requestWithFile(new File(['pdf bytes'], 'quote.pdf', { type: 'application/pdf' })));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ largeItems: [] });
    expect(createResponse).toHaveBeenCalledOnce();
  });

  test('rejects declared oversized multipart requests before parsing their body', async () => {
    const request = new NextRequest('http://localhost/api/extract', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': String(MAX_UPLOAD_BYTES + 64 * 1024 + 1),
      },
      body: '{}',
    });
    const response = await POST(request);

    expect(response.status).toBe(413);
    expect(createResponse).not.toHaveBeenCalled();
  });
});
