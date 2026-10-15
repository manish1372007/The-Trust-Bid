type GeminiMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type GeminiContent = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

type JsonSchema = {
  type: string | string[];
  description?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: (string | number | boolean | null)[];
  additionalProperties?: boolean;
};

type GeminiRequest = {
  systemInstruction?: { parts: { text: string }[] };
  contents: GeminiContent[];
  generationConfig?: {
    responseMimeType: 'application/json';
    responseJsonSchema: JsonSchema;
  };
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: { message?: string };
};

type ChatCompletionParams = {
  model: string;
  messages?: GeminiMessage[];
  response_format?: {
    type: 'json_schema';
    json_schema: { name: string; strict: boolean; schema: JsonSchema };
  };
};

type ResponsesCreateParams = {
  model: string;
  input?: string | unknown[] | Record<string, unknown>;
  tools?: { type: string }[];
  text?: {
    format: {
      type: 'json_schema';
      name: string;
      strict: boolean;
      schema: JsonSchema;
    };
  };
};

function normalizeModel(model: string): string {
  const normalized = model.trim();
  if (normalized.toLowerCase() === 'gpt-4o') return 'gemini-2.0-flash';
  return normalized;
}

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to your local .env before using the AI features.');
  }
  return apiKey;
}

function extractGeminiText(payload: GeminiResponse): string {
  const candidates = payload?.candidates ?? [];
  const first = candidates[0];
  const parts = first?.content?.parts ?? [];
  return parts.map((part) => part.text ?? '').join('').trim();
}

async function executeGemini(model: string, body: GeminiRequest): Promise<string> {
  const key = getGeminiApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${normalizeModel(model)}:generateContent?key=${encodeURIComponent(key)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json() as GeminiResponse;
  if (!response.ok) {
    const message = data?.error?.message ?? 'Gemini request failed';
    throw new Error(message);
  }

  return extractGeminiText(data);
}

function toGeminiContents(messages: GeminiMessage[]): { systemPrompt: string; contents: GeminiContent[] } {
  const systemPrompt = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n');

  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: message.content }],
    }));

  return {
    systemPrompt,
    contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: ' ' }] }],
  };
}

export function getGeminiClient() {
  return {
    chat: {
      completions: {
        create: async (params: ChatCompletionParams) => {
          const { systemPrompt, contents } = toGeminiContents(params.messages ?? []);
          const result = await executeGemini(params.model, {
            systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
            contents,
            generationConfig: params.response_format
              ? {
                  responseMimeType: 'application/json',
                  responseJsonSchema: params.response_format.json_schema.schema,
                }
              : undefined,
          });

          return {
            choices: [{ message: { content: result } }],
          };
        },
      },
    },
    responses: {
      create: async (params: ResponsesCreateParams) => {
        const inputValue = params.input;
        const promptText = typeof inputValue === 'string'
          ? inputValue
          : Array.isArray(inputValue)
            ? JSON.stringify(inputValue)
            : JSON.stringify(inputValue ?? {});

        const result = await executeGemini(params.model, {
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: params.text?.format
            ? {
                responseMimeType: 'application/json',
                responseJsonSchema: params.text.format.schema,
              }
            : undefined,
        });

        return { output_text: result };
      },
    },
  };
}

export const getOpenAIClient = getGeminiClient;
