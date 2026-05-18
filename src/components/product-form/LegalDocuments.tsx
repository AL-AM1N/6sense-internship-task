import { Trash2, Plus } from "lucide-react";
import { inputStyle } from "@/lib/form-styles";

interface Props {
  register: any;
  useDocumentLinks: boolean;
  documentLinkFields: any[];
  appendDocumentLink: (value: { url: string }) => void;
  removeDocumentLink: (index: number) => void;
}

const LegalDocuments = ({
  register,
  useDocumentLinks,
  documentLinkFields,
  appendDocumentLink,
  removeDocumentLink,
}: Props) => {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-6">
      <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
        Upload Doc
      </label>

      <div>
        {/* FILE INPUT */}
        <input
          type="file"
          disabled={useDocumentLinks}
          className="
            w-full
            h-11
            border
            border-[#E4E7EC]
            rounded-md
            px-3
            py-2
            text-[14px]
            bg-white
            disabled:bg-[#F2F4F7]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />

        <p className="text-[12px] text-[#667085] mt-2">
          Any document file can be uploaded within 10MB.
        </p>

        {/* TOGGLE */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="useDocumentLinks"
            {...register("useDocumentLinks")}
          />

          <label
            htmlFor="useDocumentLinks"
            className="text-[14px] text-[#344054]"
          >
            Use link to share document
          </label>
        </div>

        {/* DOCUMENT LINKS */}
        {useDocumentLinks && (
          <div className="mt-5 space-y-4">
            {documentLinkFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="https://example.com/document"
                  {...register(`documentLinks.${index}.url`)}
                  className={inputStyle}
                />

                {/* REMOVE BUTTON */}
                {documentLinkFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDocumentLink(index)}
                    className="
                      w-11
                      h-11
                      flex
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-red-200
                      text-red-600
                      hover:bg-red-50
                      transition
                    "
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            {/* ADD MORE BUTTON */}
            <button
              type="button"
              onClick={() =>
                appendDocumentLink({
                  url: "",
                })
              }
              className="
                flex
                items-center
                gap-2
                text-[#1570EF]
                text-[14px]
                font-medium
                cursor-pointer
              "
            >
              <Plus size={16} />
              Add more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalDocuments;