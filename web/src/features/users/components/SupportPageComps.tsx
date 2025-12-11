"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { HelpCircle, Users, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const supportSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority level"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(150, "Subject must be less than 150 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
});

type SupportFormValues = z.infer<typeof supportSchema>;

export default function SupportPage() {
  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      category: "",
      priority: "",
      subject: "",
      description: "",
    },
  });

  const onSubmit = async (values: SupportFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Support request submitted!");
    form.reset();
  };

  return (
    <div className="w-full flex flex-col p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Support Center</h1>
          <p className="text-muted-foreground">
            Need help? Submit a support request and our team will assist you.
          </p>
        </div>

        <Alert className="border-border bg-muted/50">
          <HelpCircle className="h-4 w-4" />
          <AlertTitle className="text-foreground">Response Time</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            We typically respond to support requests within 24-48 hours. For
            urgent issues, please mark your request as high priority.
          </AlertDescription>
        </Alert>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Submit Support Request
            </CardTitle>
            <CardDescription>
              Provide details about your issue so we can help you effectively.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-input">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tasks">Task Issues</SelectItem>
                            <SelectItem value="payments">
                              Payment & Billing
                            </SelectItem>
                            <SelectItem value="account">
                              Account Settings
                            </SelectItem>
                            <SelectItem value="mentorship">
                              Mentorship
                            </SelectItem>
                            <SelectItem value="technical">
                              Technical Issues
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
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-input">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High - Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief description of your issue"
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
                          placeholder="Provide detailed information about your issue. Include any error messages, steps to reproduce, or screenshots if applicable..."
                          className="min-h-[180px] bg-background border-input text-foreground placeholder:text-muted-foreground"
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
                  <Zap className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting
                    ? "Submitting..."
                    : "Submit Support Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card ">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Users className="h-5 w-5 text-chart-2 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-card-foreground">
                  Need immediate assistance?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Check our FAQ section or join our Discord community for quick
                  help from other SolveIt users.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
