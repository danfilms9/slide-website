import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config as dotenvConfig } from "dotenv";

const isDev = process.env.NODE_ENV === "development";

/** Ensure .env.local is loaded into process.env (API route may not see it by default). */
function ensureEnvLoaded(): void {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return;
  const candidates: string[] = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), "..", ".env.local"),
  ];
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    candidates.push(path.resolve(__dirname, "../../../../..", ".env.local"));
  } catch {
    // ignore
  }

  if (isDev) {
    console.warn("[firebase-config] API route: process.cwd() =", process.cwd());
    console.warn("[firebase-config] Candidate paths:", candidates);
    candidates.forEach((p) => console.warn("[firebase-config]   exists?", p, existsSync(p)));
  }

  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      const result = dotenvConfig({ path: envPath });
      if (isDev) console.warn("[firebase-config] dotenv loaded from", envPath, "parsed:", result?.parsed ? Object.keys(result.parsed).length : 0);
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return;
    }
  }

  // Fallback: read and parse manually (dotenv injects 0 when format is unexpected)
  for (const envPath of candidates) {
    if (!existsSync(envPath)) continue;
    try {
      let content = readFileSync(envPath, "utf8");
      if (content.charCodeAt(0) === 0xfeff) content = content.slice(1); // strip BOM
      if (isDev) {
        console.warn("[firebase-config] Manual parse: file length =", content.length, "first 80 chars:", JSON.stringify(content.slice(0, 80)));
        console.warn("[firebase-config] Lines (split by \\n):", content.split(/\r?\n/).length);
      }
      let count = 0;
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const idx = trimmed.indexOf("=");
        if (idx <= 0) return;
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
          count++;
        }
      });
      if (isDev) console.warn("[firebase-config] Manual parse set", count, "vars. API_KEY present?", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
      return;
    } catch (err) {
      if (isDev) console.warn("[firebase-config] Manual parse failed for", envPath, err);
      continue;
    }
  }
}

/** Load config from firebase-client-config.json in project root (fallback when .env.local is empty/unavailable). */
function loadJsonConfig(): Record<string, string> | null {
  const jsonPath = path.join(process.cwd(), "firebase-client-config.json");
  if (!existsSync(jsonPath)) return null;
  try {
    const raw = readFileSync(jsonPath, "utf8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    const apiKey = typeof data.apiKey === "string" ? data.apiKey : null;
    if (!apiKey) return null;
    return {
      apiKey,
      authDomain: typeof data.authDomain === "string" ? data.authDomain : "",
      projectId: typeof data.projectId === "string" ? data.projectId : "",
      storageBucket: typeof data.storageBucket === "string" ? data.storageBucket : "",
      messagingSenderId: typeof data.messagingSenderId === "string" ? data.messagingSenderId : "",
      appId: typeof data.appId === "string" ? data.appId : "",
    };
  } catch {
    return null;
  }
}

/**
 * Returns the Firebase client config from server env or firebase-client-config.json.
 * These values are safe to expose (Firebase client config is public).
 */
export async function GET() {
  ensureEnvLoaded();
  let apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  let config: Record<string, string> | null = null;

  if (!apiKey) {
    config = loadJsonConfig();
    if (config?.apiKey) {
      if (isDev) console.warn("[firebase-config] Using firebase-client-config.json ( .env.local was empty )");
    }
  }

  if (!config) {
    config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    };
  }

  if (!config.apiKey) {
    const debug = isDev
      ? {
          cwd: process.cwd(),
          hasEnvLocal: existsSync(path.join(process.cwd(), ".env.local")),
          hasJsonConfig: existsSync(path.join(process.cwd(), "firebase-client-config.json")),
          hint: "Add Firebase config to .env.local (one KEY=VALUE per line) or create firebase-client-config.json in project root.",
        }
      : undefined;
    return NextResponse.json(
      { error: "Firebase config not configured", ...(debug && { debug }) },
      { status: 503 }
    );
  }

  return NextResponse.json(config);
}
