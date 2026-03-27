import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error("Missing ANTHROPIC_API_KEY");
    }
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}
