import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import EditResourcePage from "./page";

const mockPush = jest.fn();
let mockParams: Record<string, string | undefined> = {
  productId: "product-1",
  resourceId: "resource-1",
};

const mockGet = jest.fn();
const mockPatch = jest.fn();
let shouldMutationError = false;
let currentMutationFn: ((formData: FormData) => Promise<any>) | null = null;
let mockQueryStatus = { isLoading: false, isError: false };
const mockQueryResults = new Map<string, any>();

jest.mock("next/navigation", () => ({
  useRouter() {
    return { push: mockPush };
  },
  useParams() {
    return mockParams;
  },
}));

jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockGet(...args),
    patch: (...args: any[]) => mockPatch(...args),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey, queryFn, enabled = true }: any) => {
    const key = Array.isArray(queryKey)
      ? JSON.stringify(queryKey)
      : JSON.stringify([queryKey]);

    if (enabled && !mockQueryStatus.isLoading && !mockQueryStatus.isError) {
      queryFn().catch(() => {});
    }

    return {
      data: mockQueryResults.get(key),
      isLoading: mockQueryStatus.isLoading,
      error: mockQueryStatus.isError ? new Error("Query failed") : null,
    };
  },
  useMutation: ({ mutationFn }: any) => {
    currentMutationFn = mutationFn;
    return {
      mutate: jest.fn((formData: FormData, options: any) => {
        if (!currentMutationFn) {
          throw new Error("Missing mutation function");
        }
        return currentMutationFn(formData)
          .then((result) => {
            if (shouldMutationError) {
              options.onError(result);
            } else {
              options.onSuccess(result);
            }
          })
          .catch((err) => options.onError(err));
      }),
      isPending: false,
    };
  },
}));

const categoriesPayload = [{ _id: "cat1", name: "Category One" }];
const toolsPayload = [{ _id: "tool1", name: "Tool One" }];
const resourceTypesPayload = [{ _id: "type1", name: "Type One" }];
const googleDriveItemsPayload = [{ id: "drive-1" }];
const resourceDetailsPayload = {
  _id: "resource-1",
  name: "Sample Resource",
  categoryId: { _id: "cat1", name: "Category One" },
  typeId: { _id: "type1", name: "Type One" },
  toolId: { _id: "tool1", name: "Tool One" },
  toolPurpose: "Use this tool for testing",
  instruction: "A short instruction for editing.",
  links: ["https://example.com"],
};

const getQueryKey = (queryKey: unknown) =>
  Array.isArray(queryKey) ? JSON.stringify(queryKey) : JSON.stringify([queryKey]);

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { productId: "product-1", resourceId: "resource-1" };
  mockQueryStatus = { isLoading: false, isError: false };
  shouldMutationError = false;
  mockQueryResults.clear();

  mockQueryResults.set(JSON.stringify(["resource-categories"]), categoriesPayload);
  mockQueryResults.set(JSON.stringify(["technology-tools"]), toolsPayload);
  mockQueryResults.set(JSON.stringify(["google-drive-items"]), googleDriveItemsPayload);
  mockQueryResults.set(JSON.stringify(["resource-details", "resource-1"]), resourceDetailsPayload);
  mockQueryResults.set(JSON.stringify(["resource-types", "cat1"]), resourceTypesPayload);

  mockGet.mockImplementation((url: string) => {
    if (url === "/resource-category/dropdown") {
      return Promise.resolve({ data: categoriesPayload });
    }
    if (url === "/technology-tool/dropdown") {
      return Promise.resolve({ data: toolsPayload });
    }
    if (url.startsWith("/tool-integration/items")) {
      return Promise.resolve({ data: googleDriveItemsPayload });
    }
    if (url === "/resource/resource-1") {
      return Promise.resolve({ data: { data: resourceDetailsPayload } });
    }
    if (url.startsWith("/resource-type/by-category")) {
      return Promise.resolve({ data: { types: resourceTypesPayload } });
    }
    return Promise.resolve({ data: null });
  });

  mockPatch.mockImplementation(() =>
    shouldMutationError
      ? Promise.reject({ response: { data: { message: "Save failed" } } })
      : Promise.resolve({ data: { success: true } }),
  );
});

