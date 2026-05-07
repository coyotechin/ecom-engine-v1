import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
};

export function Input({
  label,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-black">
          {label}
        </label>
      ) : null}

      <input
        id={id}
        className={cn(
          "h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black",
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