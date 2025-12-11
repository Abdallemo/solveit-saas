import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CalendarDays, Clock } from 'lucide-react'
import Link from "next/link"

async function getBlogPosts() {
  return [
    {
      id: "1",
      title: "How to Land Your First Student Job: A Complete Guide",
      slug: "how-to-land-your-first-student-job",
      excerpt: "Breaking into the job market as a student can feel overwhelming. Here's our comprehensive guide to help you navigate applications, interviews, and landing that perfect role.",
      content: "<p>Your HTML content here...</p>",
      category: "Career Tips",
      author: {
        name: "Sarah Johnson",
        role: "Career Advisor"
      },
      publishedAt: "2024-01-15",
      readTime: 8
    },
    {
      id: "2",
      title: "Top 10 Remote Job Opportunities for Students in 2024",
      slug: "top-remote-jobs-for-students-2024",
      excerpt: "Discover the most flexible and lucrative remote positions perfect for balancing studies and work. From tutoring to freelance design, we've got you covered.",
      content: "<p>Your HTML content here...</p>",
      category: "Job Listings",
      author: {
        name: "Michael Chen",
        role: "Job Market Analyst"
      },
      publishedAt: "2024-01-12",
      readTime: 6
    },
    {
      id: "3",
      title: "Resume Writing Tips That Actually Work",
      slug: "resume-writing-tips-that-work",
      excerpt: "Your resume is your first impression. Learn how to craft a compelling document that catches employers' attention and gets you interview calls.",
      content: "<p>Your HTML content here...</p>",
      category: "Career Tips",
      author: {
        name: "Emma Rodriguez",
        role: "HR Specialist"
      },
      publishedAt: "2024-01-10",
      readTime: 10
    },
    {
      id: "4",
      title: "Platform Update: New Features Coming to SolveIt",
      slug: "platform-update-new-features",
      excerpt: "We're excited to announce several new features designed to make your job search easier and more effective. See what's coming this month.",
      content: "<p>Your HTML content here...</p>",
      category: "Platform Updates",
      author: {
        name: "David Kim",
        role: "Product Manager"
      },
      publishedAt: "2024-01-08",
      readTime: 5
    },
    {
      id: "5",
      title: "Balancing Studies and Work: Student Success Stories",
      slug: "balancing-studies-and-work",
      excerpt: "Hear from students who've successfully managed their academic responsibilities while building valuable work experience.",
      content: "<p>Your HTML content here...</p>",
      category: "Student Stories",
      author: {
        name: "Lisa Park",
        role: "Community Manager"
      },
      publishedAt: "2024-01-05",
      readTime: 7
    },
    {
      id: "6",
      title: "Interview Preparation: Questions You Should Expect",
      slug: "interview-preparation-guide",
      excerpt: "Walk into your next interview with confidence. We've compiled the most common questions and expert tips on how to answer them.",
      content: "<p>Your HTML content here...</p>",
      category: "Career Tips",
      author: {
        name: "James Wilson",
        role: "Career Coach"
      },
      publishedAt: "2024-01-03",
      readTime: 12
    }
  ]
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="h-full w-full">
    
    
     
      <div className="">
        <div className="container mx-auto max-w-5xl px-6 py-16">
          <h1 className="text-4xl font-bold mb-3 text-balance">
           Latest News From Solveit team 
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Articls, and platform updates for students.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime} min</span>
                  </div>
                </div>
                
                <CardTitle className="text-xl leading-tight text-balance">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                
                <CardDescription className="text-sm text-muted-foreground pt-2">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </time>
                  </div>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`} className="gap-1">
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  <span className="font-medium">{post.author.name}</span>
                  <span className="mx-2">·</span>
                  <span>{post.author.role}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
