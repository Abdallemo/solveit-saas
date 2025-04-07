import {
  BadgeCheck,
  Bot,
  Handshake,
  MessageCircleCode,
  UserCheck,
} from "lucide-react";

const features = [
  {
    name: "AI Task Matching",
    description:
      "Smart matching system connects students with relevant academic tasks using AI-driven categorization.",
    icon: Bot,
  },
  {
    name: "Secure & Fair Collaboration",
    description:
      "Built-in measures promote academic integrity while enabling fair and transparent peer-to-peer task handling.",
    icon: BadgeCheck,
  },
  {
    name: "Skill & Reputation Growth",
    description:
      "Earn reputation, build your portfolio, and get recognized for consistent quality and effort.",
    icon: UserCheck,
  },
  {
    name: "Mentorship & Communication",
    description:
      "Students can offer mentorship, connect through messages, and grow academically together.",
    icon: MessageCircleCode,
  },
  {
    name: "Verified UTHM Environment",
    description:
      "Exclusively for UTHM students with verified IDs to ensure a trusted and safe community.",
    icon: Handshake,
  },
];

export default function Features() {
  return (
    <section className="container space-y-16 py-24 md:py-32" id="features">
      <div className="mx-auto max-w-[58rem] text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          AI-Powered Task Collaboration
        </h2>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          Discover how SolveIt revolutionizes task management, secure payments,
          and academic collaboration with cutting-edge AI technology.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="relative overflow-hidden rounded-lg border bg-background p-8">
            <div className="flex items-center gap-4">
              <feature.icon className="h-8 w-8" />
              <h3 className="font-bold">{feature.name}</h3>
            </div>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
