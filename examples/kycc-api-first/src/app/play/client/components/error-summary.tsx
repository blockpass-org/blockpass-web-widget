import { AlertCircle } from "lucide-react";

interface ErrorSummaryProps {
  errors: { [key: string]: string };
}

export function ErrorSummary({ errors }: ErrorSummaryProps) {
  if (Object.keys(errors).length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <h3 className="text-red-800 font-medium flex items-center gap-2 mb-2">
        <AlertCircle className="h-5 w-5" />
        Please fix the following errors:
      </h3>
      <ul className="list-disc list-inside text-red-700 space-y-1">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
