"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
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
            <FileText className="w-4 h-4" />
            Legal
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Terms of Service
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
            Welcome to SolveIt. These Terms of Service govern your use of our
            platform. By creating an account or using our services, you agree to
            these terms. Please read them carefully.
          </p>

          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">1.</span> About SolveIt
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              SolveIt is a peer-to-peer collaboration platform for verified
              university students. The platform connects students who need
              assistance with technical challenges ("Posters") with students who
              can provide guidance and mentorship ("Solvers").
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">2.</span> Eligibility
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use SolveIt, you must:
            </p>
            <ul className="text-muted-foreground space-y-2 list-none pl-0">
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Be at least 18 years old
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Be a currently enrolled university student
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Verify your identity using a valid university email address
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Provide accurate and complete registration information
              </li>
            </ul>
          </div>

          {/* Section 3 - Academic Integrity (highlighted) */}
          <div className="mb-12 p-6 rounded-xl bg-destructive/5 border border-destructive/20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-destructive">
              <span>3.</span> Academic Integrity
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              SolveIt exists to facilitate learning through mentorship and
              collaboration. The platform is not intended for academic
              dishonesty.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium mb-3 text-foreground">
                  Acceptable Use
                </h3>
                <ul className="text-muted-foreground space-y-2 list-none pl-0">
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    Requesting debugging help
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    Code reviews
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    Conceptual explanations
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    Troubleshooting guidance
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-destructive">
                  Prohibited Use
                </h3>
                <ul className="text-muted-foreground space-y-2 list-none pl-0">
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2.5 flex-shrink-0" />
                    Requesting completed assignments
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2.5 flex-shrink-0" />
                    Thesis writing
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2.5 flex-shrink-0" />
                    Exam answers
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2.5 flex-shrink-0" />
                    Work submitted as your own without attribution
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mt-6 text-sm">
              Our moderation system reviews task requests. Violations may result
              in task rejection or account suspension.
            </p>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">4.</span> Payments and Escrow
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                All payments are processed through Stripe. When a Solver accepts
                a task, the agreed payment is held in escrow until the work is
                completed.
              </p>
              <p>
                Upon task completion, Posters have a 7-day review period. If no
                dispute is filed within this window, funds are released to the
                Solver automatically.
              </p>
              <p>
                SolveIt charges a service fee on each transaction. Current fee
                rates are displayed during the payment process.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">5.</span> Disputes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If a Poster is unsatisfied with a delivered solution, they may
              file a dispute within the 7-day review period. Our team will
              review the task requirements, submitted work, and communication
              logs. Dispute decisions are final.
            </p>
          </div>

          {/* Section 6 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">6.</span> User Conduct
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When using SolveIt, you agree to:
            </p>
            <ul className="text-muted-foreground space-y-2 list-none pl-0">
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Communicate respectfully with other users
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Not share illegal, harmful, or offensive content
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Not attempt to circumvent platform security or payment systems
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                Not create multiple accounts or misrepresent your identity
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Violations may result in immediate account termination.
            </p>
          </div>

          {/* Section 7 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">7.</span> Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Work created through SolveIt belongs to the Poster upon payment
              completion, unless otherwise agreed. Solvers retain the right to
              use general knowledge and techniques for future work.
            </p>
          </div>

          {/* Section 8 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">8.</span> Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              SolveIt provides a platform for student collaboration. We do not
              guarantee the quality of work or the outcome of any task. Users
              engage with each other at their own discretion. SolveIt is not
              liable for disputes between users beyond our stated dispute
              resolution process.
            </p>
          </div>

          {/* Section 9 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="text-primary">9.</span> Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. Continued use of the
              platform after changes constitutes acceptance of the revised
              terms. We will notify users of significant changes via email.
            </p>
          </div>

          {/* Contact */}
          <div className="pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3">Questions?</h2>
            <p className="text-muted-foreground">
              Contact us at{" "}
              <a
                href="mailto:legal@solveit.com"
                className="text-primary hover:underline"
              >
                legal@solveit.com
              </a>
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
