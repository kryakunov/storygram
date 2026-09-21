"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usernameSchema } from "@/domain/username";
import { useI18n } from "@/components/i18n-provider";

export function SearchForm({
  initialUsername = "",
  size = "lg",
}: {
  initialUsername?: string;
  size?: "lg" | "md";
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const formSchema = z.object({
    username: usernameSchema(t.validation),
  });
  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: initialUsername },
  });

  function onSubmit(values: z.output<typeof formSchema>) {
    router.push(`/search?u=${encodeURIComponent(values.username)}`);
  }

  return (
    <form
      key={locale}
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label={t.search.usernameLabel}
          placeholder={t.search.placeholder}
          className={size === "lg" ? "h-14 pl-11" : "pl-11"}
          {...form.register("username")}
        />
      </div>
      <Button type="submit" size={size === "lg" ? "lg" : "default"} className="sm:px-8">
        {t.search.submit}
      </Button>
      {form.formState.errors.username ? (
        <p className="text-sm text-destructive sm:hidden" role="alert">
          {form.formState.errors.username.message}
        </p>
      ) : null}
    </form>
  );
}
