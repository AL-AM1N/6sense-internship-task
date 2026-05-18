import { CircleAlert } from "lucide-react";
import { inputStyle, errorInputStyle } from "@/lib/form-styles";

interface Props {
  placeholder?: string;
  type?: string;
  register: any;
  error?: string;
}

const InputField = ({
  placeholder,
  type = "text",
  register,
  error,
}: Props) => {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className={`${inputStyle} ${error ? errorInputStyle : ""}`}
      />

      {error && (
        <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
          <CircleAlert size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;