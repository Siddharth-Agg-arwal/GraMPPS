import { IconCircleCheck, IconAlertTriangle, IconCircleX } from "@tabler/icons-react";

type PowerStatusProps = {
  status: "Efficient" | "Moderate" | "Excessive";
};

export default function PowerStatus({ status }: PowerStatusProps) {
  if (status === "Efficient") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <IconCircleCheck className="w-12 h-12 text-green-500 mb-2" />
        <span className="text-2xl font-bold text-green-500">Efficient</span>
      </div>
    );
  }
  if (status === "Moderate") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <IconAlertTriangle className="w-12 h-12 text-yellow-400 mb-2" />
        <span className="text-2xl font-bold text-yellow-400">Moderate</span>
      </div>
    );
  }
  // Excessive
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <IconCircleX className="w-12 h-12 text-red-500 mb-2" />
      <span className="text-2xl font-bold text-red-500">Excessive</span>
    </div>
  );
}