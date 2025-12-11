"use client";

import { features } from "@/components/marketing/mockdata";
import { AnimatePresence, motion } from "framer-motion";
import { Bot } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
  {
    quote:
      "SolveIt helped me find the perfect study partner for my final year project. The AI matching is incredible!",
    author: "Ahmad Rahman",
    role: "Computer Science, UTHM",
    avatar: "/professional-man.png",
  },
  {
    quote:
      "I've built my reputation helping juniors with programming tasks. Great platform for academic growth!",
    author: "Siti Nurhaliza",
    role: "Software Engineering, UTHM",
    avatar: "/professional-woman-diverse.png",
  },
  {
    quote:
      "The secure environment gives me confidence to collaborate on sensitive academic work.",
    author: "Maria Santos",
    role: "Information Technology, UTHM",
    avatar: "/latina-professional-woman.png",
  },
];

export default function FeaturePanelWithAnimation() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      clearInterval(featureInterval);
      clearInterval(testimonialInterval);
    };
  }, []);

  const CurrentIcon = features[currentFeature].icon;

  return (
    <div className="relative h-full bg-gradient-to-br from-primary/5 via-background to-accent/10 overflow-hidden">
      <div className="absolute inset-0">
        <Motion3DBackground />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-12 py-16">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          <motion.div
            className="flex items-center gap-2 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Bot className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              AI-Powered Task Collaboration
            </span>
          </motion.div>
          <motion.h2
            className="text-4xl font-bold text-foreground mb-4 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Discover how SolveIt revolutionizes task management
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground text-pretty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Secure payments, and academic collaboration with cutting-edge AI
            technology.
          </motion.p>
        </motion.div>

        <div className="mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 transition-all duration-500 hover:shadow-lg"
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex-shrink-0"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <CurrentIcon className="w-6 h-6 text-primary" />
                  </div>
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <motion.h3
                      className="text-xl font-semibold text-foreground"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      {features[currentFeature].name}
                    </motion.h3>
                    {/* <motion.span
                      className="text-sm font-medium text-white bg-primary px-3 py-1 rounded-full"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.4, type: "spring" }}
                    >
                      {features[currentFeature].stats}
                    </motion.span> */}
                  </div>
                  <motion.p
                    className="text-muted-foreground text-pretty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    {features[currentFeature].description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-6">
            {features.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentFeature
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 w-2"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  backgroundColor:
                    index === currentFeature
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground) / 0.3)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-6 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.01, y: -1 }}
            >
              <div className="flex items-start gap-4">
                <motion.img
                  src={
                    testimonials[currentTestimonial].avatar ||
                    "/placeholder.svg"
                  }
                  alt={testimonials[currentTestimonial].author}
                  className="w-12 h-12 rounded-full object-cover"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1, type: "spring" }}
                />
                <div className="flex-1">
                  <motion.blockquote
                    className="text-foreground font-medium mb-2 text-pretty"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {testimonials[currentTestimonial].quote}
                  </motion.blockquote>
                  <motion.div
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <span className="font-medium">
                      {testimonials[currentTestimonial].author}
                    </span>
                    <span className="mx-1">•</span>
                    <span>{testimonials[currentTestimonial].role}</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* <motion.div
          className="grid grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, staggerChildren: 0.1 }}
        >
          {[
            { value: "2,500+", label: "UTHM Students" },
            { value: "99.9%", label: "Success Rate" },
            { value: "24/7", label: "AI Matching" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div> */}
      </div>
    </div>
  );
}
export function Motion3DBackground() {
  return (
    <>
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-32 right-16 w-24 h-24 bg-accent/20 rounded-full blur-lg"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-muted/30 rounded-full blur-md"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </>
  );
}
