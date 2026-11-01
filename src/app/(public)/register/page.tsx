import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = { title: "Daftar" };

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
