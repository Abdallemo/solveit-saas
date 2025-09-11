"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mouse } from "lucide-react";
import Link from "next/link";
import { animate, motion } from "framer-motion";
import { MinimalLogoTicker } from "./LogoTicker";
import { techLogos } from "./mockdata";
import { useState, useEffect } from "react";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.25, 0, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div className="relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl"
          variants={{
            animate: {
              y: [-10, 10, -10],
              transition: {
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            },
          }}
          animate="animate"
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-indigo-500/20 to-primary/20 rounded-full blur-xl"
          variants={{
            animate: {
              y: [-10, 10, -10],
              transition: {
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            },
          }}
          animate="animate"
          transition={{ delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-lg"
          variants={{
            animate: {
              y: [-10, 10, -10],
              transition: {
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            },
          }}
          animate="animate"
          transition={{ delay: 4 }}
        />

        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 30,
          }}
        />
      </div>

      <motion.section
        className="relative z-10 container flex min-h-[calc(100vh-3.5rem)] max-w-screen-2xl flex-col items-center justify-center space-y-8 py-24 text-center md:py-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        <motion.div className="space-y-4" variants={itemVariants}>
          <motion.h1
            className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            variants={itemVariants}>
            <motion.span
              className="block text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              Welcome to
            </motion.span>

            <motion.span
              className="relative inline-block bg-gradient-to-br from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent bg-[length:200%_200%]"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              whileHover={{ scale: 1.02 }}>
              Solveit
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-indigo-500/20 to-purple-600/20 blur-2xl -z-10"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.span>

            <motion.span
              className="inline-block text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}>
              Smart{" "}
              <motion.span
                className="inline-block relative underline decoration-primary/70 underline-offset-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                Collaboration
                <motion.div
                  className="absolute -inset-2 bg-primary/10 rounded-lg -z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.span>
              {" & "}
              <motion.span
                className="text-primary"
                animate={{
                  textShadow: [
                    "0 0 0px rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 0px rgba(59, 130, 246, 0)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}>
                Payments
              </motion.span>{" "}
              for Students.
            </motion.span>
          </motion.h1>

          <motion.p
            className="mx-auto max-w-[38rem] leading-relaxed text-muted-foreground sm:text-base sm:leading-7"
            variants={itemVariants}>
            Say goodbye to messy group chats and unreliable task sharing.
            <span className="hidden sm:inline">
              <br />
            </span>
            <motion.span
              className="text-foreground font-medium"
              whileHover={{ color: "hsl(var(--primary))" }}
              transition={{ duration: 0.2 }}>
              SolveIt
            </motion.span>{" "}
            helps students connect, collaborate, and get rewarded — backed by
            AI, clear pricing, and built-in trust.
          </motion.p>
        </motion.div>

        <motion.div className="flex gap-2" variants={itemVariants}>
          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <Button size="lg" asChild>
              <Link href={"#Demo"}>
                Explore SolveIt
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 3, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </Link>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <Button variant="outline" size="lg" asChild>
              <Link href={"/dashboard"}>Get Started</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div className="w-full max-w-4xl" variants={itemVariants}>
          <motion.p
            className="text-sm font-medium text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}>
            Built with modern technologies
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}>
            <MinimalLogoTicker speed="fast" logos={techLogos.slice(0, 6)} />
          </motion.div>
        </motion.div>
        <motion.div
          className="flex flex-col items-center space-y-1 pt-4"
          variants={itemVariants}>
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}>
            <Mouse className="h-6 w-6 text-muted-foreground/60" />
          </motion.div>
          <p className="text-xs text-muted-foreground/60">
            Move your mouse around
          </p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
          {[
            { number: "8K+", label: "Academic Tasks Posted" },
            { number: "98%", label: "On-Time Completion Rate" },
            { number: "100%", label: "AI Moderation Uptime" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <motion.div
                className="text-3xl font-bold text-primary mb-2"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.5,
                  ease: "easeInOut",
                }}>
                {stat.number}
              </motion.div>
              <div className="text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}
