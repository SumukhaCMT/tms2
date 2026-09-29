
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import {
  render,
  screen,
  waitFor,
} from "@testing-library/react"

import userEvent from "@testing-library/user-event"

import {
  BrowserRouter,
} from "react-router-dom"

import {
  Provider,
} from "react-redux"

import "@testing-library/jest-dom"

import {
  store,
} from "@/app/store"

import OrganizationsTable from "../component/OrganizationsTable"


/* =========================================================
   MOCK ORGANIZATIONS
========================================================= */

const mockOrganizations = Array.from(
  { length: 40 },
  (_, index) => {
    const number = index + 1

    return {
      id: number,

      org_name:
        `Organization ${number}`,

      org_legal_name:
        `Organization ${number} Legal Name`,

      org_gst_number:
        `GST${String(number).padStart(4, "0")}`,

      org_registration_number:
        `REG${String(number).padStart(4, "0")}`,

      org_email:
        `admin${number}@example.com`,

      org_phone:
        `+91 987654${String(number).padStart(4, "0")}`,

      org_address_line1:
        `${number}, Main Street`,

      org_city:
        number % 2 === 0
          ? "Bengaluru"
          : "Pune",

      org_status:
        number % 2 === 0
          ? "inactive"
          : "active",

      created_at:
        "2026-01-15T10:00:00.000Z",
    }
  },
)


/* =========================================================
   SPECIAL TEST DATA
========================================================= */

mockOrganizations[0] = {
  id: 1,

  org_name:
    "Shree Ganesh Temple Trust",

  org_legal_name:
    "Shree Ganesh Temple Trust Legal Name",

  org_gst_number:
    "GST0001",

  org_registration_number:
    "SGT001",

  org_email:
    "admin@ganeshtemple.com",

  org_phone:
    "+91 9876543210",

  org_address_line1:
    "Pune Main Road",

  org_city:
    "Pune",

  org_status:
    "active",

  created_at:
    "2026-01-15T10:00:00.000Z",
}


mockOrganizations[1] = {
  id: 2,

  org_name:
    "Shree Lakshmi Narayan Trust",

  org_legal_name:
    "Shree Lakshmi Narayan Trust Legal Name",

  org_gst_number:
    "GST0002",

  org_registration_number:
    "LNT002",

  org_email:
    "admin@lakshmitrust.com",

  org_phone:
    "+91 9876543211",

  org_address_line1:
    "Temple Road",

  org_city:
    "Bengaluru",

  org_status:
    "inactive",

  created_at:
    "2026-01-15T10:00:00.000Z",
}


mockOrganizations[11] = {
  id: 12,

  org_name:
    "Shree Venkateshwara Trust",

  org_legal_name:
    "Shree Venkateshwara Trust Legal Name",

  org_gst_number:
    "GST0012",

  org_registration_number:
    "SVT012",

  org_email:
    "admin@venkateshwaratrust.com",

  org_phone:
    "+91 9876543222",

  org_address_line1:
    "Temple Main Road",

  org_city:
    "Bengaluru",

  org_status:
    "active",

  created_at:
    "2026-01-15T10:00:00.000Z",
}


mockOrganizations[12] = {
  id: 13,

  org_name:
    "Shree Balaji Temple Trust",

  org_legal_name:
    "Shree Balaji Temple Trust Legal Name",

  org_gst_number:
    "GST0013",

  org_registration_number:
    "SBT013",

  org_email:
    "admin@balajitrust.com",

  org_phone:
    "+91 9876543223",

  org_address_line1:
    "Balaji Temple Road",

  org_city:
    "Pune",

  org_status:
    "inactive",

  created_at:
    "2026-01-15T10:00:00.000Z",
}


/* =========================================================
   MOCK ORGANIZATION SERVICE

   IMPORTANT:
   Do NOT mock organizationThunks.
   Redux slice requires:
   fetchOrganizations.pending
   fetchOrganizations.fulfilled
   fetchOrganizations.rejected
========================================================= */

vi.mock(
  "../services/organizationService",
  () => ({
    organizationService: {
      getOrganizations:
        vi.fn(
          async () => ({
            success: true,

            message:
              "Organizations fetched successfully",

            data:
              mockOrganizations,

            organizations:
              mockOrganizations,

            total:
              mockOrganizations.length,
          }),
        ),

      getOrganizationById:
        vi.fn(),

      createOrganization:
        vi.fn(),

      updateOrganization:
        vi.fn(),

      updateOrganizationSubscription:
        vi.fn(),

      deleteOrganization:
        vi.fn(
          async () => undefined,
        ),
    },
  }),
)


/* =========================================================
   RENDER HELPER
========================================================= */

const renderComponent = () => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <OrganizationsTable />
      </BrowserRouter>
    </Provider>,
  )
}


/* =========================================================
   WAIT FOR DATA
========================================================= */

