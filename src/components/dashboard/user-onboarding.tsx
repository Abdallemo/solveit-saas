"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleUserOnboarding } from "@/features/payments/server/action";
import { OnboardingFormData } from "@/features/users/server/user-types";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useLocalStorage } from "@uidotdev/usehooks";
import { format, subYears } from "date-fns";
import {
  Building,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const steps = [
  {
    id: 1,
    title: "Personal Info",
    icon: User,
    description: "Tell us about yourself",
  },
  {
    id: 2,
    title: "Date of Birth",
    icon: CalendarIcon,
    description: "When were you born?",
  },
  {
    id: 3,
    title: "Address",
    icon: MapPin,
    description: "Where are you located?",
  },
  { id: 4, title: "Business", icon: Building, description: "Business details" },
];
const defaultValues = {
  first_name: "",
  last_name: "",
  dob: undefined,
  address: {
    line1: "",
    city: "",
    postal_code: "",
    state: "",
    country: "MY",
  },
  business_profile: {
    mcc: "",
  },
};
export default function OnboardingForm() {
  const [onboarding, saveOnboarding] = useLocalStorage<OnboardingFormData>(
    "onboarding",
    defaultValues
  );
  const [currentStep, setCurrentStep] = useLocalStorage("steps", 1);
  const form = useForm<OnboardingFormData>({
    defaultValues: onboarding || defaultValues,
  });
  const minDate = new Date("1900-01-01");
  const maxDate = subYears(new Date(), 13);
  const { mutateAsync: saveOnboardingDb, isPending } = useMutation({
    mutationFn: handleUserOnboarding,
    onSuccess: () => {
      setCurrentStep(1);
      form.reset(defaultValues);
      saveOnboarding(defaultValues);
    },
    onError: (e) => toast.error(e.message),
  });
  const formValues = form.watch();
  useEffect(() => {
    saveOnboarding({
      address: formValues.address,
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      business_profile: formValues.business_profile,
      dob: formValues.dob ? new Date(formValues.dob) : undefined,
    });
  }, [formValues, saveOnboarding]);

  const onSubmit = async (data: OnboardingFormData) => {
    await saveOnboardingDb(data);
  };

  const validateStep = async (step: number) => {
    const fieldsToValidate: Record<
      number,
      (keyof OnboardingFormData | string)[]
    > = {
      1: ["first_name", "last_name"],
      2: ["dob"],
      3: [
        "address.line1",
        "address.city",
        "address.postal_code",
        "address.state",
        "address.country",
      ],
      4: [],
    };

    const fields = fieldsToValidate[step];
    if (fields && fields.length > 0) {
      const result = await form.trigger(fields as any);
      return result;
    }
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-2xl font-semibold">
                Welcome! Let's get started
              </h2>
              <p className="text-muted-foreground">
                First, tell us a bit about yourself
              </p>
            </div>
            <div className="space-y-4 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <Input placeholder="Enter your first name" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <Input placeholder="Enter your last name" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CalendarIcon className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-2xl font-semibold">When were you born?</h2>
              <p className="text-muted-foreground">
                We need your date of birth for verification
              </p>
            </div>
            <FormField
              control={form.control}
              name="dob"
              rules={{ required: "Date of birth is required" }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        captionLayout="dropdown"
                        onSelect={field.onChange}
                        disabled={(date) => date > maxDate || date < minDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    must be 13 years and above
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <MapPin className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-2xl font-semibold">Where are you located?</h2>
              <p className="text-muted-foreground">
                Help us know where you're based
              </p>
            </div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="address.line1"
                rules={{ required: "Address is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <Input placeholder="Enter your street address" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  rules={{ required: "City is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Input placeholder="Enter your city" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.postal_code"
                  rules={{ required: "Postal code is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <Input placeholder="Enter postal code" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.state"
                  rules={{ required: "State is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Input placeholder="Enter your state" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MY">Malaysia</SelectItem>
                          <SelectItem value="SG">Singapore</SelectItem>
                          <SelectItem value="TH">Thailand</SelectItem>
                          <SelectItem value="ID">Indonesia</SelectItem>
                          <SelectItem value="PH">Philippines</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Building className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-2xl font-semibold">Business Information</h2>
              <p className="text-muted-foreground">
                Just a few more details about your business
              </p>
            </div>
            <FormField
              control={form.control}
              name="business_profile.mcc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MCC Code (Optional)</FormLabel>
                  <Input placeholder="Enter MCC code (e.g., 5734)" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl w-3xl  mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  step.id === currentStep
                    ? "text-primary"
                    : step.id < currentStep
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id < currentStep
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}>
                  {step.id < currentStep ? "✓" : step.id}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStep} of {steps.length}
        </p>
      </div>

      <Form {...form}>
        <Card className=" flex flex-col">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}
            </form>
          </CardContent>
          <CardFooter className="flex items-center justify-between  gap-1">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 bg-transparent w-1/2">
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2 w-1/2">
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <Button
                  disabled={isPending}
                  type="submit"
                  className="flex items-center space-x-2 w-full">
                  {isPending && <Loader2 className="animate-spin" />}
                  <span>Complete Setup</span>
                </Button>
              </form>
            )}
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
