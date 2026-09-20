import { useNavigate } from "react-router-dom";

// =====================================================
// DASHBOARD SUMMARY DATA
// =====================================================

const summaryCards = [
  {
    title: "Total Products",
    value: "120",
    icon: "▣",
  },
  {
    title: "Total Categories",
    value: "8",
    icon: "▱",
  },
  {
    title: "Registered Users",
    value: "1,250",
    icon: "♙",
  },
  {
    title: "Total Orders",
    value: "560",
    icon: "♧",
  },
  {
    title: "Active Coupons",
    value: "25",
    icon: "▤",
  },
];

// =====================================================
// REVENUE DATA
// =====================================================

const revenueCards = [
  {
    title: "Total Revenue",
    value: "₹2,45,000",
    change: "+14.2%",
    description: "vs. last month (₹2,14,500)",
  },
  {
    title: "Today's Revenue",
    value: "₹8,500",
    change: "+5.1%",
    description: "vs. yesterday (₹8,090)",
  },
  {
    title: "This Month's Revenue",
    value: "₹75,000",
    change: "+12.5%",
    description: "vs. previous period",
  },
  {
    title: "Avg. Order Value",
    value: "₹1,250",
    change: "+3.4%",
    description: "vs. last period (₹1,210)",
  },
];

// =====================================================
// TOP PRODUCTS
// =====================================================

const topProducts = [
  {
    rank: "01",
    product: "Hoodie",
    sold: "120",
    revenue: "₹60,000",
  },
  {
    rank: "02",
    product: "T-Shirt",
    sold: "95",
    revenue: "₹38,000",
  },
  {
    rank: "03",
    product: "Jeans",
    sold: "80",
    revenue: "₹56,000",
  },
  {
    rank: "04",
    product: "Jacket",
    sold: "72",
    revenue: "₹90,000",
  },
  {
    rank: "05",
    product: "Sneakers",
    sold: "65",
    revenue: "₹43,000",
  },
];

// =====================================================
// TOP CATEGORIES
// =====================================================

const topCategories = [
  {
    category: "Men",
    orders: "250",
    revenue: "₹1,20,000",
  },
  {
    category: "Women",
    orders: "180",
    revenue: "₹90,000",
  },
  {
    category: "Accessories",
    orders: "90",
    revenue: "₹35,000",
  },
  {
    category: "Footwear",
    orders: "75",
    revenue: "₹20,000",
  },
];

// =====================================================
// TOP CUSTOMERS
// =====================================================

const topCustomers = [
  {
    customer: "Julian Reed",
    orders: "15",
    spent: "₹25,000",
  },
  {
    customer: "Marcus Vance",
    orders: "12",
    spent: "₹20,000",
  },
  {
    customer: "Adrian Cole",
    orders: "10",
    spent: "₹18,000",
  },
  {
    customer: "Ethan Hunt",
    orders: "8",
    spent: "₹15,000",
  },
];

// =====================================================
// RECENT ORDERS
// =====================================================

const recentOrders = [
  {
    id: "#UT-8921",
    customer: "Julian Reed",
    amount: "₹4,500",
    status: "Delivered",
    date: "Today, 14:20",
  },
  {
    id: "#UT-8920",
    customer: "Sarah Jenkins",
    amount: "₹2,850",
    status: "Shipped",
    date: "Today, 11:45",
  },
  {
    id: "#UT-8919",
    customer: "Liam Foster",
    amount: "₹6,600",
    status: "Processing",
    date: "Today, 09:15",
  },
  {
    id: "#UT-8918",
    customer: "Michael Chang",
    amount: "₹1,990",
    status: "Pending",
    date: "Yesterday",
  },
  {
    id: "#UT-8917",
    customer: "David Miller",
    amount: "₹3,400",
    status: "Delivered",
    date: "Yesterday",
  },
];

// =====================================================
// LOW STOCK PRODUCTS
// =====================================================

