"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="relative overflow-hidden w-full">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 opacity-20 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 opacity-15 blur-3xl" />
      </div>

      {/* Header Section */}
      <section className="container mx-auto max-w-4xl px-6 pt-20 pb-12 md:pt-32 md:pb-16">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            Legal
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Effective Date: December 1, 2025
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="container mx-auto max-w-4xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-neutral dark:prose-invert max-w-none"
        >
          {/* Intro */}
          <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-6 mb-12">
            At SolveIt, we take your privacy seriously. This policy explains
            what information we collect, how we use it, and your rights
            regarding your data.
          </p>

          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <span className="text-primary">1.</span> Information We Collect
            </h2>

            <div className="space-y-6">
              <div className="border-b border-border pb-6">
                <h3 className="font-medium text-foreground mb-2">
                  Account Information
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you create an account, we collect your name, university
                  email address, and student verification documents. This
                  information is required to verify your eligibility and
                  maintain platform security.
                </p>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="font-medium text-foreground mb-2">
                  Profile Information
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may choose to add additional information to your profile,
                  including your academic major, skills, and a profile photo.
                  This information helps other users find suitable
                  collaborators.
                </p>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="font-medium text-foreground mb-2">Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information about how you use the platform,
                  including task postings, messages, and transaction history.
                  This data is used to provide our services and improve the
                  platform.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2">
                  Communication Data
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Text messages sent through our chat system are stored to
                  enable dispute resolution and maintain platform safety. Video
                  and audio calls use peer-to-peer technology and are not
                  recorded by SolveIt.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">2.</span> How We Use Your
              Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="text-muted-foreground space-y-2 list-none pl-0">
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Provide and maintain the SolveIt platform
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Verify your student status and identity
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Process payments and facilitate transactions
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Match Posters with suitable Solvers
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Resolve disputes between users
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Improve our services and develop new features
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Communicate with you about your account and platform updates
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">3.</span> Information Sharing
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We do not sell your personal information. We share your data only
              in the following circumstances:
            </p>

            <div className="space-y-4">
              <div className="pl-4 border-l-2 border-border">
                <h3 className="font-medium text-foreground mb-1">
                  With other users
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your profile information is visible to other platform users to
                  facilitate collaboration.
                </p>
              </div>

              <div className="pl-4 border-l-2 border-border">
                <h3 className="font-medium text-foreground mb-1">
                  Payment processing
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We share necessary information with Stripe to process
                  payments. Stripe handles all payment data according to their
                  privacy policy.
                </p>
              </div>

              <div className="pl-4 border-l-2 border-border">
                <h3 className="font-medium text-foreground mb-1">
                  Legal requirements
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may disclose information if required by law or to protect
                  our rights and the safety of our users.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">4.</span> Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your information. This includes encryption, secure
              servers, and regular security assessments. However, no method of
              transmission over the internet is completely secure.
            </p>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">5.</span> Data Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active
              or as needed to provide our services. Transaction records are kept
              for legal and accounting purposes. You may request deletion of
              your account and associated data at any time.
            </p>
          </div>

          {/* Section 6 - Your Rights (highlighted) */}
          <div className="mb-12 p-6 rounded-xl bg-primary/5 border border-primary/20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">6.</span> Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the right to:
            </p>
            <ul className="text-muted-foreground space-y-2 list-none pl-0">
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Access the personal information we hold about you
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Request correction of inaccurate information
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Request deletion of your information
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Object to or restrict certain processing of your data
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Request a copy of your data in a portable format
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4 text-sm">
              To exercise these rights, contact us at the email address below.
            </p>
          </div>

          {/* Section 7 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">7.</span> Cookies
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to keep you logged in,
              remember your preferences, and understand how you use our
              platform. You can control cookie settings through your browser.
            </p>
          </div>

          {/* Section 8 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">8.</span> Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy periodically. We will notify you of
              significant changes via email or through the platform. Your
              continued use of SolveIt after changes take effect constitutes
              acceptance of the revised policy.
            </p>
          </div>

          {/* Contact */}
          <div className="pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3">Questions?</h2>
            <p className="text-muted-foreground">
              For questions about this policy or to exercise your data rights,
              contact us at{" "}
              <a
                href="mailto:privacy@solveit.com"
                className="text-primary hover:underline"
              >
                privacy@solveit.com
              </a>
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
