"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
interface SolutionPageProps {
  solution?: Solution
}
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Send, ThumbsUp, ThumbsDown } from "lucide-react"
import { SolutionPreview } from "./richTextEdito/TaskPreview"


export default function SolutionPageComps({ solution = mockSolution }: SolutionPageProps) {
  const [comment, setComment] = useState("")

  const getStatusBadge = (status: string) => {
    const variants = {
      accepted: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    }
    return variants[status as keyof typeof variants] || variants.pending
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <BreadcrumbSolution/>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Solution</h2>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusBadge(solution.status)}>
                  {solution.status.charAt(0).toUpperCase() + solution.status.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">by {solution.author}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Submitted {solution.submittedAt}</span>
              <span>•</span>
              <span>Updated {solution.updatedAt}</span>
            </div>
          </CardHeader>

          <CardContent>
            <SolutionPreview content={solution.content} />

            <Separator className="my-6" />

        
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful ({solution.helpfulVotes})</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                  <ThumbsDown className="h-4 w-4" />
                  <span>Not helpful ({solution.notHelpfulVotes})</span>
                </Button>
              </div>
              {!solution.isBestSolution && (
                <Button variant="outline" size="sm">
                  Mark as Best Solution
                </Button>
              )}
              {solution.isBestSolution && <Badge className="bg-yellow-100 text-yellow-800">⭐ Best Solution</Badge>}
            </div>
          </CardContent>
        </Card>

        {solution.files.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">shared files</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {solution.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">{file.size}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{file.uploadedAt}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">comments</h3>
          </CardHeader>
          <CardContent>
            {solution.comments.length > 0 && (
              <div className="space-y-4 mb-6">
                {solution.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-sm text-gray-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator className="mb-4" />

            <div>
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">leave a comment</span>
              </div>
              <div className="flex space-x-3">
                <Textarea
                  placeholder="Add your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 min-h-[80px] resize-none"
                />
                <Button className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



export const mockSolution: Solution = {
  id: "sol_001",
  title: "SolidWorks Extrusion Fix",
  content: `
    <h3>Solution for SolidWorks Extrusion Issue</h3>
    <p>Hey! I see the issue with your SolidWorks extrusion. The problem is likely with your sketch constraints and the direction of extrusion. Here's how to fix it:</p>
    
    <h4>Step-by-step solution:</h4>
    <ol>
      <li>First, check your sketch is fully constrained (no blue lines)</li>
      <li>Go to <strong>Features → Extruded Boss/Base</strong></li>
      <li>Set the direction to "Blind" and specify exact depth</li>
      <li>Make sure "Merge result" is checked if you want to combine with existing geometry</li>
      <li>Preview before accepting to ensure correct direction</li>
    </ol>
    
    <blockquote>
      <p><strong>Pro tip:</strong> The key is making sure your sketch plane is properly oriented and your constraints are complete.</p>
    </blockquote>
    
    <p>Let me know if you need clarification on any of these steps!</p>
  `,
  author: "mentor_john",
  authorAvatar: "MJ",
  status: "accepted",
  submittedAt: "2 hours ago",
  updatedAt: "1 hour ago",
  helpfulVotes: 12,
  notHelpfulVotes: 1,
  isBestSolution: true,
  files: [
    {
      id: "file_001",
      name: "SolidWorks_Fix_Tutorial.pdf",
      size: "1.2MB",
      uploadedAt: "9:02, Jun 23, 2023",
      downloadUrl: "#",
    },
    {
      id: "file_002",
      name: "corrected_sketch.sldprt",
      size: "856KB",
      uploadedAt: "10:15, Jun 23, 2023",
      downloadUrl: "#",
    },
  ],
  comments: [
    {
      id: "comment_001",
      author: "task_user",
      content: "This worked perfectly! Thank you so much for the detailed explanation.",
      createdAt: "1 hour ago",
      avatar: "TU",
    },
  ],
}

export interface SolutionFile {
  id: string
  name: string
  size: string
  uploadedAt: string
  downloadUrl: string
}

export interface SolutionComment {
  id: string
  author: string
  content: string
  createdAt: string
  avatar?: string
}

export interface Solution {
  id: string
  title: string
  content: string // HTML content
  author: string
  authorAvatar?: string
  status: "pending" | "accepted" | "rejected"
  submittedAt: string
  updatedAt: string
  helpfulVotes: number
  notHelpfulVotes: number
  files: SolutionFile[]
  comments: SolutionComment[]
  isBestSolution: boolean
}
export function BreadcrumbSolution() {
  return (
   <Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">explore tasks</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">task_0001</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>solution</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
  )
}