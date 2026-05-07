export async function askGemini({
  prompt,
  history = [],
  model = 'gemini-1.5-flash',
  systemInstruction = null,
  images = [],
}: {
  prompt: string;
  history?: any[];
  model?: string;
  systemInstruction?: string | null;
  images?: { data: string; mimeType: string }[];
}) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      history,
      model,
      systemInstruction,
      images,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'فشل الاتصال بـ Gemini');
  }

  return data.text;
}
