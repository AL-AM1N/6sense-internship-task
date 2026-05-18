interface Props {
  label: React.ReactNode;
  children: React.ReactNode;
}

const FormRow = ({ label, children }: Props) => {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-6">
      <div className="text-[14px] text-right font-medium text-[#344054] pt-3">
        {label}
      </div>

      <div>{children}</div>
    </div>
  );
};

export default FormRow;