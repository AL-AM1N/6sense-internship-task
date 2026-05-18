import { CircleAlert } from "lucide-react";

interface Props {
  message?: string;
}

const FormError = ({ message }: Props) => {
  if (!message) return null;

  return (
    <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
      <CircleAlert size={14} />
      {message}
    </p>
  );
};

export default FormError;