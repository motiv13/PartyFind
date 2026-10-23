import Navbar from "@/components/layout/Navbar";

import Hero from "@/components/home/Hero";
import PopularGames from "@/components/home/PopularGames";
import Features from "@/components/home/Features";
import Stats from "@/components/home/Stats";
import CTA from "@/components/home/CTA";

import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      <Hero />
      <Stats />
      <PopularGames />
      <Features />
      <CTA />
      <Footer/>
    </main>
  );
}
