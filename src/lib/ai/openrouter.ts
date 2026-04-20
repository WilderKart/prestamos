export async function callModel(model: string, prompt: string) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mivank.com", // Opcional, para OpenRouter rankings
      "X-Title": "Mivank Fintech",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("OpenRouter API Error:", errorData);
    throw new Error("AI communication error");
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
