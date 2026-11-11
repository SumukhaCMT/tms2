
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  render,
  screen,
  waitFor,

} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";

import { store } from "@/app/store";
import OrganizationsTable from "../component/OrganizationsTable";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

/* =========================================================
   MOCK ORGANIZATIONS
========================================================= */

const mockOrganizations = Array.from(
  { length: 40 },
  (_, index) => {
    const number = index + 1;

    return {
      id: number,
      org_name: `Organization ${number}`,
      org_legal_name: `Organization ${number} Legal Name`,
      org_gst_number: `GST${String(number).padStart(4, "0")}`,
      org_registration_number: `REG${String(number).padStart(4, "0")}`,
      org_email: `admin${number}@example.com`,
      org_phone: `+91 987654${String(number).padStart(4, "0")}`,
      org_address_line1: `${number}, Main Street`,
      org_city: number % 2 === 0 ? "Bengaluru" : "Pune",
      org_status: number % 2 === 0 ? "inactive" : "active",
      created_at: "2026-01-15T10:00:00.000Z",
    };
  },
);

/* =========================================================
   SPECIAL TEST DATA
========================================================= */

mockOrganizations[0] = {
  id: 1,
  org_name: "Shree Ganesh Temple Trust",
  org_legal_name: "Shree Ganesh Temple Trust Legal Name",
  org_gst_number: "GST0001",
  org_registration_number: "SGT001",
  org_email: "admin@ganeshtemple.com",
  org_phone: "+91 9876543210",
  org_address_line1: "Pune Main Road",
  org_city: "Pune",
  org_status: "active",
  created_at: "2026-01-15T10:00:00.000Z",
};

mockOrganizations[1] = {
  id: 2,
  org_name: "Shree Lakshmi Narayan Trust",
  org_legal_name: "Shree Lakshmi Narayan Trust Legal Name",
  org_gst_number: "GST0002",
  org_registration_number: "LNT002",
  org_email: "admin@lakshmitrust.com",
  org_phone: "+91 9876543211",
  org_address_line1: "Temple Road",
  org_city: "Bengaluru",
  org_status: "inactive",
  created_at: "2026-01-15T10:00:00.000Z",
};

mockOrganizations[11] = {
  id: 12,
  org_name: "Shree Venkateshwara Trust",
  org_legal_name: "Shree Venkateshwara Trust Legal Name",
  org_gst_number: "GST0012",
  org_registration_number: "SVT012",
  org_email: "admin@venkateshwaratrust.com",
  org_phone: "+91 9876543222",
  org_address_line1: "Temple Main Road",
  org_city: "Bengaluru",
  org_status: "active",
  created_at: "2026-01-15T10:00:00.000Z",
};

mockOrganizations[12] = {
  id: 13,
  org_name: "Shree Balaji Temple Trust",
  org_legal_name: "Shree Balaji Temple Trust Legal Name",
  org_gst_number: "GST0013",
  org_registration_number: "SBT013",
  org_email: "admin@balajitrust.com",
  org_phone: "+91 9876543223",
  org_address_line1: "Balaji Temple Road",
  org_city: "Pune",
  org_status: "inactive",
  created_at: "2026-01-15T10:00:00.000Z",
};

/* =========================================================
   MOCK ORGANIZATION SERVICE
========================================================= */

vi.mock("../services/organizationService", () => ({
  organizationService: {
    getOrganizations: vi.fn(async () => ({
      success: true,
      message: "Organizations fetched successfully",
      data: mockOrganizations,
      organizations: mockOrganizations,
      total: mockOrganizations.length,
    })),
    getOrganizationById: vi.fn(),
    createOrganization: vi.fn(),
    updateOrganization: vi.fn(),
    updateOrganizationSubscription: vi.fn(),
    deleteOrganization: vi.fn(async () => undefined),
  },
}));

/* =========================================================
   RENDER HELPER
========================================================= */

const renderComponent = () =>
  render(
    <Provider store={store}>
      <BrowserRouter>
        <OrganizationsTable />
        <ConfirmDeleteDialog />
      </BrowserRouter>
    </Provider>,
  );

const waitForOrganizations = async () => {
  await waitFor(() => {
    expect(
      screen.queryByText("Loading organizations..."),
    ).not.toBeInTheDocument();
  });
};

/* =========================================================
   TESTS
========================================================= */

