import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./page";

// 1. Mock next/navigation (useRouter)
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: mockPush,
    };
  },
}));

// 2. Mock react-redux (useDispatch)
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

// 3. Mutable flag to swap mutation outcomes dynamically across tests
let shouldMutationSucceed = true;

// Mock your custom mutation hook (useLogin) to execute callbacks
jest.mock("@/hooks/useLogin", () => ({
  useLogin: () => ({
    mutate: (variables: any, options: any) => {
      if (shouldMutationSucceed) {
        // Triggers your onSuccess branch (Lines 76-114)
        options.onSuccess({
          auth: {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
          },
          user: {
            firstName: "John",
            lastName: "Doe",
            email: variables.email,
          },
        });
      } else {
        // Triggers your onError branch (Lines 117-131)
        options.onError({
          response: {
            data: {
              message: "Invalid credentials provided",
            },
          },
        });
      }
    },
    isPending: false,
  }),
}));

// 4. Mock SweetAlert2 to avoid DOM rendering issues during alerts
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

// 5. Mock js-cookie so cookie mutations run safely in headless JSDOM
jest.mock("js-cookie", () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

describe("Login Page Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form correctly", () => {
    render(<Login />);
    
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^email address$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows validation errors when fields are left empty on submit", async () => {
    render(<Login />);
    
    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("shows an error when an invalid email format is typed", async () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/^email address$/i);
    const passwordInput = screen.getByPlaceholderText(/^password$/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("toggles password visibility state when clicking the eye icon", () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText(/^password$/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click the hide/show icon to turn password into plain text
    const toggleIcon = passwordInput.nextSibling?.firstChild || screen.getByRole("img", { hidden: true });
    fireEvent.click(toggleIcon);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("executes onSuccess pathway to store tokens, dispatch global state, and route away", async () => {
    shouldMutationSucceed = true; 
    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText(/^email address$/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), { target: { value: "securePassword123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Verifies lines 76-114 execute smoothly
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("executes onError pathway to surface backend failure text directly to the UI", async () => {
    shouldMutationSucceed = false; 
    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText(/^email address$/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), { target: { value: "wrongpassword" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Verifies lines 117-131, revealing the conditional error element
    expect(await screen.findByText("Invalid credentials provided")).toBeInTheDocument();
  });
});