describe("Edit Resource Page", () => {
  it("shows loading state while resource details are loading", () => {
    mockQueryStatus.isLoading = true;
    render(<EditResourcePage />);

    expect(screen.getByText("Loading resource details...")).toBeInTheDocument();
  });

  it("renders the resource form with pre-populated values", async () => {
    render(<EditResourcePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Sample Resource")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("Category One")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Tool One")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Use this tool for testing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("A short instruction for editing.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();
    expect(screen.getByText(/click or drag files to this area to upload/i)).toBeInTheDocument();
  });

  it("adds and removes link fields dynamically", async () => {
    render(<EditResourcePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();
    });

    const firstRow = screen.getByDisplayValue("https://example.com").closest("div");
    expect(firstRow).toBeInTheDocument();

    const addButton = within(firstRow!).getAllByRole("button")[0];
    fireEvent.click(addButton);

    const linkInputs = screen.getAllByPlaceholderText("https://example.com");
    expect(linkInputs).toHaveLength(2);

    fireEvent.change(linkInputs[1], {
      target: { value: "https://second.example.com" },
    });
    expect(screen.getByDisplayValue("https://second.example.com")).toBeInTheDocument();

    const secondRow = screen.getByDisplayValue("https://second.example.com").closest("div");
    expect(secondRow).toBeInTheDocument();

    const secondRowButtons = within(secondRow!).getAllByRole("button");
    expect(secondRowButtons).toHaveLength(2);

    const removeButton = secondRowButtons[0];
    fireEvent.click(removeButton);

    expect(screen.queryByDisplayValue("https://second.example.com")).not.toBeInTheDocument();
  });

  it("shows a validation error when the required resource name is cleared", async () => {
    render(<EditResourcePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Sample Resource")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/resource name/i);
    fireEvent.change(nameInput, { target: { value: "" } });

    const updateButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateButton);

    expect(await screen.findByText(/resource name is required/i)).toBeInTheDocument();
  });

  it("allows selecting files and shows them in the selected files list", async () => {
    render(<EditResourcePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/click or drag files to this area to upload/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/click or drag files to this area to upload/i);
    const validFile = new File(["hello"], "sample.txt", { type: "text/plain" });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(await screen.findByText("sample.txt")).toBeInTheDocument();
  });

  it("shows a file size error when the uploaded file exceeds 10MB", async () => {
    render(<EditResourcePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/click or drag files to this area to upload/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/click or drag files to this area to upload/i);
    const largeFile = new File([new Array(10485761).fill("a").join("")], "big.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(await screen.findByText(/exceeds the maximum 10MB threshold limit/i)).toBeInTheDocument();
  });

  it("submits the form successfully and navigates back to the control room", async () => {
    render(<EditResourcePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Sample Resource")).toBeInTheDocument();
    });

    mockPatch.mockResolvedValue({ data: { success: true } });

    const updateButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith("/resource/edit/resource-1", expect.any(FormData));
      expect(mockPush).toHaveBeenCalledWith("/dashboard/products/product-1/control-room");
    });
  });

  it("displays a global error when the update mutation fails", async () => {
    shouldMutationError = true;
    mockPatch.mockRejectedValue({ response: { data: { message: "Save failed" } } });

    render(<EditResourcePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Sample Resource")).toBeInTheDocument();
    });

    const updateButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateButton);

    expect(await screen.findByText(/save failed/i)).toBeInTheDocument();
  });

  it("renders fallback message when route params are missing", () => {
    mockParams = {};
    render(<EditResourcePage />);

    expect(screen.getByText(/resource path not found/i)).toBeInTheDocument();
  });
});
