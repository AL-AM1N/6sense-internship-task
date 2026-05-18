import { CircleAlert } from "lucide-react";
import { inputStyle, errorInputStyle } from "@/lib/form-styles";

interface Option {
  label: string;
  value: string;
}

interface Props {
  register: any;
  options: Option[];
  placeholder?: string;
  error?: string;
}

const SelectField = ({
  register,
  options,
  placeholder = "Select",
  error,
}: Props) => {
  return (
    <div>
      <select
        {...register}
        className={`${inputStyle} ${error ? errorInputStyle : ""}`}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
          <CircleAlert size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;