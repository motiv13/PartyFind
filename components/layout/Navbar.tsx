import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform duration-300 hover:scale-105"
        >
          <Gamepad2
            size={30}
            className="text-blue-500 transition-colors duration-300"
          />

          <span className="text-2xl font-bold tracking-tight text-white">
            PartyFind
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-zinc-400 transition duration-300 hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/players"
            className="text-zinc-400 transition duration-300 hover:text-white"
          >
            Players
          </Link>

          <Link
            href="/communities"
            className="text-zinc-400 transition duration-300 hover:text-white"
          >
            Communities
          </Link>

          <Link
            href="/profile"
            className="text-zinc-400 transition duration-300 hover:text-white"
          >
            Profile
          </Link>
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-5 py-2 text-white transition duration-300 hover:text-blue-400"
          >
            Login
          </Link>

          <Link
  href="/register"
  className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-blue-500"
>
  Register
</Link>
        </div>
      </div>
    </header>
  );
}