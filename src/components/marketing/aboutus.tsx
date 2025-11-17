"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Rocket,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AboutPage() {
  const router = useRouter();
  return (
    <div className="relative overflow-hidden w-full">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 opacity-20 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 opacity-15 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <section className="container mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            About SolveIt
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Building the Future of{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Student Collaboration
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed">
            A new way for students to work, learn, and succeed together. SolveIt
            modernizes academic task collaboration and eliminates unreliable
            group chats — unlocking fairness, secure payments, and real
            mentorship, powered by AI.
          </p>
        </motion.div>
      </section>

      <section className="w-full max-w-5xl px-4 mx-auto ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-8 ">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold ">
              How SolveIt Started
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-xl font-semibold mb-4 text-destructive">
                  The Problem
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every university student knows the struggle: chaotic WhatsApp
                  groups, unclear expectations, unpaid work, and stress from
                  last-minute confusion. Traditional tools weren't built for
                  academic execution — they lacked accountability, structure,
                  and transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  The Solution
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  SolveIt was born from that reality. What started as
                  frustration became a vision: a smarter, trusted digital
                  workspace where students can collaborate effectively, get
                  fairly compensated, and access real support — without
                  compromising academic integrity.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}>
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="pt-12 pb-12 px-8 md:px-12">
              <div className="flex items-start gap-4">
                <div className="w-1 h-full bg-primary rounded-full" />
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">
                    Our Mission
                  </h3>
                  <blockquote className="text-2xl md:text-3xl font-semibold leading-relaxed text-balance">
                    To empower students through a fair and trusted collaboration
                    platform where learning, contribution, and compensation grow
                    together — with integrity.
                  </blockquote>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="container mx-auto max-w-5xl px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">What's Next</h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6">
            {[
              "AI task evaluation & difficulty scoring",
              "Verified portfolio of completed work",
              "Mobile apps for iOS & Android",
              "Multi-university expansion & partnerships",
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="pt-6 pb-6 flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground font-medium">{item}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto max-w-5xl px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Meet the Founder</h2>
          </div>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-8 pb-8 px-6 md:px-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="w-20 h-20 flex-shrink-0">
                  <AvatarImage src="/abdallemo.jpg" alt="Abdullahi" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-primary-foreground">
                    A
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Abdullahi</h3>
                  <p className="text-primary font-medium mb-4">
                    Founder & Lead Developer
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Passionate about building meaningful technology that
                    transforms student collaboration, Abdullahi is committed to
                    creating solutions that promote fairness, transparency, and
                    real educational value — engineered with care and driven by
                    real student experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="pt-16 pb-16 px-8">
              <Rocket className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join the Journey
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Unlock a smarter way to collaborate and grow together.
              </p>
              <motion.button
                onClick={() => router.push("/dashboard")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity">
                Get Started
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
