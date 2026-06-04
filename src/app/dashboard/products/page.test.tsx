import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductsPage from "./page";

// 1. Mock next/navigation (useRouter & useSearchParams)
const mockPush = jest.fn();
let mockUrlParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: mockPush,
    };
  },
  useSearchParams() {
    return mockUrlParams;
  },
}));

// 2. Mock axiosInstance to control network results
const mockGet = jest.fn();
jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockGet(...args),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

// 3. Mock React Query structure
let mockQueryStatus = { isLoading: false, isError: false, data: null as any };

jest.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryFn }: { queryFn: () => Promise<any> }) => {
    // Actively invoke the queryFn to run your axios request lines for full coverage
    if (!mockQueryStatus.isLoading && !mockQueryStatus.isError) {
      queryFn().catch(() => {});
    }
    return {
      data: mockQueryStatus.data,
      isLoading: mockQueryStatus.isLoading,
      error: mockQueryStatus.isError ? new Error("Async Error") : null,
    };
  },
}));

// Mock Data Payload Matching Your API structure
const dummyProducts = [
  {
    _id: "p1",
    name: "Alpha Product",
    details: "Premium tier item",
    created_at: "2026-01-15T00:00:00.000Z",
    company: { name: "Acme Corp" },
    contract: { status: "signed" },
  },
  {
    _id: "p2",
    name: "Beta System",
    details: "Legacy stack maintenance",
    created_at: "2026-02-20T00:00:00.000Z",
    company: { name: "Stark Industries" },
    contract: { status: "draft" },
  },
];

describe("Products Page Dashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUrlParams = new URLSearchParams(); // Reset URL values
    mockQueryStatus = {
      isLoading: false,
      isError: false,
      data: { data: dummyProducts, count: 2 },
    };
    mockGet.mockResolvedValue({ data: { data: dummyProducts, count: 2 } });
  });

  it("renders loading indicator component states", () => {
    mockQueryStatus.isLoading = true;

    // 1. Destructure the 'container' from render
    const { container } = render(<ProductsPage />);

    // 2. Use standard DOM querySelector to find the DaisyUI spinner class
    const spinner = container.querySelector(".loading");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("loading-bars");
  });

  it("renders a user-friendly generic server failure block", () => {
    mockQueryStatus.isError = true;
    render(<ProductsPage />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders empty table state if products payload array returns empty", () => {
    mockQueryStatus.data = { data: [], count: 0 };
    render(<ProductsPage />);
    expect(screen.getByText("No products found")).toBeInTheDocument();
  });

  it("renders active product metadata rows cleanly within table schema", () => {
    render(<ProductsPage />);

    expect(screen.getByText("Alpha Product")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Beta System")).toBeInTheDocument();

    // Explicit verification of status label mapping rules
    expect(screen.getByText("signed")).toHaveClass("bg-blue-100");
    expect(screen.getByText("draft")).toHaveClass("bg-black");
  });

  it("triggers search processing when input text changes and search button is pressed", async () => {
    render(<ProductsPage />);

    const searchInput = screen.getByPlaceholderText(
      "Search by product or company",
    );
    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    const searchBtn = screen.getByRole("button", { name: /^search$/i });
    fireEvent.click(searchBtn);

    // Verifies it resets back to page 1 and attaches query string parameters
    expect(mockPush).toHaveBeenCalledWith("?page=1&query=Alpha");
  });

  it("triggers search processing when clicking Enter key in input context", () => {
    render(<ProductsPage />);

    const searchInput = screen.getByPlaceholderText(
      "Search by product or company",
    );
    fireEvent.change(searchInput, { target: { value: "Beta" } });
    fireEvent.keyDown(searchInput, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(mockPush).toHaveBeenCalledWith("?page=1&query=Beta");
  });

  it("ignores search processing when other non-enter keys are typed", () => {
    render(<ProductsPage />);

    const searchInput = screen.getByPlaceholderText(
      "Search by product or company",
    );
    fireEvent.keyDown(searchInput, { key: "Escape", code: "Escape" });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("routes query params correctly when status dropdown filter shifts options", () => {
    render(<ProductsPage />);

    const filterSelect = screen.getByRole("combobox");
    fireEvent.change(filterSelect, { target: { value: "signed" } });

    expect(mockPush).toHaveBeenCalledWith("?page=1&filterBy=signed");
  });

  it("updates pagination parameters when a separate numeric footer link is clicked", () => {
    // Inject mock parameters suggesting multiple records to force multi-page lists
    mockQueryStatus.data = { data: dummyProducts, count: 50 };
    render(<ProductsPage />);

    const targetPageButton = screen.getByRole("button", { name: "2" });
    fireEvent.click(targetPageButton);

    expect(mockPush).toHaveBeenCalledWith("?page=2");
  });

  it("redirects users to internal product creation view when create button is clicked", () => {
    render(<ProductsPage />);

    const addProductBtn = screen.getByRole("button", { name: /add product/i });
    fireEvent.click(addProductBtn);

    expect(mockPush).toHaveBeenCalledWith("/dashboard/products/create");
  });

  it("redirects users to specific control room path when table line links are actioned", () => {
    render(<ProductsPage />);

    const controlRoomButtons = screen.getAllByText("Control room");
    fireEvent.click(controlRoomButtons[0]); // Click the first product row link

    expect(mockPush).toHaveBeenCalledWith(
      "/dashboard/products/p1/control-room",
    );
  });

  it("safely evaluates comprehensive layout branches for pagination ranges", () => {
    // Branch Coverage Scenario A: Low current page position with wide limits
    mockUrlParams.set("page", "2");
    mockQueryStatus.data = { data: dummyProducts, count: 150 }; // 15 pages total
    const { rerender } = render(<ProductsPage />);
    expect(screen.getByText("...")).toBeInTheDocument();

    // Branch Coverage Scenario B: High trailing page position near end limits
    mockUrlParams.set("page", "14");
    rerender(<ProductsPage />);
    expect(screen.getByText("14")).toBeInTheDocument();

    // Branch Coverage Scenario C: Balanced position directly midway through datasets
    mockUrlParams.set("page", "7");
    rerender(<ProductsPage />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
