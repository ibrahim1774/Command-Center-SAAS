/**
 * Parse JSON from Claude's response text.
 * Handles both raw JSON and JSON wrapped in markdown code fences.
 */
export function parseClaudeJSON<T>(text: string): T {
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr) as T;
}
