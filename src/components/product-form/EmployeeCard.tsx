import { CircleAlert } from "lucide-react";
import { inputStyle, errorInputStyle } from "@/lib/form-styles";

interface TeamMember {
  _id: string;
  name: string;
}

interface Props {
  field: any;
  index: number;
  register: any;
  errors: any;
  teamMembers: {
    [key: string]: TeamMember[];
  };
  onRemove: (index: number) => void;
}

const EmployeeCard = ({
  field,
  index,
  register,
  errors,
  teamMembers,
  onRemove,
}: Props) => {
  return (
    <div className="p-6 border-b border-[#EAECF0]">
      {/* HEADER */}
      <div className="pb-4 flex items-center justify-between">
        <p className="font-bold text-xl">{field.name}</p>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200"
        >
          -
        </button>
      </div>

      {/* RATES */}
      <div className="flex items-center gap-5 text-[13px] text-[#667085] mb-6">
        <p>Internal Rate: ${field.internalRate}/month</p>
        <p>Billing Rate: ${field.billRate}/month</p>
      </div>

      {/* MEMBER + WORK TYPE */}
      <div className="grid grid-cols-2 gap-5">
        {/* TEAM MEMBER */}
        <div>
          <label className="block text-[14px] font-medium text-[#344054] mb-2">
            Team Member <span className="text-[#F04438]">*</span>
          </label>

          <select
            {...register(`productEmployees.${index}.employeeId`)}
            className={`${inputStyle} ${
              errors.productEmployees?.[index]?.employeeId
                ? errorInputStyle
                : ""
            }`}
          >
            <option value="">Select</option>

            {teamMembers[field.teamRateId]?.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>

          {errors.productEmployees?.[index]?.employeeId && (
            <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
              <CircleAlert size={14} />
              {errors.productEmployees[index]?.employeeId?.message}
            </p>
          )}
        </div>

        {/* WORK TYPE */}
        <div>
          <label className="block text-[14px] font-medium text-[#344054] mb-2">
            Work Type <span className="text-[#F04438]">*</span>
          </label>

          <select
            {...register(`productEmployees.${index}.employmentStatus`)}
            className={`${inputStyle} ${
              errors.productEmployees?.[index]?.employmentStatus
                ? errorInputStyle
                : ""
            }`}
          >
            <option value="">Select</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
          </select>

          {errors.productEmployees?.[index]?.employmentStatus && (
            <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
              <CircleAlert size={14} />
              {
                errors.productEmployees[index]?.employmentStatus
                  ?.message
              }
            </p>
          )}
        </div>
      </div>

      {/* DATES */}
      <div className="grid grid-cols-2 gap-5 mt-5">
        {/* START DATE */}
        <div>
          <label className="block text-[14px] font-medium text-[#344054] mb-2">
            Start Date <span className="text-[#F04438]">*</span>
          </label>

          <input
            type="date"
            {...register(`productEmployees.${index}.startDate`)}
            className={`${inputStyle} ${
              errors.productEmployees?.[index]?.startDate
                ? errorInputStyle
                : ""
            }`}
          />

          {errors.productEmployees?.[index]?.startDate && (
            <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
              <CircleAlert size={14} />
              {errors.productEmployees[index]?.startDate?.message}
            </p>
          )}
        </div>

        {/* END DATE */}
        <div>
          <label className="block text-[14px] font-medium text-[#344054] mb-2">
            End Date
          </label>

          <input
            type="date"
            {...register(`productEmployees.${index}.endDate`)}
            className={inputStyle}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;