const lowStockProducts = [
  {
    product: "Black Hoodie",
    current: "5 units",
    status: "Low Stock",
  },
  {
    product: "Classic T-Shirt",
    current: "3 units",
    status: "Critical",
  },
  {
    product: "Blue Jeans",
    current: "8 units",
    status: "Low Stock",
  },
];

// =====================================================
// STATUS STYLES
// =====================================================

const getStatusClasses = (status) => {
  const statusClasses = {
    Delivered:
      "border border-emerald-900/60 bg-emerald-950/30 text-emerald-400",

    Shipped:
      "border border-blue-900/60 bg-blue-950/30 text-blue-400",

    Processing:
      "border border-yellow-900/60 bg-yellow-950/30 text-yellow-400",

    Pending:
      "border border-orange-900/60 bg-orange-950/30 text-orange-400",

    "Low Stock":
      "border border-yellow-900/60 bg-yellow-950/30 text-yellow-400",

    Critical:
      "border border-red-900/60 bg-red-950/30 text-red-400",
  };

  return (
    statusClasses[status] ||
    "border border-neutral-700 bg-neutral-900 text-neutral-400"
  );
};

// =====================================================
// ADMIN DASHBOARD
// =====================================================

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    /*
     * IMPORTANT:
     *
     * AdminLayout already provides:
     *
     * - AdminSidebar
     * - Sidebar spacing
     * - Main content wrapper
     *
     * Therefore this component must NOT contain
     * another sidebar or another <main> wrapper.
     */
    <div className="min-h-screen bg-[#111111] text-white">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <header className="flex flex-col justify-between gap-4 border-b border-[#292929] px-5 py-5 sm:flex-row sm:items-center sm:px-8">

        <div>
          <h2 className="font-serif text-2xl text-neutral-100">
            Dashboard
          </h2>

          <p className="mt-1 text-xs text-neutral-500">
            Welcome to the UrbanThread Admin Panel
          </p>
        </div>

        <button
          type="button"
          className="flex w-fit items-center gap-3 border border-[#292929] bg-[#181818] px-4 py-2.5 text-[10px] uppercase tracking-[0.12em] text-neutral-400 transition hover:border-[#4a4a4a] hover:text-white"
        >
          <span>▣</span>
          <span>Last 30 Days</span>
          <span>⌄</span>
        </button>
      </header>

      {/* =================================================
          DASHBOARD CONTENT
      ================================================= */}

      <div className="space-y-8 px-5 py-7 sm:px-8">

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="border border-[#292929] bg-[#1b1b1b] p-5 transition hover:border-[#3b3b3b]"
            >
              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center border border-[#292929] bg-[#202020] text-xl text-neutral-400">
                  {card.icon}
                </div>

                <span className="text-[9px] text-neutral-600">
                  •••
                </span>

              </div>

              <p className="mt-5 text-[9px] uppercase tracking-[0.15em] text-neutral-500">
                {card.title}
              </p>

              <p className="mt-2 font-serif text-2xl text-neutral-200">
                {card.value}
              </p>
            </div>
          ))}

        </section>

        {/* =================================================
            REVENUE OVERVIEW
        ================================================= */}

        <section>

          <div className="mb-4 flex items-center justify-between">

            <h3 className="font-serif text-xl text-neutral-200">
              Revenue Overview
            </h3>

            <span className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">
              Realtime Ledger
            </span>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {revenueCards.map((card) => (
              <div
                key={card.title}
                className="border border-[#292929] bg-[#1b1b1b] p-5"
              >

                <div className="flex items-center justify-between gap-3">

                  <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">
                    {card.title}
                  </p>

                  <span className="border border-[#3c3c3c] px-2 py-1 text-[9px] text-neutral-400">
                    {card.change}
                  </span>

                </div>

                <p className="mt-4 font-serif text-2xl text-neutral-200">
                  {card.value}
                </p>

                <p className="mt-2 text-[10px] text-neutral-600">
                  {card.description}
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* =================================================
            SALES AND ORDER STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">

          {/* =================================================
              SALES OVERVIEW
          ================================================= */}

          <div className="border border-[#292929] bg-[#1b1b1b] p-5 sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <h3 className="font-serif text-xl text-neutral-200">
                  Sales Overview
                </h3>

                <p className="mt-1 text-[10px] text-neutral-500">
                  Revenue performance over time
                </p>

              </div>

              <button
                type="button"
                className="border border-[#292929] bg-[#202020] px-3 py-2 text-[10px] text-neutral-400"
              >
                Revenue ⌄
              </button>

            </div>

            <div className="mt-8">

              <svg
                viewBox="0 0 700 270"
                className="h-auto w-full"
                role="img"
                aria-label="Sales overview chart"
              >

                <defs>

                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#bdbab4"
                      stopOpacity="0.28"
                    />

                    <stop
                      offset="100%"
                      stopColor="#bdbab4"
                      stopOpacity="0"
                    />

                  </linearGradient>

                </defs>

                <line
                  x1="45"
                  y1="30"
                  x2="45"
                  y2="220"
                  stroke="#303030"
                  strokeWidth="1"
                />

                <line
                  x1="45"
                  y1="220"
                  x2="670"
                  y2="220"
                  stroke="#303030"
                  strokeWidth="1"
                />

                <line
                  x1="45"
                  y1="165"
                  x2="670"
                  y2="165"
                  stroke="#252525"
                  strokeWidth="1"
                />

                <line
                  x1="45"
                  y1="110"
                  x2="670"
                  y2="110"
                  stroke="#252525"
                  strokeWidth="1"
                />

                <line
                  x1="45"
                  y1="55"
                  x2="670"
                  y2="55"
                  stroke="#252525"
                  strokeWidth="1"
                />

                <text
                  x="8"
                  y="224"
                  fill="#666666"
                  fontSize="9"
                >
                  ₹0
                </text>

                <text
                  x="5"
                  y="169"
                  fill="#666666"
                  fontSize="9"
                >
                  ₹20K
                </text>

                <text
                  x="5"
                  y="114"
                  fill="#666666"
                  fontSize="9"
                >
                  ₹40K
                </text>

                <text
                  x="5"
                  y="59"
                  fill="#666666"
                  fontSize="9"
                >
                  ₹60K
                </text>

                <path
                  d="M45 195 C90 178, 110 170, 150 174 S210 190, 255 170 S320 150, 365 135 S425 130, 470 110 S530 80, 570 75 S625 55, 670 85 L670 220 L45 220 Z"
                  fill="url(#salesGradient)"
                />

                <path
                  d="M45 195 C90 178, 110 170, 150 174 S210 190, 255 170 S320 150, 365 135 S425 130, 470 110 S530 80, 570 75 S625 55, 670 85"
                  fill="none"
                  stroke="#c8c5be"
                  strokeWidth="2"
                />

                <line
                  x1="570"
                  y1="75"
                  x2="570"
                  y2="220"
                  stroke="#555555"
                  strokeDasharray="4 4"
                />

                <circle
                  cx="570"
                  cy="75"
                  r="4"
                  fill="#c8c5be"
                />

                <rect
                  x="525"
                  y="30"
                  width="95"
                  height="34"
                  fill="#242424"
                  stroke="#383838"
                />

                <text
                  x="538"
                  y="44"
                  fill="#999999"
                  fontSize="8"
                >
                  SATURDAY
                </text>

                <text
                  x="538"
                  y="55"
                  fill="#d4d1ca"
                  fontSize="9"
                >
                  ₹52,000
                </text>

                <text
                  x="45"
                  y="242"
                  fill="#666666"
                  fontSize="9"
                >
                  Mon
                </text>

                <text
                  x="145"
                  y="242"
                  fill="#666666"
                  fontSize="9"
                >
                  Tue
                </text>

                <text
                  x="245"
                  y="242"
                  fill="#666666"
                  fontSize="9"
                >
                  Wed
                </text>

                <text
                  x="345"
                  y="242"
                  fill="#666666"
                  fontSize="9"
                >
                  Thu
                </text>

                <text
                  x="445"
                  y="242"
                  fill="#666666"
                  fontSize="9"
                >
                  Fri
                </text>

                <text
                  x="545"
                  y="242"
                  fill="#666666"
                  fontSize="9"
                >
                  Sat
                </text>

                <text
                  x="645"
                  y="242"
                  fill="#666666"
                  fontSize="9"
                >
                  Sun
                </text>

              </svg>

            </div>

          </div>

          {/* =================================================
              ORDER STATISTICS
          ================================================= */}

          <div className="border border-[#292929] bg-[#1b1b1b] p-5 sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <h3 className="font-serif text-xl text-neutral-200">
                  Order Statistics
                </h3>

              </div>

              <span className="text-neutral-500">
                ⓘ
              </span>

            </div>

            <div className="relative mx-auto mt-8 flex h-44 w-44 items-center justify-center">

              <div className="absolute inset-0 rounded-full border-[18px] border-[#d0cdc6] border-r-[#6e6c68] border-b-[#373737]" />

              <div className="relative text-center">

                <p className="font-serif text-3xl text-neutral-200">
                  560
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-neutral-500">
                  Total Orders
                </p>

              </div>

            </div>

            <div className="mt-7 space-y-3">

              {[
                ["Delivered", "120", "bg-[#d0cdc6]"],
                ["Shipped", "50", "bg-[#898781]"],
                ["Processing", "35", "bg-[#5d5c58]"],
                ["Pending", "20", "bg-[#3e3d3a]"],
                ["Cancelled", "10", "bg-[#292929]"],
              ].map(([label, value, colorClass]) => (

                <div
                  key={label}
                  className="flex items-center justify-between text-xs"
                >

                  <div className="flex items-center gap-2 text-neutral-400">

                    <span
                      className={`h-2 w-2 rounded-full ${colorClass}`}
                    />

                    <span>
                      {label}
                    </span>

                  </div>

                  <span className="text-neutral-300">
                    {value}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </section>

        {/* =================================================
            USER STATISTICS
        ================================================= */}

        <section className="border border-[#292929] bg-[#1b1b1b] p-5 sm:p-6">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

            <div>

              <h3 className="font-serif text-xl text-neutral-200">
                User Statistics
              </h3>

              <p className="mt-1 text-[10px] text-neutral-500">
                Cohort engagement and registration trajectory
              </p>

            </div>

            <span className="w-fit border border-[#292929] px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-neutral-500">
              30 Day Active
            </span>

          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_2fr]">

            <div className="grid grid-cols-2 gap-3">

              <div className="border border-[#292929] bg-[#181818] p-4">

                <p className="text-[9px] uppercase tracking-[0.1em] text-neutral-500">
                  Total Users
                </p>

                <p className="mt-3 font-serif text-2xl text-neutral-200">
                  1,250
                </p>

                <p className="mt-1 text-[9px] text-emerald-500">
                  +8.5% overall growth
                </p>

              </div>

              <div className="border border-[#292929] bg-[#181818] p-4">

                <p className="text-[9px] uppercase tracking-[0.1em] text-neutral-500">
                  New Users Today
                </p>

                <p className="mt-3 font-serif text-2xl text-neutral-200">
                  18
                </p>

                <p className="mt-1 text-[9px] text-neutral-500">
                  +2 vs yesterday
                </p>

              </div>

              <div className="border border-[#292929] bg-[#181818] p-4">

                <p className="text-[9px] uppercase tracking-[0.1em] text-neutral-500">
                  New This Month
                </p>

                <p className="mt-3 font-serif text-2xl text-neutral-200">
                  145
                </p>

                <p className="mt-1 text-[9px] text-neutral-500">
                  +15.2% vs previous
                </p>

              </div>

              <div className="border border-[#292929] bg-[#181818] p-4">

                <p className="text-[9px] uppercase tracking-[0.1em] text-neutral-500">
                  Active Customers
                </p>

                <p className="mt-3 font-serif text-2xl text-neutral-200">
                  780
                </p>

                <p className="mt-1 text-[9px] text-neutral-500">
                  62.4% retention rate
                </p>

              </div>

            </div>

            <div className="border border-[#292929] bg-[#181818] p-5 lg:col-span-2">

              <div className="flex items-center justify-between">

                <p className="text-[10px] text-neutral-400">
                  30-Day Registration Trajectory
                </p>

                <span className="text-[9px] text-neutral-500">
                  +145 this cycle
                </span>

              </div>

              <div className="mt-7 flex h-32 items-end gap-2 border-b border-[#292929] px-2">

                {[25, 35, 42, 52, 60, 70, 82, 95, 105, 120].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-[#77756f] transition hover:bg-[#bcb9b1]"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  )
                )}

              </div>

              <div className="mt-3 flex justify-between text-[9px] text-neutral-600">

                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
                <span>Peak</span>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            TOP PERFORMANCE
        ================================================= */}

        <section>

          <div className="mb-4 flex items-center justify-between">

            <h3 className="font-serif text-xl text-neutral-200">
              Top Performance
            </h3>

            <span className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">
              Revenue Drivers
            </span>

          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

            {/* =================================================
                TOP PRODUCTS
            ================================================= */}

            <div className="border border-[#292929] bg-[#1b1b1b] p-5">

              <div className="flex items-center justify-between">

                <h4 className="text-sm text-neutral-300">
                  Top Selling Products
                </h4>

                <span className="text-neutral-500">
                  ♙
                </span>

              </div>

              <div className="mt-5 overflow-x-auto">

                <table className="w-full min-w-[360px] text-left">

                  <thead>

                    <tr className="border-b border-[#292929] text-[9px] uppercase tracking-[0.1em] text-neutral-600">

                      <th className="pb-3 font-normal">
                        Rank
                      </th>

                      <th className="pb-3 font-normal">
                        Product
                      </th>

                      <th className="pb-3 font-normal">
                        Sold
                      </th>

                      <th className="pb-3 text-right font-normal">
                        Revenue
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {topProducts.map((item) => (

                      <tr
                        key={item.rank}
                        className="border-b border-[#252525] last:border-0"
                      >

                        <td className="py-3 text-[10px] text-neutral-600">
                          {item.rank}
                        </td>

                        <td className="py-3 text-xs text-neutral-300">
                          {item.product}
                        </td>

                        <td className="py-3 text-xs text-neutral-400">
                          {item.sold}
                        </td>

                        <td className="py-3 text-right text-xs text-neutral-300">
                          {item.revenue}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="mt-5 text-[9px] uppercase tracking-[0.12em] text-neutral-500 transition hover:text-white"
              >
                View All Products →
              </button>

            </div>

            {/* =================================================
                TOP CATEGORIES
            ================================================= */}

            <div className="border border-[#292929] bg-[#1b1b1b] p-5">

              <div className="flex items-center justify-between">

                <h4 className="text-sm text-neutral-300">
                  Top Categories
                </h4>

                <span className="text-neutral-500">
                  ♧
                </span>

              </div>

              <div className="mt-5 overflow-x-auto">

                <table className="w-full min-w-[300px] text-left">

                  <thead>

                    <tr className="border-b border-[#292929] text-[9px] uppercase tracking-[0.1em] text-neutral-600">

                      <th className="pb-3 font-normal">
                        Category
                      </th>

                      <th className="pb-3 font-normal">
                        Orders
                      </th>

                      <th className="pb-3 text-right font-normal">
                        Revenue
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {topCategories.map((item) => (

                      <tr
                        key={item.category}
                        className="border-b border-[#252525] last:border-0"
                      >

                        <td className="py-3 text-xs text-neutral-300">
                          {item.category}
                        </td>

                        <td className="py-3 text-xs text-neutral-400">
                          {item.orders}
                        </td>

                        <td className="py-3 text-right text-xs text-neutral-300">
                          {item.revenue}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/categories")}
                className="mt-5 text-[9px] uppercase tracking-[0.12em] text-neutral-500 transition hover:text-white"
              >
                View All Categories →
              </button>

            </div>

            {/* =================================================
                TOP CUSTOMERS
            ================================================= */}

            <div className="border border-[#292929] bg-[#1b1b1b] p-5">

              <div className="flex items-center justify-between">

                <h4 className="text-sm text-neutral-300">
                  Top Customers
                </h4>

                <span className="text-neutral-500">
                  ♙
                </span>

              </div>

              <div className="mt-5 overflow-x-auto">

                <table className="w-full min-w-[300px] text-left">

                  <thead>

                    <tr className="border-b border-[#292929] text-[9px] uppercase tracking-[0.1em] text-neutral-600">

                      <th className="pb-3 font-normal">
                        Customer
                      </th>

                      <th className="pb-3 font-normal">
                        Orders
                      </th>

                      <th className="pb-3 text-right font-normal">
                        Total Spent
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {topCustomers.map((item) => (

                      <tr
                        key={item.customer}
                        className="border-b border-[#252525] last:border-0"
                      >

                        <td className="py-3 text-xs text-neutral-300">
                          {item.customer}
                        </td>

                        <td className="py-3 text-xs text-neutral-400">
                          {item.orders}
                        </td>

                        <td className="py-3 text-right text-xs text-neutral-300">
                          {item.spent}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="mt-5 text-[9px] uppercase tracking-[0.12em] text-neutral-500 transition hover:text-white"
              >
                View All Customers →
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            RECENT ORDERS AND LOW STOCK
        ================================================= */}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">

          {/* =================================================
              RECENT ORDERS
          ================================================= */}

          <div className="border border-[#292929] bg-[#1b1b1b] p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <h3 className="font-serif text-xl text-neutral-200">
                Recent Orders
              </h3>

              <span className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">
                Live Stream
              </span>

            </div>

            <div className="mt-5 overflow-x-auto">

              <table className="w-full min-w-[650px] text-left">

                <thead>

                  <tr className="border-b border-[#292929] text-[9px] uppercase tracking-[0.1em] text-neutral-600">

                    <th className="pb-3 font-normal">
                      Order ID
                    </th>

                    <th className="pb-3 font-normal">
                      Customer
                    </th>

                    <th className="pb-3 font-normal">
                      Amount
                    </th>

                    <th className="pb-3 font-normal">
                      Status
                    </th>

                    <th className="pb-3 text-right font-normal">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentOrders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-b border-[#252525] last:border-0"
                    >

                      <td className="py-4 text-xs text-neutral-500">
                        {order.id}
                      </td>

                      <td className="py-4 text-xs text-neutral-300">
                        {order.customer}
                      </td>

                      <td className="py-4 text-xs text-neutral-400">
                        {order.amount}
                      </td>

                      <td className="py-4">

                        <span
                          className={`inline-block px-2 py-1 text-[9px] ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                      </td>

                      <td className="py-4 text-right text-xs text-neutral-500">
                        {order.date}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="mt-5 text-[9px] uppercase tracking-[0.12em] text-neutral-500 transition hover:text-white"
            >
              View All Orders →
            </button>

          </div>

          {/* =================================================
              LOW STOCK
          ================================================= */}

          <div className="border border-[#292929] bg-[#1b1b1b] p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <h3 className="font-serif text-xl text-neutral-200">
                Low Stock Alert
              </h3>

              <span className="text-neutral-500">
                △
              </span>

            </div>

            <div className="mt-5 space-y-4">

              {lowStockProducts.map((item) => (

                <div
                  key={item.product}
                  className="flex items-center justify-between border-b border-[#252525] pb-4 last:border-0"
                >

                  <div>

                    <p className="text-xs text-neutral-300">
                      {item.product}
                    </p>

                    <p className="mt-1 text-[10px] text-neutral-600">
                      Current: {item.current}
                    </p>

                  </div>

                  <span
                    className={`px-2 py-1 text-[9px] ${getStatusClasses(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>

                </div>

              ))}

            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="mt-5 text-[9px] uppercase tracking-[0.12em] text-neutral-500 transition hover:text-white"
            >
              Restock Inventory →
            </button>

          </div>

        </section>

      </div>

    </div>
  );
};

export default AdminDashboard;