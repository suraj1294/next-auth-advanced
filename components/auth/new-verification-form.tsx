"use client";

import { useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { newVerification } from "@/actions/new-verification";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const apiState = useRef<"loading" | "idle">("idle");

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token || apiState.current === "loading") return;

    apiState.current = "loading";

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
        apiState.current = "idle";
      })
      .catch(() => {
        setError("Something went wrong!");
        apiState.current = "idle";
      });
  }, [token]);

  const errorMessage = token ? error : "Missing token!";

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !errorMessage && <BeatLoader />}
        <FormSuccess message={success} />
        {!success && <FormError message={errorMessage} />}
      </div>
    </CardWrapper>
  );
};
