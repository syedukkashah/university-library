"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormReturn,
  Controller,
} from "react-hook-form";
import { z, ZodType } from "zod";
import { Field, FieldContent, FieldError, FieldLabel } from "./ui/field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";
import FileUpload from "./FileUpload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router = useRouter();
  const isSignIn = type === "SIGN_IN";

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data);
    console.log("AuthForm result:", result);

    if (result.success) {
      toast(
        isSignIn
          ? "You have successfully signed in"
          : "You have successfully signed up"
      );
      router.push("/");
    } else {
      // Check if rate limited and redirect
      const isRateLimited =
        (result as any).rateLimited ||
        result.error === "RATE_LIMITED" ||
        result.error === "RATE_LIMIT_SERVICE_ERROR" ||
        (result.error && result.error.includes("RATE_LIMIT"));
      console.log("Is rate limited?", isRateLimited, result);

      if (isRateLimited) {
        console.log("Redirecting to /too-fast");
        // Use replace to prevent back button from going to sign-in page
        router.replace("/too-fast");
        return;
      }
      toast(
        `Error ${isSignIn ? "signing in" : "signing up"}: ${
          result.error ?? "An error occurred."
        }`
      );
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn ? "Welcome back to BookMyst" : "Create your library account"}
      </h1>
      <p className="text-light-100">
        {isSignIn
          ? "Access the vast collection of resources, and stay updated"
          : "Please complete all fields and upload a valid university ID to gain access to the library"}
      </p>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full"
      >
        {Object.keys(defaultValues).map((fieldName) => {
          const fieldLabel =
            FIELD_NAMES[fieldName as keyof typeof FIELD_NAMES] ||
            fieldName.charAt(0).toUpperCase() +
              fieldName.slice(1).replace(/([A-Z])/g, " $1");
          const fieldType =
            FIELD_TYPES[fieldName as keyof typeof FIELD_TYPES] || "text";

          return (
            <Controller
              key={fieldName}
              control={form.control}
              name={fieldName as any}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={fieldName}>{fieldLabel}</FieldLabel>
                  <FieldContent>
                    {fieldName === "universityCard" ? (
                      <FileUpload
                        type="image"
                        accept="image/*"
                        placeholder="Upload your ID"
                        folder="university-cards"
                        variant="dark"
                        value={field.value}
                        onChange={field.onChange}
                        onFileChange={field.onChange}
                        onBlur={field.onBlur}
                        name={fieldName}
                      />
                    ) : (
                      <Input
                        id={fieldName}
                        type={fieldType}
                        className="form-input"
                        required
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </FieldContent>
                </Field>
              )}
            />
          );
        })}

        <Button type="submit" className="form-btn">
          {isSignIn ? "Sign in" : "Sign Up"}
        </Button>
      </form>
      <p className="text-center text-base font-medium">
        {isSignIn ? "New to BookMyst?" : "Already have an account?"}{" "}
        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-primary"
        >
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
