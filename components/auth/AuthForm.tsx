"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n";

type AuthFormProps = { mode: "login" | "register" };

export default function AuthForm({ mode }: AuthFormProps) {
  const { t } = useLanguage();
  const isRegister = mode === "register";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (isRegister && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const result = isRegister
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/profile");
      router.refresh();
    } catch {
      setErrorMessage("Could not connect to PartyFind. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-7 shadow-2xl shadow-black/20 sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">{t("PartyFind account")}</p>
      <h1 className="mt-3 text-3xl font-bold">{t(isRegister ? "Find your next team" : "Welcome back")}</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{t(isRegister ? "Create an account to build your player profile and meet teammates." : "Sign in to manage your player profile.")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {isRegister && <label className="block text-sm font-medium text-zinc-200">{t("Display name")}<input required autoComplete="nickname" maxLength={24} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder={t("Your player name")} /></label>}
        <label className="block text-sm font-medium text-zinc-200">{t("Email")}<input required autoComplete="email" type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="you@example.com" /></label>
        <label className="block text-sm font-medium text-zinc-200">{t("Password")}<input required autoComplete={isRegister ? "new-password" : "current-password"} type="password" minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} placeholder={t(isRegister ? "At least 8 characters" : "Your password")} /></label>
        {isRegister && <label className="block text-sm font-medium text-zinc-200">{t("Confirm password")}<input required autoComplete="new-password" type="password" minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} /></label>}
        {errorMessage && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">{errorMessage}</p>}
        <button type="submit" disabled={pending} className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">{pending ? t("Please wait…") : t(isRegister ? "Create account" : "Sign in")}</button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        {isRegister ? "Already have an account? " : "New to PartyFind? "}
        <Link href={isRegister ? "/login" : "/register"} className="font-medium text-blue-400 hover:text-blue-300">{isRegister ? "Sign in" : "Create an account"}</Link>
      </p>
    </section>
  );
}
