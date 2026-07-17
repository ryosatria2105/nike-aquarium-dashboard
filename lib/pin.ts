import bcrypt from "bcryptjs";

// Cost 8 dipilih karena bcryptjs itu pure-JS (bukan native binding), jadi
// makin berat costnya makin kerasa lambat di serverless. Keamanan PIN 4
// digit di app ini sebenarnya ditopang oleh lockout 5x percobaan salah +
// jeda 15 menit (lihat verify-pin/route.ts) — bukan oleh cost bcrypt-nya,
// jadi cost 8 di sini masih aman.
const SALT_ROUNDS = 8;

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}