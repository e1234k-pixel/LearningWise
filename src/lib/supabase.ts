import { createClient, SupabaseClient } from "@supabase/supabase-js";

const CREDENTIALS_KEY = "learnwise.supabase.credentials.v1";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  // Priority 1: Check localStorage custom overrides (from Admin Dashboard)
  const saved = localStorage.getItem(CREDENTIALS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          isConfigured: true,
        };
      }
    } catch {
      // ignore
    }
  }

  // Priority 2: Check environment variables
  if (envUrl.trim() && envKey.trim()) {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
      isConfigured: true,
    };
  }

  // Priority 3: Live School Supabase Instance (Default Cloud Database)
  const DEFAULT_SUPABASE_URL = "https://yfhudjpsngzegdxaiiwk.supabase.co";
  const DEFAULT_SUPABASE_KEY = "sb_publishable_2TmBsHl2Ta_dABQXR-esZg_b8F2kqZy";

  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_KEY,
    isConfigured: true,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const config = { url: url.trim(), anonKey: anonKey.trim() };
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(config));
  // Reset singleton so next call re-creates client
  supabaseInstance = null;
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(CREDENTIALS_KEY);
  supabaseInstance = null;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getStoredSupabaseConfig();
  if (!config.isConfigured) return null;

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.warn("Failed to initialize Supabase client:", err);
    return null;
  }
}

export async function testSupabaseConnection(
  testUrl?: string, 
  testKey?: string
): Promise<{ success: boolean; message: string }> {
  const url = testUrl?.trim() || getStoredSupabaseConfig().url;
  const key = testKey?.trim() || getStoredSupabaseConfig().anonKey;

  if (!url || !key) {
    return {
      success: false,
      message: "กรุณาระบุทั้ง Supabase Project URL และ Anon Public Key",
    };
  }

  try {
    const tempClient = createClient(url, key);
    // Test querying the profiles or system_settings table with a minimal select
    const { error } = await tempClient
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      // Check if table simply doesn't exist yet (which means connection succeeded, just schema needs running)
      if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        return {
          success: true,
          message: "เชื่อมต่อกับ Supabase สำเร็จแล้ว! (คำแนะนำ: ยังไม่พบตาราง profiles กรุณารัน SQL Schema ใน Supabase Editor)",
        };
      }
      return {
        success: false,
        message: `เชื่อมต่อไม่สำเร็จ: ${error.message} (รหัส: ${error.code})`,
      };
    }

    return {
      success: true,
      message: "เชื่อมต่อฐานข้อมูล Supabase สำเร็จ 100%! พร้อมอ่านและเขียนข้อมูล",
    };
  } catch (err: any) {
    return {
      success: false,
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message || String(err)}`,
    };
  }
}

/**
 * คำนวณ Google OAuth Callback URL สำหรับนำไปกรอกใน Google Cloud Console
 * รูปแบบ: https://<project-ref>.supabase.co/auth/v1/callback
 */
export function getGoogleCallbackUrl(): string {
  const config = getStoredSupabaseConfig();
  if (!config.url) return "";
  try {
    const parsed = new URL(config.url);
    return `${parsed.origin}/auth/v1/callback`;
  } catch {
    return `${config.url.replace(/\/+$/, "")}/auth/v1/callback`;
  }
}

/**
 * ฟังก์ชันเข้าสู่ระบบด้วย Google OAuth 2.0 ผ่าน Supabase Auth
 */
export async function signInWithGoogleOAuth(
  redirectTo?: string
): Promise<{ success: boolean; url?: string; message?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { 
      success: false, 
      message: "ยังไม่ได้เชื่อมต่อกับ Supabase กรุณาตรวจสอบการตั้งค่า URL และ Anon Key ในหน้า Admin" 
    };
  }

  try {
    // กำหนด Redirect URL ให้กลับมาที่หน้าเว็บเดิม (รองรับทั้ง localhost และ GitHub Pages)
    const currentUrl = window.location.href.split("#")[0].split("?")[0];
    const targetRedirect = redirectTo || currentUrl;

    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: targetRedirect,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (data?.url) {
      return { success: true, url: data.url };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || String(err) };
  }
}

/**
 * ออกจากระบบ Supabase Auth
 */
export async function signOutFromSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.auth.signOut();
  } catch (err) {
    console.warn("Supabase signOut error:", err);
  }
}

/**
 * ตรวจสอบ Session ล่าสุดจาก Supabase
 */
export async function getSupabaseAuthSession() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data } = await client.auth.getSession();
    return data?.session || null;
  } catch (err) {
    console.warn("Error fetching Supabase session:", err);
    return null;
  }
}
