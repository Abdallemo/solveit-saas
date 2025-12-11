import {
  Apple,
  Bolt,
  Building2,
  Car,
  Code2,
  Film,
  GraduationCap,
  Home,
  Lock,
  Music,
  Package,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import {
  DrizzleIcon,
  NextjsIcon,
  OpenAIIcon,
  StripeIcon,
  TailwindCssIcon,
  TypescriptIcon,
} from "./logos/drizzle";

export const techLogos = [
  {
    name: "Next.js",
    icon: NextjsIcon,
    color: "text-slate-900 dark:text-white",
  },
  { name: "Stripe", icon: StripeIcon, color: "text-purple-600" },
  { name: "React", icon: Code2, color: "text-blue-500" },
  { name: "TypeScript", icon: TypescriptIcon, color: "text-blue-600" },
  { name: "Tailwind CSS", icon: TailwindCssIcon, color: "text-cyan-500" },
  { name: "Drizlle Orm", icon: DrizzleIcon, color: "text-cyan-500" },
  { name: "OpenAI", icon: OpenAIIcon, color: "text-green-600" },
];

export const companyLogos = [
  { name: "Microsoft", icon: Building2, color: "text-blue-600" },
  { name: "Google", icon: Search, color: "text-red-500" },
  { name: "Amazon", icon: Package, color: "text-orange-500" },
  { name: "Meta", icon: Users, color: "text-blue-500" },
  { name: "Apple", icon: Apple, color: "text-gray-800 dark:text-gray-200" },
  { name: "Netflix", icon: Film, color: "text-red-600" },
  { name: "Spotify", icon: Music, color: "text-green-500" },
  { name: "Uber", icon: Car, color: "text-black dark:text-white" },
  { name: "Airbnb", icon: Home, color: "text-red-500" },
  { name: "Tesla", icon: Bolt, color: "text-red-600" },
];

export const features = [
  {
    name: "AI Integrity Guard",
    description:
      "Our proprietary AI analyzes every request against strict academic rules to ensure collaboration never crosses into dishonesty.",
    icon: ShieldCheck,
  },
  {
    name: "Live Mentorship Suite",
    description:
      "Experience lag-free debugging with our custom-built WebRTC video and persistent WebSocket chat environments.",
    icon: Video,
  },
  {
    name: "Smart Escrow",
    description:
      "Funds are held securely in Stripe and only released after a guaranteed 7-day review window following solution delivery.",
    icon: Lock,
  },
  {
    name: "AI Task Drafter",
    description:
      "Stuck? Our AI instantly suggests titles, descriptions, categories, and fair market pricing based on your problem context.",
    icon: Sparkles,
  },
  {
    name: "Fair Dispute Resolution",
    description:
      "A structured, moderator-reviewed refund process ensures fairness for both Solvers and Posters if things go wrong.",
    icon: Scale,
  },
  {
    name: "Student-Centric Network",
    description:
      "A verified community dedicated to Final Year Project (FYP) support, skill exchange, and peer-to-peer technical growth.",
    icon: GraduationCap,
  },
];

export const stats = [
  { value: "1.2K+", label: "Active Students" },
  { value: "1K+", label: "Tasks Completed" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "RM100k+", label: "Paid to Solvers" },
];

export const testimonials = [
  {
    quote:
      "SolveIt helped me find a tutor for my calculus exam in minutes. The escrow system gave me peace of mind.",
    author: "Sarah M.",
    role: "Computer Science, Year 3",
  },
  {
    quote:
      "As a solver, I've earned enough to cover my textbooks. The platform is intuitive and payments are always on time.",
    author: "James K.",
    role: "Engineering, Year 4",
  },
  {
    quote:
      "The AI matching is incredible. It connected me with someone who specialized in exactly what I needed help with.",
    author: "Emily R.",
    role: "Mathematics, Year 2",
  },
];

export const plans = [
  {
    name: "Poster",
    price: "$0",
    teir: "POSTER" as const,
    features: [
      "Post unlimited tasks",
      "AI-powered solver matching",
      "Secure escrow payments",
      "Basic chat support",
      "Task history & analytics",
    ],
  },
  {
    name: "Solver",
    price: "$9.99",
    teir: "SOLVER" as const,
    features: [
      "Everything in Poster",
      "Priority in search results",
      "Lower platform fees",
      "Advanced analytics dashboard",
      "Verified solver badge",
      "Video call integration",
    ],
  },
];

export const faqs = [
  {
    question: "What is SolveIt?",
    answer:
      "SolveIt is a platform that connects students who need help with academic tasks to skilled solvers who can provide mentoring and collaboration, all while maintaining academic integrity.",
  },
  {
    question: "Is SolveIt free to use?",
    answer:
      "Yes, registration and basic usage are completely free. You only pay when you post a task, and solvers receive their earnings minus a small platform fee.",
  },
  {
    question: "How does the escrow system work?",
    answer:
      "When you post a task, your payment is held securely in escrow. Once you confirm the task is completed satisfactorily, the funds are released to the solver. This protects both parties.",
  },
  {
    question: "Can I offer mentorship instead of solving tasks?",
    answer:
      "You can register as a mentor and offer guided assistance through video calls, screen sharing, and collaborative sessions.",
  },
  {
    question: "How is academic integrity maintained?",
    answer:
      "All tasks and communications are monitored using AI-based moderation. We have strict guidelines against cheating, and our community is focused on learning and collaboration, not shortcuts.",
  },
];
