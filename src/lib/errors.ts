// Stable error codes raised by the database functions and server actions,
// mapped to copy that says what happened, why, and what to do next.

export type UserError = { code: string; title: string; description: string };

const COPY: Record<string, Omit<UserError, "code">> = {
  NOT_AUTHENTICATED: { title: "Sesi kamu sudah habis.", description: "Login lagi untuk lanjut." },
  PROFILE_REQUIRED: {
    title: "Lengkapi profil dulu.",
    description: "Kamu perlu profil tenis sebelum bisa buat atau join mabar.",
  },
  ALREADY_ONBOARDED: { title: "Profil kamu sudah ada.", description: "Langsung cari mabar aja yuk." },
  MABAR_NOT_FOUND: {
    title: "Mabar tidak ditemukan.",
    description: "Mungkin link-nya salah atau mabar sudah dihapus. Cari mabar lain yang masih tersedia.",
  },
  MABAR_CANCELLED: {
    title: "Mabar ini sudah dibatalkan.",
    description: "Organizer membatalkan sesi ini. Cari mabar lain yang masih tersedia.",
  },
  MABAR_STARTED: {
    title: "Mabar sudah dimulai.",
    description: "Sesi yang sudah mulai tidak bisa di-join atau ditinggalkan lagi.",
  },
  ALREADY_JOINED: { title: "Kamu sudah join mabar ini.", description: "Sampai ketemu di lapangan!" },
  MABAR_FULL: {
    title: "Mabar sudah penuh.",
    description: "Slot terakhir baru saja diambil oleh player lain. Cari mabar lain yang masih tersedia.",
  },
  LEVEL_NOT_ELIGIBLE: {
    title: "Level kamu belum masuk range mabar ini.",
    description: "Cari mabar dengan range level yang sesuai rating kamu, atau buat mabar sendiri.",
  },
  NOT_PARTICIPANT: { title: "Kamu belum join mabar ini.", description: "Tidak ada yang perlu dibatalkan." },
  ORGANIZER_CANNOT_LEAVE: {
    title: "Organizer tidak bisa keluar dari mabar sendiri.",
    description: "Kalau batal main, batalkan mabar-nya supaya player lain tahu.",
  },
  NOT_ORGANIZER: {
    title: "Hanya organizer yang bisa membatalkan mabar ini.",
    description: "Kalau kamu batal ikut, pilih Keluar dari mabar.",
  },
  START_IN_PAST: { title: "Waktu mulai sudah lewat.", description: "Pilih tanggal dan jam di masa depan." },
  VENUE_NOT_FOUND: { title: "Lokasi tidak ditemukan.", description: "Pilih lokasi lain dari daftar." },
  VENUE_EXISTS: {
    title: "Venue itu sudah ada.",
    description: "Pilih venue tersebut dari daftar lokasi.",
  },
  MABAR_NOT_LIVE: {
    title: "Mabar belum atau sudah tidak berlangsung.",
    description: "Match hanya bisa dimulai saat mabar sedang LIVE dengan pemain yang cukup.",
  },
  MATCH_IN_PROGRESS: {
    title: "Masih ada match yang sedang dimainkan.",
    description: "Submit atau batalkan match itu dulu, baru mulai match berikutnya.",
  },
  TEAM_SIZE_INVALID: { title: "Jumlah pemain per tim belum pas.", description: "Singles 1 lawan 1, Doubles 2 lawan 2." },
  DUPLICATE_PLAYER: { title: "Ada pemain yang dipilih dua kali.", description: "Setiap pemain hanya boleh di satu tim." },
  PLAYER_NOT_IN_MABAR: { title: "Ada pemain yang bukan peserta mabar ini.", description: "Pilih pemain dari daftar peserta." },
  MATCH_NOT_FOUND: { title: "Match tidak ditemukan.", description: "Mungkin sudah dibatalkan organizer." },
  MATCH_ALREADY_FINAL: {
    title: "Hasil match ini sudah official.",
    description: "Skor yang sudah official tidak bisa diubah lagi.",
  },
  RESULT_NOT_PENDING: {
    title: "Hasil ini tidak sedang menunggu konfirmasi.",
    description: "Mungkin sudah dikonfirmasi pemain lain atau sedang diperbaiki organizer.",
  },
  NOT_MATCH_PLAYER: { title: "Kamu tidak main di match ini.", description: "Hanya pemain di match yang bisa konfirmasi hasil." },
  CANNOT_CONFIRM_OWN: {
    title: "Kamu yang mengirim skor ini.",
    description: "Hasil harus dikonfirmasi pemain lain di match supaya adil.",
  },
  INVALID_SCORE: { title: "Skornya belum sah.", description: "Cek lagi set yang ditandai merah." },
  VALIDATION: { title: "Ada isian yang belum pas.", description: "Cek lagi bagian yang ditandai merah." },
  UNKNOWN: { title: "Ada yang salah di sisi kami.", description: "Coba lagi sebentar lagi." },
};

export function userError(code: string): UserError {
  const copy = COPY[code] ?? COPY.UNKNOWN!;
  return { code: COPY[code] ? code : "UNKNOWN", ...copy };
}

/** Maps a Supabase/PostgREST error to user copy without leaking DB details. */
export function fromSupabaseError(error: { message: string; code?: string }, context: string): UserError {
  if (COPY[error.message]) return userError(error.message);
  console.error(`[${context}]`, error);
  return userError("UNKNOWN");
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: UserError; fieldErrors?: Record<string, string> };

/** Initial state for useActionState. */
export const IDLE = { ok: null } as const;
export type ActionState<T = void> = ActionResult<T> | typeof IDLE;