const waitForOrganizations = async () => {
  await waitFor(
    () => {
      expect(
        screen.queryByText(
          "Loading organizations...",
        ),
      ).not.toBeInTheDocument()
    },
    {
      timeout: 3000,
    },
  )
}


/* =========================================================
   TESTS
========================================================= */

describe(
  "OrganizationsTable",
  () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })


    /* =====================================================
       1. ADD ORGANIZATION
    ===================================================== */

    it(
      "renders Add Organization button",
      async () => {
        renderComponent()

        await waitForOrganizations()

        expect(
          screen.getByRole(
            "button",
            {
              name: /add organization/i,
            },
          ),
        ).toBeInTheDocument()
      },
    )


    /* =====================================================
       2. TABLE HEADERS
    ===================================================== */

    it(
      "renders organization table in list view",
      async () => {
        renderComponent()

        await waitForOrganizations()

        expect(
          screen.getByText("Sl.no"),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Organization Name",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Organization legal Name",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "GST Number",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Oregistration Number",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Organization Email",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Organization Phone",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Full Address",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Created date ("customer since")',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Status",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Actions",
          ),
        ).toBeInTheDocument()
      },
    )


    /* =====================================================
       3. FIRST PAGE COUNT
    ===================================================== */

    it(
      "shows first page with 10 organizations",
      async () => {
        renderComponent()

        await waitForOrganizations()

        expect(
          screen.getByText(
            "Showing 1 to 10 of 40 organizations",
          ),
        ).toBeInTheDocument()
      },
    )


    /* =====================================================
       4. FIRST PAGE DATA
    ===================================================== */

    it(
      "shows first page organizations",
      async () => {
        renderComponent()

        await waitForOrganizations()

        expect(
          screen.getByText(
            "Shree Ganesh Temple Trust",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Shree Lakshmi Narayan Trust",
          ),
        ).toBeInTheDocument()

        expect(
          screen.queryByText(
            "Shree Venkateshwara Trust",
          ),
        ).not.toBeInTheDocument()

        expect(
          screen.queryByText(
            "Shree Balaji Temple Trust",
          ),
        ).not.toBeInTheDocument()
      },
    )


    /* =====================================================
       5. ORGANIZATION DETAILS
    ===================================================== */

    it(
      "renders organization details",
      async () => {
        renderComponent()

        await waitForOrganizations()

        expect(
          screen.getByText(
            "Shree Ganesh Temple Trust Legal Name",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "GST0001",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "SGT001",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "admin@ganeshtemple.com",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "+91 9876543210",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "Pune Main Road",
          ),
        ).toBeInTheDocument()
      },
    )


    /* =====================================================
       6. STATUS

       Active appears multiple times because several
       organizations are active.

       Inactive also appears multiple times.
    ===================================================== */

    it(
      "renders organization status",
      async () => {
        renderComponent()

        await waitForOrganizations()

        expect(
          screen.getAllByText(
            "Active",
          ).length,
        ).toBeGreaterThan(0)

        expect(
          screen.getAllByText(
            "Inactive",
          ).length,
        ).toBeGreaterThan(0)
      },
    )


    /* =====================================================
       7. NEXT PAGE

       Actual DOM:

       <a
         aria-label="Go to next page"
         role="button"
       />
    ===================================================== */

    it(
      "moves to next page",
      async () => {
        const user =
          userEvent.setup()

        renderComponent()

        await waitForOrganizations()

        const nextButton =
          screen.getByRole(
            "button",
            {
              name:
                "Go to next page",
            },
          )

        await user.click(
          nextButton,
        )

        await waitFor(
          () => {
            expect(
              screen.getByText(
                "Showing 11 to 20 of 40 organizations",
              ),
            ).toBeInTheDocument()
          },
        )

        expect(
          screen.getByText(
            "Shree Venkateshwara Trust",
          ),
        ).toBeInTheDocument()

        expect(
          screen.queryByText(
            "Shree Ganesh Temple Trust",
          ),
        ).not.toBeInTheDocument()
      },
    )


    /* =====================================================
       8. PREVIOUS PAGE

       Actual DOM:

       <a
         aria-label="Go to previous page"
         role="button"
       />
    ===================================================== */

    it(
      "moves back to previous page",
      async () => {
        const user =
          userEvent.setup()

        renderComponent()

        await waitForOrganizations()

        await user.click(
          screen.getByRole(
            "button",
            {
              name:
                "Go to next page",
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              screen.getByText(
                "Showing 11 to 20 of 40 organizations",
              ),
            ).toBeInTheDocument()
          },
        )

        await user.click(
          screen.getByRole(
            "button",
            {
              name:
                "Go to previous page",
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              screen.getByText(
                "Showing 1 to 10 of 40 organizations",
              ),
            ).toBeInTheDocument()
          },
        )

        expect(
          screen.getByText(
            "Shree Ganesh Temple Trust",
          ),
        ).toBeInTheDocument()
      },
    )


    /* =====================================================
       9. DIRECT PAGE 2
    ===================================================== */

    it(
      "moves directly to page 2",
      async () => {
        const user =
          userEvent.setup()

        renderComponent()

        await waitForOrganizations()

        const pageTwo =
          screen.getByRole(
            "button",
            {
              name: "2",
            },
          )

        await user.click(
          pageTwo,
        )

        await waitFor(
          () => {
            expect(
              screen.getByText(
                "Showing 11 to 20 of 40 organizations",
              ),
            ).toBeInTheDocument()
          },
        )

        expect(
          screen.getByText(
            "Shree Venkateshwara Trust",
          ),
        ).toBeInTheDocument()
      },
    )


    /* =====================================================
       10. PREVIOUS DISABLED
    ===================================================== */

    // it(
    //   "disables previous pagination on first page",
    //   async () => {
    //     renderComponent()

    //     await waitForOrganizations()

    //     const previousButton =
    //       screen.getByRole(
    //         "button",
    //         {
    //           name:
    //             "Go to previous page",
    //         },
    //       )

    //     expect(
    //       previousButton,
    //     ).toHaveAttribute(
    //       "aria-disabled",
    //       "true",
    //     )
    //   },
    // )

