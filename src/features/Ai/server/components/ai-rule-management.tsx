"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Edit2 } from "lucide-react";
import { addNewRule, AiRule } from "../action";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useAuthGate } from "@/hooks/useAuthGate";
import AuthGate from "@/components/AuthGate";
import Loading from "@/app/loading";

const AiSchema = z.object({
  rule: z
    .string()
    .min(1, "A rule is required")
    .max(50, "A rule must be less than 50 characters"),
  description: z.string().min(1, "A description is required"),
});
type AiSchemaFormData = z.infer<typeof AiSchema>;

export function AIRuleManagement({ allAiRules }: { allAiRules: AiRule[] }) {
  const { isLoading, isBlocked } = useAuthGate();
  const { user } = useCurrentUser();
  const { id: adminId } = user!;
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<AiRule | null>(null);

  const form = useForm<AiSchemaFormData>({
    resolver: zodResolver(AiSchema),
    defaultValues: { rule: "", description: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: addNewRule,
    onSuccess: () => {
      toast.success("Successfully added new AI rule", { id: "add-rule" });
      form.reset();
      setIsAddingRule(false);
      setEditingRule(null);
    },
    onError: (err) => {
      toast.error("Unable to add new rule: " + err.message, { id: "add-rule" });
    },
  });

  const handleSubmit = (data: AiSchemaFormData) => {
    if (editingRule) {
      // TODO: Replace with update mutation
      console.log("Update rule", editingRule.id, data);
      setEditingRule(null);
      form.reset();
    } else {
      mutate({ ...data, adminId: adminId!, isActive: true });
    }
  };

  const startEdit = (rule: AiRule) => {
    setEditingRule(rule);
    form.reset({ rule: rule.rule, description: rule.description });
  };

  const cancelEdit = () => {
    setEditingRule(null);
    setIsAddingRule(false);
    form.reset();
  };
  if (isLoading) return <Loading />;
  if (isBlocked) return <AuthGate />;

  return (
    <div className="w-4/5 ">
      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-muted-foreground">
              {allAiRules.length} rule{allAiRules.length !== 1 ? "s" : ""}{" "}
              configured
            </div>
            <Button
              onClick={() => {
                form.reset();
                setIsAddingRule(true);
              }}
              disabled={isAddingRule || editingRule !== null}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>

          {(isAddingRule || editingRule) && (
            <Card className="mb-6 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingRule ? "Edit Rule" : "Add New Rule"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Rule</Label>
                      <Input
                        id="rule"
                        {...form.register("rule")}
                        placeholder="Enter the rule"
                      />
                      {form.formState.errors.rule && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.rule.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Describe what this rule does"
                      rows={2}
                    />
                    {form.formState.errors.description && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isPending}>
                      {editingRule ? "Update Rule" : "Add Rule"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {allAiRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rules configured yet. Add your first rule to get started.
              </div>
            ) : (
              allAiRules.map((rule) => (
                <Card
                  key={rule.id}
                  className={`${!rule.isActive ? "opacity-60" : ""}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-3">
                          {rule.description}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          // TODO: toggle mutation here
                          onClick={() =>
                            console.log("Toggle", rule.id, !rule.isActive)
                          }>
                          {rule.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(rule)}
                          disabled={editingRule !== null || isAddingRule}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          // TODO: delete mutation here
                          onClick={() => console.log("Delete", rule.id)}
                          className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
