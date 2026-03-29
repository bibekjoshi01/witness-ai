"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const revealEase: [number, number, number, number] = [0.23, 0.86, 0.39, 0.96];
const fadeEase: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: revealEase,
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroGeometric({
  badge = "Witness AI",
  title1 = "Reflect Gently,",
  title2 = "Notice Patterns Early",
  description = "Structured daily reflection and calm, actionable insights for emotional clarity.",
  theme = "light",
}: {
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: fadeEase,
      },
    }),
  };

  return (
    <div
      className={cn(
        "relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-300",
        isDark ? "bg-[#0b0d10]" : "bg-[#f8fafc]"
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.10),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.08),transparent_40%)]"
            : "bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.10),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.10),transparent_40%)]"
        )}
      />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.25}
          width={520}
          height={120}
          rotate={10}
          gradient={isDark ? "from-white/[0.08]" : "from-sky-500/[0.10]"}
          className="left-[-15%] md:left-[-8%] top-[18%] md:top-[22%]"
        />
        <ElegantShape
          delay={0.45}
          width={440}
          height={110}
          rotate={-12}
          gradient={isDark ? "from-emerald-400/[0.10]" : "from-emerald-400/[0.12]"}
          className="right-[-12%] md:right-[-6%] top-[62%] md:top-[68%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6",
              isDark
                ? "bg-white/[0.04] border border-white/[0.10]"
                : "bg-white/90 border border-slate-900/10 shadow-sm"
            )}
          >
            <Circle className="h-2 w-2 fill-emerald-400/80 text-emerald-400/80" />
            <span className={cn("text-sm tracking-wide", isDark ? "text-white/70" : "text-slate-700")}>{badge}</span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 md:mb-8 tracking-tight">
              <span
                className={cn(
                  "bg-clip-text text-transparent",
                  isDark
                    ? "bg-gradient-to-b from-white to-white/80"
                    : "bg-gradient-to-b from-slate-900 to-slate-700"
                )}
              >
                {title1}
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent",
                  isDark
                    ? "bg-gradient-to-r from-sky-200 via-white/90 to-emerald-200"
                    : "bg-gradient-to-r from-sky-700 via-slate-800 to-emerald-600"
                )}
              >
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p
              className={cn(
                "text-base sm:text-lg md:text-xl mb-8 leading-relaxed font-light tracking-wide max-w-4xl mx-auto px-4",
                isDark ? "text-white/55" : "text-slate-600"
              )}
            >
              {description}
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "mx-auto w-full max-w-md rounded-2xl p-2 backdrop-blur-md",
              isDark
                ? "border border-white/15 bg-white/5"
                : "border border-slate-900/10 bg-white/80 shadow-sm"
            )}
          >
            <img
              src="https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=1200&q=80"
              alt="Calm mountains and clouds"
              className={cn(
                "h-32 w-full rounded-xl object-cover",
                isDark ? "opacity-80" : "opacity-95"
              )}
            />
          </motion.div>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          isDark
            ? "bg-gradient-to-t from-[#0b0d10] via-transparent to-[#0b0d10]/70"
            : "bg-gradient-to-t from-slate-50 via-transparent to-white/80"
        )}
      />
    </div>
  );
}

export { HeroGeometric };
