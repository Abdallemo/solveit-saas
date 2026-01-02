"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  AlertCircle,
  Bug,
  Lightbulb,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LucideIcon,
} from "lucide-react";
import {
  getProductFeedback,
  getSupportRequest,
} from "@/features/feadback/server/data";
import {
  ProductFeedbackType,
  SupportRequestType,
} from "@/features/feadback/server/types";

const priorityConfig = {
  low: { label: "Low", variant: "secondary" as const },
  medium: { label: "Medium", variant: "outline" as const },
  high: { label: "High", variant: "default" as const },
  urgent: { label: "Urgent", variant: "destructive" as const },
};

const categoryIcons: Record<string, LucideIcon> = {
  technical: AlertCircle,
  billing: MessageSquare,
  bug_report: Bug,
  feature_request: Lightbulb,
  improvement: Lightbulb,
  general: MessageSquare,
};

const statusConfig = {
  open: {
    label: "Open",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    icon: PlayCircle,
    className: "bg-primary text-primary-foreground",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "bg-accent text-accent-foreground",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    className: "bg-secondary text-secondary-foreground",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  under_review: {
    label: "Under Review",
    icon: PlayCircle,
    className: "bg-primary text-primary-foreground",
  },
};

export function ReportViewer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<
    SupportRequestType | ProductFeedbackType | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("support");

  const [supportPage, setSupportPage] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(0);
  const limit = 4;

  const {
    data: supportRequests = [],
    isLoading: isSupportLoading,
    isError: isSupportError,
  } = useQuery({
    queryKey: ["support-requests", supportPage],
    queryFn: () => getSupportRequest(limit, supportPage * limit),
  });

  const {
    data: productFeedback = [],
    isLoading: isFeedbackLoading,
    isError: isFeedbackError,
  } = useQuery({
    queryKey: ["product-feedback", feedbackPage],
    queryFn: () => getProductFeedback(limit, feedbackPage * limit),
  });

  const filterSupportRequests = (requests: SupportRequestType[]) => {
    return requests.filter((request) => {
      const matchesSearch =
        request.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        selectedPriority === "all" || request.priority === selectedPriority;
      const matchesStatus =
        selectedStatus === "all" || request.status === selectedStatus;
      const matchesCategory =
        selectedCategory === "all" || request.category === selectedCategory;

      return (
        matchesSearch && matchesPriority && matchesStatus && matchesCategory
      );
    });
  };

  const filterProductFeedback = (feedback: ProductFeedbackType[]) => {
    return feedback.filter((item) => {
      const matchesSearch =
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.type === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const handleReportClick = (
    report: SupportRequestType | ProductFeedbackType,
  ) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    console.log(
      "[v0] Status changed to:",
      newStatus,
      "for report:",
      selectedReport?.id,
    );
    // Implement status update logic here
  };

  const isSupportRequest = (
    report: SupportRequestType | ProductFeedbackType,
  ): report is SupportRequestType => {
    return "priority" in report;
  };

  const filteredSupportRequests = filterSupportRequests(supportRequests);
  const filteredProductFeedback = filterProductFeedback(productFeedback);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Report Viewer
        </h1>
        <p className="text-muted-foreground">
          Manage user reports and feedback
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {activeTab === "support" && (
              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            )}

            {activeTab === "support" && (
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {activeTab === "support" ? (
                  <>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="feature_request">
                      Feature Request
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="feature_request">
                      Feature Request
                    </SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="general">General Feedback</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="support">
            Support Requests ({filteredSupportRequests.length})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            Product Feedback ({filteredProductFeedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support" className="min-h-[400px] flex flex-col">
          {isSupportLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isSupportError ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">
                Failed to load support requests. Please try again.
              </p>
            </Card>
          ) : (
            <>
              <div className="flex-1">
                <div className="grid gap-4">
                  {filteredSupportRequests.map((request) => {
                    const Icon = categoryIcons[request.category];
                    const statusInfo =
                      statusConfig[request.status as keyof typeof statusConfig];
                    const StatusIcon = statusInfo?.icon || Clock;

                    return (
                      <Card
                        key={request.id}
                        className="p-6 hover:border-primary cursor-pointer transition-colors"
                        onClick={() => handleReportClick(request)}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-muted rounded-md">
                                {/*<Icon className="h-5 w-5 text-foreground" />*/}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-1 text-balance">
                                  {request.subject}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {request.description}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={priorityConfig[request.priority].variant}
                            >
                              {priorityConfig[request.priority].label}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={request.user.image || undefined}
                                    alt={request.user.name}
                                  />
                                  <AvatarFallback>
                                    {request.user.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-foreground font-medium">
                                    {request.user.name}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {request.user.email}
                                  </span>
                                </div>
                              </div>
                              <span className="text-muted-foreground">
                                {request.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                            <Badge className={statusInfo?.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo?.label}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {supportRequests.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Page {supportPage + 1}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSupportPage((p) => Math.max(0, p - 1))}
                      disabled={supportPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSupportPage((p) => p + 1)}
                      disabled={supportRequests.length < limit}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="min-h-[400px] flex flex-col">
          {isFeedbackLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isFeedbackError ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">
                Failed to load product feedback. Please try again.
              </p>
            </Card>
          ) : (
            <>
              <div className="flex-1">
                <div className="grid gap-4">
                  {filteredProductFeedback.map((feedback) => {
                    const Icon = categoryIcons[feedback.type];
                    return (
                      <Card
                        key={feedback.id}
                        className="p-6 hover:border-primary cursor-pointer transition-colors"
                        onClick={() => handleReportClick(feedback)}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted rounded-md">
                              <Icon className="h-5 w-5 text-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground mb-1 text-balance">
                                {feedback.subject}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {feedback.content}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={feedback.user.image || undefined}
                                  alt={feedback.user.name}
                                />
                                <AvatarFallback>
                                  {feedback.user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-foreground font-medium">
                                  {feedback.user.name}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {feedback.user.email}
                                </span>
                              </div>
                            </div>
                            <span className="text-muted-foreground">
                              {feedback.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {productFeedback.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Page {feedbackPage + 1}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeedbackPage((p) => Math.max(0, p - 1))}
                      disabled={feedbackPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeedbackPage((p) => p + 1)}
                      disabled={productFeedback.length <= limit}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[650px] lg:max-w-[850px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Report Details</DialogTitle>
            <DialogDescription>
              View and manage report information
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={selectedReport.user.image || undefined}
                    alt={selectedReport.user.name}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedReport.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedReport.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {selectedReport.subject}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-foreground mt-1 leading-relaxed">
                    {"description" in selectedReport
                      ? selectedReport.description
                      : selectedReport.content}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Report ID</Label>
                    <p className="text-foreground mt-1 font-mono text-sm">
                      {selectedReport.id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="text-foreground mt-1 font-mono text-sm">
                      {selectedReport.userId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      {"category" in selectedReport ? "Category" : "Type"}
                    </Label>
                    <p className="text-foreground mt-1 capitalize">
                      {"category" in selectedReport
                        ? selectedReport.category.replace("_", " ")
                        : selectedReport.type.replace("_", " ")}
                    </p>
                  </div>
                  {"priority" in selectedReport && (
                    <div>
                      <Label className="text-muted-foreground">Priority</Label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            priorityConfig[selectedReport.priority].variant
                          }
                        >
                          {priorityConfig[selectedReport.priority].label}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="text-foreground mt-1">
                    {selectedReport.createdAt.toLocaleString()}
                  </p>
                </div>

                {"updatedAt" in selectedReport && (
                  <div>
                    <Label className="text-muted-foreground">
                      Last Updated
                    </Label>
                    <p className="text-foreground mt-1">
                      {selectedReport.updatedAt.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {isSupportRequest(selectedReport) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Manage Report
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">Update Status</Label>
                      <Select
                        defaultValue={selectedReport.status}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger
                          id="status"
                          className="mt-2 flex-1 w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_review">
                            Under Review
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Add Internal Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes visible only to moderators..."
                        className="mt-2 min-h-[100px]"
                      />
                    </div>

                    <Button className="w-full">Save Changes</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
