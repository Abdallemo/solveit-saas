
import { BlogContentViewer } from "@/components/marketing/viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// This would come from your database
async function getBlogPost(slug: string) {
  // Simulating server data fetch
  const posts = {
    "how-to-land-your-first-student-job": {
      id: "1",
      title: "How to Land Your First Student Job: A Complete Guide",
      slug: "how-to-land-your-first-student-job",
      content: `
        <h2>Getting Started with Your Job Search</h2>
        <p>Starting your first job search as a student can be intimidating, but with the right approach, you'll be well on your way to landing that perfect role. In this comprehensive guide, we'll walk through every step of the process.</p>
        
        <h3>1. Understanding What Employers Look For</h3>
        <p>Before you start applying, it's crucial to understand what employers value in student candidates. While experience is great, many employers prioritize:</p>
        <ul>
          <li><strong>Enthusiasm and willingness to learn</strong> - Show genuine interest in the role and company</li>
          <li><strong>Reliability and professionalism</strong> - Demonstrate that you can balance work and studies</li>
          <li><strong>Relevant skills</strong> - Even from coursework, projects, or volunteer work</li>
          <li><strong>Communication abilities</strong> - Both written and verbal</li>
        </ul>
        
        <h3>2. Crafting Your Application Materials</h3>
        <p>Your resume and cover letter are your first impression. Make them count by:</p>
        <ul>
          <li>Tailoring each application to the specific role</li>
          <li>Highlighting relevant coursework and projects</li>
          <li>Including any volunteer work or extracurricular activities</li>
          <li>Keeping formatting clean and professional</li>
        </ul>
        
        <blockquote>
          <p>"The best applications tell a story about why you're passionate about the role and how your unique experiences make you a great fit." - Sarah Johnson, Career Advisor</p>
        </blockquote>
        
        <h3>3. Where to Find Opportunities</h3>
        <p>Don't limit yourself to just one job board. Cast a wide net by exploring:</p>
        <ul>
          <li>Your university's career services portal</li>
          <li>Student-focused job boards like SolveIt</li>
          <li>Company websites directly</li>
          <li>Professional networking events</li>
          <li>LinkedIn and other professional networks</li>
        </ul>
        
        <h3>4. Preparing for Interviews</h3>
        <p>Once you land an interview, preparation is key. Research the company, practice common interview questions, and prepare questions to ask the interviewer. Remember, interviews are a two-way street - you're evaluating if the role is right for you too.</p>
        
        <h3>5. Following Up</h3>
        <p>After your interview, send a thank-you email within 24 hours. This shows professionalism and keeps you top of mind. If you don't hear back within the stated timeline, it's appropriate to send a polite follow-up email.</p>
        
        <h2>Final Thoughts</h2>
        <p>Landing your first student job takes effort, but every application and interview is a learning experience. Stay persistent, keep refining your approach, and remember that rejection is a normal part of the process. Your perfect role is out there!</p>
      `,
      category: "Career Tips",
      author: {
        name: "Sarah Johnson",
        role: "Career Advisor",
      },
      publishedAt: "2024-01-15",
      readTime: 8,
    },
    "top-remote-jobs-for-students-2024": {
      id: "2",
      title: "Top 10 Remote Job Opportunities for Students in 2024",
      slug: "top-remote-jobs-for-students-2024",
      content: `
        <h2>The Rise of Remote Student Work</h2>
        <p>Remote work has revolutionized how students can earn money while pursuing their education. Here are the top opportunities for 2024.</p>
        
        <h3>1. Online Tutoring</h3>
        <p>Share your knowledge in subjects you excel at. Platforms connect you with students worldwide, offering flexible scheduling and competitive pay rates of $15-40 per hour.</p>
        
        <h3>2. Content Writing & Copywriting</h3>
        <p>If you have strong writing skills, freelance content creation offers excellent flexibility. Many companies need blog posts, articles, and marketing copy.</p>
        
        <h3>3. Virtual Assistant</h3>
        <p>Help businesses with administrative tasks like email management, scheduling, and data entry. Perfect for organized students with good communication skills.</p>
        
        <h3>4. Social Media Management</h3>
        <p>Use your social media savviness to help brands grow their online presence. Create content, engage with followers, and analyze metrics.</p>
        
        <h3>5. Graphic Design</h3>
        <p>Design logos, social media graphics, and marketing materials. Build a portfolio while earning money on platforms like Fiverr or Upwork.</p>
        
        <h3>6. Web Development</h3>
        <p>If you're learning to code, freelance web development can be incredibly lucrative. Start with small projects and build up your skills and client base.</p>
      `,
      category: "Job Listings",
      author: {
        name: "Michael Chen",
        role: "Job Market Analyst",
      },
      publishedAt: "2024-01-12",
      readTime: 6,
    },
  };

  return posts[slug as keyof typeof posts] || null;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="h-full w-full bg-background">

      <div className="container mx-auto max-w-3xl px-6 py-8">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <article className="container mx-auto max-w-3xl px-6 pb-24">
        <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
          <Badge variant="secondary">{post.category}</Badge>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{post.readTime} min read</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-balance">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 pb-8 mb-8 border-b">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
            {post.author.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{post.author.name}</div>
            <div className="text-sm text-muted-foreground">
              {post.author.role}
            </div>
          </div>
        </div>

        <BlogContentViewer content={post.content} />
      </article>
    </div>
  );
}

