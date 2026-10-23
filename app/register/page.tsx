import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="flex min-h-[70vh] items-center justify-center px-6 py-14">
        <AuthForm mode="register" />
      </section>
      <Footer />
    </main>
  );
}
