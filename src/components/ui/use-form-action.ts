"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * useActionState wired through onSubmit instead of <form action>.
 * React 19 resets uncontrolled fields after a <form action> completes, which
 * wipes everything the player typed whenever the server returns a validation
 * error (and every step of a multi-step form). Dispatching manually keeps the
 * values in place.
 */
export function useFormAction<State>(
  action: (prev: Awaited<State>, formData: FormData) => State | Promise<State>,
  initialState: Awaited<State>,
) {
  const [state, dispatch, pending] = useActionState(action, initialState);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => dispatch(formData));
  }

  return [state, onSubmit, pending] as const;
}
