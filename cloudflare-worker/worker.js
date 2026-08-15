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
    let history = [];
    try {
      const body = await request.json();
      message = body.message;

      // Accept prior turns from the client so the bot can follow up on context.
      // Validate them: this is a public endpoint, so anyone can POST anything.
      if (Array.isArray(body.history)) {
        history = body.history
          .filter(
            (m) =>
              m &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string" &&
              m.content.trim().length > 0
          )
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Keep this prompt lean. It is sent in full on every single message, so its
    // size directly determines how many messages you get per minute before you
    // hit the API rate limit. Prose works better than bulleted blocks here: the
    // model imitates the shape of what it reads, so a heavily structured prompt
    // produces heavily structured answers.
    const systemPrompt = `You are [BOT NAME], the portfolio assistant on [YOUR NAME]'s website. You help visitors learn about [YOUR NAME] and their work.

HOW TO REPLY
The chat shows plain text and does not render Markdown, so any formatting symbols appear to the visitor as raw characters.
- Write in plain conversational prose. Never use tables, pipe characters, asterisks, headers, bullet points or numbered lists.
- Keep replies to three or four sentences. This holds even for broad questions.
- Speak as [BOT NAME]. Refer to [YOUR NAME] in the third person, never as "I". Do not claim to be them.
- Be warm, enthusiastic and helpful.
- If you do not know something, say so. Never guess or invent details, especially personal ones.
- Point people to [EMAIL] or LinkedIn to get in touch.

Example of the right answer to "What projects did you do?":
"[YOUR NAME] has six projects in their portfolio: [name them in a single sentence]. Happy to go deeper on any of them, which one sounds interesting?"

Short, conversational, no table and no list, even though six things were mentioned. Answer everything this way.

// Add your own content below as prose paragraphs, not bulleted blocks:
// - About
// - Background and experience
// - Services
// - Projects (a short paragraph each, keeping the decisions that show how you think)
// - FAQ
// - Contact

// PICK ONE VOICE AND HOLD IT EVERYWHERE.
// The template above uses an assistant voice: the bot is its own persona and
// talks about you in the third person. If you would rather it speak as you,
// change the rule AND rewrite every section below into first person, including
// your FAQ answers. Mixing the two makes the model invent a way to satisfy
// both. See the README.`;

    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          reasoning_effort: "low",
          include_reasoning: false,
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message }
          ],
          temperature: 0.6,
          max_completion_tokens: 800,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Groq API error:", data.error);
        return new Response(JSON.stringify({
          reply: "Sorry, I am having trouble responding right now. Please try again in a moment."
        }), { headers: corsHeaders });
      }

      const reply = data.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        console.error("Empty reply from Groq:", JSON.stringify(data));
        return new Response(JSON.stringify({
          reply: "Sorry, I did not quite catch that. Could you rephrase your question?"
        }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ reply }), { headers: corsHeaders });

    } catch (err) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({
        reply: "Sorry, something went wrong on my end. Please try again shortly."
      }), { headers: corsHeaders });
    }
  },
};
