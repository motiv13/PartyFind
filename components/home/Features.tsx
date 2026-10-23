"use client";

import { Target, Users, MessageCircle, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const features = [
  {
    icon: Target,
    title: "Find by Role",
    description:
      "Search for tanks, healers, supports or teammates for any game.",
  },
  {
    icon: Users,
    title: "Communities",
    description:
      "Join communities and stay connected with players.",
  },
  {
    icon: MessageCircle,
    title: "Built-in Chat",
    description:
      "Talk with your team without leaving PartyFind.",
  },
  {
    icon: Zap,
    title: "Fast Matchmaking",
    description:
      "Find teammates in just a few clicks.",
  },
];

export default function Features() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          {t("Why PartyFind?")}
        </h2>

        <p className="mt-4 text-lg text-zinc-400">
          {t("Everything you need to build your perfect gaming squad.")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:bg-zinc-800/70 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="h-1 w-12 rounded-full bg-blue-500 mb-8 transition-all duration-300 group-hover:w-20"></div>

              <div className="mb-6">
                <Icon
                  size={42}
                  className="text-blue-400 transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <h3 className="text-2xl font-semibold text-white mb-3">
                {t(feature.title)}
              </h3>

              <p className="text-zinc-400 leading-7">
                {t(feature.description)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
