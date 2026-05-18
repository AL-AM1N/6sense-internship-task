interface Props {
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ title, children }: Props) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#101828] mb-8">
        {title}
      </h2>

      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default FormSection;