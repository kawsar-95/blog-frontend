// lib/envelope.js
// Backends here wrap responses inconsistently ({user}, {data:{user}}, {data}, or the bare
// object). This single recursive unwrap replaces the copy-pasted heuristic that used to live
// separately in each service.
export function unwrapEnvelope(payload, key) {
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return payload;
  if (key && payload[key] !== undefined) return payload[key];
  if (payload.data !== undefined) return unwrapEnvelope(payload.data, key);
  return payload;
}
