"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TermsOfServiceDialogProps {
  onAccept: () => Promise<void>;
  isPending?: boolean;
}

export function TermsOfServiceDialog({
  onAccept,
  isPending = false,
}: TermsOfServiceDialogProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 5) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <div
      className="w-full max-w-5xl bg-background border rounded-lg shadow-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-col space-y-1.5 p-6 pb-3 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Terms of Service & Privacy Policy
        </h2>
        <p className="text-sm text-muted-foreground">
          Please read and scroll through our complete terms to continue
        </p>
      </div>

      <Separator />

      {/* FIX: Added 'overscroll-y-contain'.
            This tells the browser: "If the user scrolls to the bottom of this div,
            STOP there. Do not pass the scroll event to the body parent."
        */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth overscroll-y-contain"
        onScroll={handleScroll}
      >
        <div className="space-y-8 pr-2">
          {/* --- CONTENT START --- */}
          <section className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">
                SolveIt – Terms of Service
              </h3>
              <p className="text-sm text-muted-foreground">
                Effective Date: December 1, 2025
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Welcome to SolveIt. These Terms of Service ("Terms") govern your
              access to and use of the SolveIt platform, including our website,
              applications, and services (collectively, the "Platform"). By
              creating an account or using SolveIt, you agree to be bound by
              these Terms. If you do not agree, you may not use the Platform.
            </p>

            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-base font-semibold">1. About SolveIt</h4>
                <p className="text-sm leading-relaxed">
                  SolveIt is a peer-to-peer academic collaboration platform
                  designed exclusively for verified university students. The
                  Platform connects:
                </p>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1.5 ml-4">
                  <li>
                    <span className="font-medium">Posters</span> — students
                    seeking academic guidance or technical assistance
                  </li>
                  <li>
                    <span className="font-medium">Solvers</span> — students
                    offering mentorship, explanations, and problem-solving
                    support
                  </li>
                </ul>
                <p className="text-sm leading-relaxed">
                  SolveIt is intended to support learning, understanding, and
                  skill development, not academic misconduct.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-semibold">2. Eligibility</h4>
                <p className="text-sm leading-relaxed">
                  To use SolveIt, you must:
                </p>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1.5 ml-4">
                  <li>Be at least 18 years old</li>
                  <li>Be a currently enrolled university student</li>
                  <li>
                    Verify your identity using a valid university email address
                  </li>
                  <li>
                    Provide accurate, complete, and truthful information during
                    registration
                  </li>
                </ul>
                <p className="text-sm leading-relaxed">
                  SolveIt reserves the right to suspend or terminate accounts
                  that fail to meet these requirements.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-semibold">
                  3. Academic Integrity
                </h4>
                <p className="text-sm leading-relaxed">
                  SolveIt is built around ethical learning and academic
                  integrity.
                </p>
                <div className="ml-4 space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-1.5">
                      Acceptable Use
                    </h5>
                    <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                      <li>Debugging and troubleshooting help</li>
                      <li>Code reviews</li>
                      <li>Conceptual explanations</li>
                      <li>Step-by-step guidance and mentoring</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1.5">
                      Prohibited Use
                    </h5>
                    <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                      <li>
                        Completed assignments or coursework for submission
                      </li>
                      <li>Thesis or dissertation writing</li>
                      <li>Exam questions or answers</li>
                      <li>
                        Any work intended to be submitted as one's own without
                        proper attribution
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-semibold">
                  4. Payments, Escrow, and Service Fees
                </h4>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1.5 ml-4">
                  <li>All payments are processed securely through Stripe</li>
                  <li>
                    When a Solver accepts a task, the agreed payment is placed
                    into escrow
                  </li>
                  <li>
                    Funds remain in escrow until the task is completed and
                    reviewed
                  </li>
                  <li>
                    SolveIt charges a platform service fee on each transaction.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-semibold">
                  5. Task Completion, Review Period, and Disputes
                </h4>
                <div className="ml-4 space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-1.5">
                      Review Period
                    </h5>
                    <p className="text-sm leading-relaxed">
                      After task delivery, Posters are granted a 7-day review
                      period to evaluate the work. If no dispute is submitted
                      within this period, payment is automatically released to
                      the Solver.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1.5">
                      Dispute Policy (Final and Binding)
                    </h5>
                    <p className="text-sm leading-relaxed mb-1">
                      Posters may submit one (1) dispute only per task during
                      the 7-day review period. Disputes are reviewed by SolveIt
                      moderators based on:
                    </p>
                    <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                      <li>Task requirements</li>
                      <li>Delivered work</li>
                      <li>Platform communication logs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-semibold">6. User Conduct</h4>
                <p className="text-sm leading-relaxed">You agree to:</p>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1.5 ml-4">
                  <li>Communicate respectfully and professionally</li>
                  <li>Avoid illegal, abusive, or harmful content</li>
                  <li>
                    Not bypass platform safeguards, escrow, or payment systems
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          {/* Privacy Policy */}
          <section className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">
                SolveIt – Privacy Policy
              </h3>
              <p className="text-sm text-muted-foreground">
                Effective Date: December 1, 2025
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              SolveIt is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, and safeguard your
              information.
            </p>

            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-base font-semibold">
                  1. Information We Collect
                </h4>
                <div className="ml-4 space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-1.5">
                      Account Information
                    </h5>
                    <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                      <li>Name</li>
                      <li>University email address</li>
                      <li>Student verification documents</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1.5">Usage Data</h5>
                    <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                      <li>Task postings</li>
                      <li>Messages</li>
                      <li>Transaction history</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-semibold">2. Data Security</h4>
                <p className="text-sm leading-relaxed">
                  We implement encryption, access controls, and secure
                  infrastructure. However, no online system is completely
                  risk-free.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-semibold">3. Data Retention</h4>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1.5 ml-4">
                  <li>Data is retained while your account is active</li>
                  <li>Financial records are retained for legal compliance</li>
                  <li>You may request account deletion at any time</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-semibold">4. Your Rights</h4>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1.5 ml-4">
                  <li>Access your data</li>
                  <li>Correct inaccuracies</li>
                  <li>Delete your data</li>
                </ul>
              </div>

              <div className="space-y-3" id="contact-section">
                <h4 className="text-base font-semibold">5. Contact Us</h4>
                <p className="text-muted-foreground mb-2">
                  For questions about these Terms or Privacy Policy, contact:
                </p>
                <p className="text-foreground font-medium">
                  support@solveit.app
                </p>
              </div>
            </div>
          </section>
          {/* --- CONTENT END --- */}
        </div>
      </div>

      <Separator />

      <div className="p-6 pt-4 bg-background">
        <Button
          onClick={onAccept}
          disabled={!hasScrolledToBottom || isPending}
          className="w-full"
          size="lg"
        >
          {isPending
            ? "Processing..."
            : hasScrolledToBottom
              ? "I Agree to Terms & Privacy Policy"
              : "Scroll to Bottom to Continue"}
        </Button>
      </div>
    </div>
  );
}