it(
  "disables previous pagination on first page",
  async () => {
    renderComponent()

    await waitForOrganizations()

    const previousButton =
      screen.getByRole(
        "button",
        {
          name:
            "Go to previous page",
        },
      )

    expect(
      previousButton,
    ).toHaveClass(
      "pointer-events-none",
    )

    expect(
      previousButton,
    ).toHaveClass(
      "opacity-50",
    )
  },
)
    /* =====================================================
       11. LIST / GRID BUTTONS
    ===================================================== */

    it(
      "renders list and grid view buttons",
      async () => {
        renderComponent()

        await waitForOrganizations()

        expect(
          screen.getByTitle(
            "List View",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByTitle(
            "Grid View",
          ),
        ).toBeInTheDocument()
      },
    )


    /* =====================================================
       12. GRID VIEW
    ===================================================== */

    it(
      "switches to grid view",
      async () => {
        const user =
          userEvent.setup()

        renderComponent()

        await waitForOrganizations()

        await user.click(
          screen.getByTitle(
            "Grid View",
          ),
        )

        expect(
          screen.getByText(
            "Shree Ganesh Temple Trust",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getAllByText(
            "Pune",
          ).length,
        ).toBeGreaterThan(0)

        expect(
          screen.getByText(
            "admin@ganeshtemple.com",
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            "+91 9876543210",
          ),
        ).toBeInTheDocument()
      },
    )


    /* =====================================================
       13. CREATED DATE
    ===================================================== */

    it(
      "formats created date correctly",
      async () => {
        renderComponent()

        await waitForOrganizations()

        expect(
          screen.getAllByText(
            "15 Jan 2026",
          ).length,
        ).toBeGreaterThan(0)
      },
    )


    /* =====================================================
       14. VIEW BUTTONS
    ===================================================== */

    it(
      "renders 10 view buttons on first page",
      async () => {
        renderComponent()

        await waitForOrganizations()

        const viewButtons =
          screen.getAllByTitle(
            "View",
          )

        expect(
          viewButtons,
        ).toHaveLength(10)
      },
    )


    /* =====================================================
       15. DELETE BUTTONS
    ===================================================== */

    it(
      "renders 10 delete buttons on first page",
      async () => {
        renderComponent()

        await waitForOrganizations()

        const deleteButtons =
          screen.getAllByTitle(
            "Delete",
          )

        expect(
          deleteButtons,
        ).toHaveLength(10)
      },
    )


    /* =====================================================
       16. PAGINATION PAGES
    ===================================================== */

    it(
      "renders four pagination pages",
      async () => {
        renderComponent()

        await waitForOrganizations()

        expect(
          screen.getByRole(
            "button",
            {
              name: "1",
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            "button",
            {
              name: "2",
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            "button",
            {
              name: "3",
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            "button",
            {
              name: "4",
            },
          ),
        ).toBeInTheDocument()
      },
    )


    /* =====================================================
       17. LAST PAGE
    ===================================================== */

    it(
      "moves to last page",
      async () => {
        const user =
          userEvent.setup()

        renderComponent()

        await waitForOrganizations()

        await user.click(
          screen.getByRole(
            "button",
            {
              name: "4",
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              screen.getByText(
                "Showing 31 to 40 of 40 organizations",
              ),
            ).toBeInTheDocument()
          },
        )

        expect(
          screen.getByText(
            "Organization 40",
          ),
        ).toBeInTheDocument()
      },
    )
  },
)
