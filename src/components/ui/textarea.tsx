import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
};

export function Textarea({
  label,
  helperText,
  className,
  id,
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-black">
          {label}
        </label>
      ) : null}

      <textarea
        id={id}
        className={cn(
          "min-h-32 w-full resize-y rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black",
          className,
        )}
        {...props}
      />

      {helperText ? (
        <p className="text-xs leading-5 text-neutral-500">{helperText}</p>
      ) : null}
    </div>
  );
}