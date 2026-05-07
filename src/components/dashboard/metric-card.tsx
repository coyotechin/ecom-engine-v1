import { Card } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  helperText: string;
};

export function MetricCard({ label, value, helperText }: MetricCardProps) {
  return (
    <Card className="shadow-none transition hover:border-black">
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black">
        {value}
      </h3>
      <p className="mt-3 text-sm leading-6 text-neutral-600">{helperText}</p>
    </Card>
  );
}