describe("OrganizationsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  

  it("shows the first page with 10 organizations", async () => {
    renderComponent();
    await waitForOrganizations();

    expect(
      screen.getByText("Showing 1 to 10 of 40 organizations"),
    ).toBeInTheDocument();
  });

  it("renders first-page organizations", async () => {
    renderComponent();
    await waitForOrganizations();

    expect(
      screen.getByText("Shree Ganesh Temple Trust"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Shree Lakshmi Narayan Trust"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Shree Venkateshwara Trust"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Shree Balaji Temple Trust"),
    ).not.toBeInTheDocument();
  });

 

  it("renders organization status labels", async () => {
    renderComponent();
    await waitForOrganizations();

    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Inactive").length).toBeGreaterThan(0);
  });

  it("formats the created date correctly", async () => {
    renderComponent();
    await waitForOrganizations();

    expect(
      screen.getAllByText("15 Jan 2026").length,
    ).toBeGreaterThan(0);
  });

  it("moves to the next page", async () => {
    const user = userEvent.setup();

    renderComponent();
    await waitForOrganizations();

    await user.click(
      screen.getByRole("button", { name: "Go to next page" }),
    );

    expect(
      await screen.findByText("Showing 11 to 20 of 40 organizations"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Shree Venkateshwara Trust"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Shree Ganesh Temple Trust"),
    ).not.toBeInTheDocument();
  });

  it("moves back to the previous page", async () => {
    const user = userEvent.setup();

    renderComponent();
    await waitForOrganizations();

    await user.click(
      screen.getByRole("button", { name: "Go to next page" }),
    );

    expect(
      await screen.findByText("Showing 11 to 20 of 40 organizations"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Go to previous page" }),
    );

    expect(
      await screen.findByText("Showing 1 to 10 of 40 organizations"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Shree Ganesh Temple Trust"),
    ).toBeInTheDocument();
  });

  it("navigates directly to page 2", async () => {
    const user = userEvent.setup();

    renderComponent();
    await waitForOrganizations();

    await user.click(screen.getByRole("button", { name: "2" }));

    expect(
      await screen.findByText("Showing 11 to 20 of 40 organizations"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Shree Venkateshwara Trust"),
    ).toBeInTheDocument();
  });

  it("disables previous pagination on the first page", async () => {
    renderComponent();
    await waitForOrganizations();

    const previousButton = screen.getByRole("button", {
      name: "Go to previous page",
    });

    expect(previousButton).toHaveClass("pointer-events-none");
    expect(previousButton).toHaveClass("opacity-50");
  });

  it("renders list and grid view controls", async () => {
    renderComponent();
    await waitForOrganizations();

    expect(screen.getByTitle("List View")).toBeInTheDocument();
    expect(screen.getByTitle("Grid View")).toBeInTheDocument();
  });

 

  it("renders 10 view buttons on the first page", async () => {
    renderComponent();
    await waitForOrganizations();

    expect(screen.getAllByTitle("View")).toHaveLength(10);
  });

  it("renders 10 delete buttons on the first page", async () => {
    renderComponent();
    await waitForOrganizations();

    expect(screen.getAllByTitle("Delete")).toHaveLength(10);
  });

  it("renders four pagination pages", async () => {
    renderComponent();
    await waitForOrganizations();

    for (const page of ["1", "2", "3", "4"]) {
      expect(
        screen.getByRole("button", { name: page }),
      ).toBeInTheDocument();
    }
  });

  it("moves to the last page", async () => {
    const user = userEvent.setup();

    renderComponent();
    await waitForOrganizations();

    await user.click(screen.getByRole("button", { name: "4" }));

    expect(
      await screen.findByText("Showing 31 to 40 of 40 organizations"),
    ).toBeInTheDocument();

    expect(screen.getByText("Organization 40")).toBeInTheDocument();
  });

  it("opens the delete confirmation dialog", async () => {
    const user = userEvent.setup();

    renderComponent();
    await waitForOrganizations();

    const deleteButtons = screen.getAllByTitle("Delete");

    await user.click(deleteButtons[0]);

    expect(
      await screen.findByText("Delete organization?"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Are you sure you want to delete/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Cancel" }),
    ).toBeInTheDocument();

  expect(
  screen.getByRole("button", { name: /^Delete$/ }),
).toBeInTheDocument();
  });
});
