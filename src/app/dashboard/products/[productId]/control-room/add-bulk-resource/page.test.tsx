import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddBulkResourcePage from "./page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: mockPush,
    };
  },
  useParams() {
    return {
      productId: "p123",
    };
  },
}));

const mockMutate = jest.fn((_: any, options: any) => {
  if (options?.onSuccess) {
    options.onSuccess({});
  }
});

jest.mock("./hooks/useCategories", () => ({
  useCategories: () => ({ data: [] }),
}));

jest.mock("./hooks/useTools", () => ({
  useTools: () => ({ data: [] }),
}));

jest.mock("./hooks/useResourceTypes", () => ({
  useResourceTypes: () => ({ data: [], isLoading: false }),
}));

jest.mock("./hooks/useBulkUpload", () => ({
  useBulkUpload: () => ({
    isPending: false,
    mutate: mockMutate,
  }),
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => (data: any) => ({
    values: data,
    errors: {},
  }),
}));

const mockBuildBulkFormData = jest.fn(() => {
  const formData = new FormData();
  formData.append("dummy", "value");
  return formData;
});

jest.mock("./utils/buildBulkFormData", () => ({
  buildBulkFormData: () => mockBuildBulkFormData(),
}));

jest.mock("react-dropzone", () => ({
  useDropzone: (options: any) => ({
    getRootProps: () => ({}),
    getInputProps: () => ({
      type: "file",
      "data-testid": "bulk-dropzone-input",
      onChange: (event: any) => {
        if (options && typeof options.onDrop === "function") {
          const files = Array.from(event.target.files || []);
          options.onDrop(files);
        }
      },
    }),
    isDragActive: false,
  }),
}));

describe("Add Bulk Resource Page Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the bulk upload page correctly", () => {
    render(<AddBulkResourcePage />);

    expect(screen.getByRole("heading", { name: /add resources/i })).toBeInTheDocument();
    expect(screen.getByText(/click or drag file to this area to upload/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add resource/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("disables add resource submit until a file is uploaded", () => {
    render(<AddBulkResourcePage />);

    expect(screen.getByRole("button", { name: /add resource/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
  });

  it("routes back to control room when cancel is clicked", () => {
    render(<AddBulkResourcePage />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/products/p123/control-room");
  });

  it("submits a valid uploaded resource and navigates on success", async () => {
    render(<AddBulkResourcePage />);

    const file = new File(["dummy content"], "resource.pdf", {
      type: "application/pdf",
    });

    const input = screen.getByTestId("bulk-dropzone-input");
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add resource/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /add resource/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard/products/p123/control-room");
    });
  });
});
