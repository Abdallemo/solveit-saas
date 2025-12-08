"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Bug, Lightbulb, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";

const feedbackSchema = z.object({
  type: z.string().min(1, "Please select a feedback type"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "",
      title: "",
      description: "",
    },
  });
  const SuccessDiv = () => (
    <div className="flex flex-col">
      <p>Feedback submitted!</p>
      <p>Thank you for helping us improve SolveIt</p>
    </div>
  );
  const onSubmit = async (values: FeedbackFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Feedback submitted!");

    form.reset();
  };

  return (
    <div className="w-full flex flex-col p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Product Feedback
          </h1>
          <p className="text-muted-foreground">
            Share your ideas, report bugs, or suggest improvements to help us
            make SolveIt better.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-3 pt-6">
              <Lightbulb className="h-8 w-8 text-chart-1" />
              <div>
                <h3 className="font-semibold text-card-foreground">
                  Feature Request
                </h3>
                <p className="text-sm text-muted-foreground">
                  Suggest new features
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-3 pt-6">
              <Bug className="h-8 w-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-card-foreground">
                  Bug Report
                </h3>
                <p className="text-sm text-muted-foreground">Report issues</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-3 pt-6">
              <Sparkles className="h-8 w-8 text-chart-2" />
              <div>
                <h3 className="font-semibold text-card-foreground">
                  Improvement
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enhance existing features
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Help us understand your feedback with as much detail as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background border-input">
                            <SelectValue placeholder="Select a feedback type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="feature">
                            Feature Request
                          </SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="improvement">
                            Improvement
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief summary of your feedback"
                          className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed information about your feedback..."
                          className="min-h-[150px] bg-background border-input text-foreground placeholder:text-muted-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={form.formState.isSubmitting}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting
                    ? "Submitting..."
                    : "Submit Feedback"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
