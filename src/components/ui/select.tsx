import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({
  label,
  helperText,
  options,
  placeholder = "Select option",
  className,
  id,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-black">
          {label}
        </label>
      ) : null}

      <select
        id={id}
        className={cn(
          "h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-black outline-none transition focus:border-black",
          className,
        )}
        {...props}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helperText ? (
        <p className="text-xs leading-5 text-neutral-500">{helperText}</p>
      ) : null}
    </div>
  );
}