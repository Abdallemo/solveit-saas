import {
  Code2,
  Palette,
  Triangle,
  Zap,
  Diamond,
  Bot,
  CreditCard,
  Circle,
  Building2,
  Search,
  Package,
  Users,
  Apple,
  Film,
  Music,
  Car,
  Home,
  Bolt,
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
