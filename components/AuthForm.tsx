import React from 'react'


//interface Props<T extends FieldValues>

const AuthForm = ({type, schema, defaultValues, onSubmit}: Props) => {
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
        {Object.keys(defaultValues).map((fieldName) => (
          <Controller
            key={fieldName}
            control={form.control}
            name={fieldName as any}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={fieldName}>
                  {fieldName.charAt(0).toUpperCase() +
                    fieldName.slice(1).replace(/([A-Z])/g, " $1")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={fieldName}
                    placeholder={`Enter your ${fieldName.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : undefined}
                  />
                </FieldContent>
              </Field>
            )}
          />
        ))}

        <Button type="submit">Submit</Button>
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
