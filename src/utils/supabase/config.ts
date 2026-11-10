export function isSupabaseConfigured(
    url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
): boolean {
    if (!url || !key) return false;

    const normalizedUrl = url.trim().toLowerCase();
    const normalizedKey = key.trim().toLowerCase();

    if (
        normalizedUrl === "" ||
        normalizedKey === "" ||
        normalizedUrl.includes("your-project.supabase.co") ||
        normalizedUrl.includes("placeholder.supabase.co") ||
        normalizedKey === "your-supabase-anon-key" ||
        normalizedKey === "placeholder-anon-key"
    ) {
        return false;
    }

    return true;
}

