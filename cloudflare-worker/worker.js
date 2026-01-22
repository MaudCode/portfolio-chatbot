export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Chatbot API is running", {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    let message;
    try {
      const body = await request.json();
      message = body.message;
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const systemPrompt = `You are a friendly chatbot on a portfolio website.

// Add your own content here:
// - About Section
// - Background and Experience
// - Services
// - Projects
// - FAQ
// - Contact Information

YOUR BEHAVIOR
- keep responses conversational and concise
- be warm and helpful
- answer in first person
- if you do not know something specific, be honest about it`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 250,
      }),
    });

    const data = await response.json();
    
    return new Response(JSON.stringify({ 
      reply: data.choices[0].message.content 
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
