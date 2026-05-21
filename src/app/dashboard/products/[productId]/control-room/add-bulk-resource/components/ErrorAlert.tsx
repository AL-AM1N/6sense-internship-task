interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({
  message,
}: ErrorAlertProps) {

  return (
    <div className="
      mb-4
      p-4
      border-l-4
      border-red-500
      bg-red-50
      text-red-700
      rounded-r-lg
      text-sm
      font-medium
    ">
      {message}
    </div>
  );
}