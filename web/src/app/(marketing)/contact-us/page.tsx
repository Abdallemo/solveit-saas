"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createContact } from "@/features/feadback/server/action";
import {
  ContactFormValues,
  contactSchema,
} from "@/features/feadback/server/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

export default function ContactPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      subject: "",
      message: "",
    },
  });
  const { mutateAsync: handleCreateContact, isPending } = useMutation({
    mutationFn: createContact,
    onSuccess: ({ error }) => {
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Thank you for the contact");
      form.reset();
    },
  });
  const router = useRouter();
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email anytime",
      contact: "admsolveit@gmail.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team",
      contact: "+1 (555) 123-4567",
    },
  ];

  async function onSubmit(data: ContactFormValues) {
    await handleCreateContact(data);
  }

  return (
    <div className="relative overflow-hidden w-full">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 opacity-20 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 opacity-15 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <section className="container mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <MessageSquare className="w-4 h-4" />
            Get In Touch
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Let's Start a{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Conversation
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed">
            Have questions about SolveIt? Interested in partnerships or
            integrations? We'd love to hear from you.
          </p>
        </motion.div>
      </section>

      <section className="container mx-auto max-w-5xl px-6 pb-16">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {contactMethods.map((method, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="pt-6 pb-6 text-center">
                  <method.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {method.description}
                  </p>
                  <p className="text-primary font-medium text-sm">
                    {method.contact}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container mx-auto max-w-3xl px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Send Us a Message
            </h2>
            <p className="text-muted-foreground text-lg">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-8 pb-8 px-6 md:px-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="john@example.com"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company / Organization</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your university or company"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <FormControl>
                          <Input placeholder="What's this about?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about your inquiry..."
                            className="min-h-32 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      disabled={isPending}
                      type="submit"
                      className="w-full h-11 text-base relative"
                      size="lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            By submitting this form, you agree to our privacy policy and terms
            of service.
          </motion.p>
        </motion.div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="pt-12 pb-12 px-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-3">
                Looking for Quick Answers?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Check out our FAQ section for immediate answers to common
                questions about SolveIt.
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/#faq")}
              >
                Visit FAQ
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
