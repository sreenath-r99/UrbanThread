import { Link } from "react-router-dom";

import heroImage from "../../assets/images/hero.jpg";

import shirtImage from "../../assets/images/Shirt.jpg";

import tshirtsImage from "../../assets/images/tshirts.jpg";

import jacketsImage from "../../assets/images/jackets.jpg";

import jeansImage from "../../assets/images/jeans.jpg";

import hoodiesImage from "../../assets/images/hoodies.jpg";

const Home = () => {
  // =====================================================
  // IMAGE CONFIGURATION
  // Change only these URLs when you want new images
  // =====================================================


  const categories = [
    {
      id: 1,
      name: "Shirts",
      subtitle: "The Foundation",
      image: shirtImage,
      className: "md:row-span-2",
    },

    {
      id: 2,
      name: "T-Shirts",
      subtitle: "",
      image: tshirtsImage,
      className: "",
    },

    {
      id: 3,
      name: "Jackets",
      subtitle: "",
      image: jacketsImage,
      className: "",
    },

    {
      id: 4,
      name: "Jeans",
      subtitle: "",
      image: jeansImage,
      className: "",
    },

    {
      id: 5,
      name: "Hoodies",
      subtitle: "",
      image: hoodiesImage,
      className: "",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090a0c] text-white">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0c0f]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 md:px-12">
          {/* LOGO */}

          <Link
            to="/"
            className="font-serif text-2xl font-semibold tracking-tight text-white md:text-3xl"
          >
            UrbanThread
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-10 text-sm text-white/80 md:flex">
            <Link
              to="/"
              className="border-b border-white pb-2 text-white"
            >
              Home
            </Link>

            <Link
              to="/shop"
              className="transition hover:text-white"
            >
              Shop
            </Link>

            <Link
              to="/categories"
              className="transition hover:text-white"
            >
              Categories
            </Link>
          </nav>

          {/* NAV ICONS */}

          <div className="flex items-center gap-5 text-lg text-white/90">
            <button
              type="button"
              aria-label="Search"
              className="transition hover:text-white/60"
            >
              ⌕
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              className="transition hover:text-white/60"
            >
              ♡
            </button>

            <button
              type="button"
              aria-label="Cart"
              className="relative transition hover:text-white/60"
            >
              🛒

              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] text-black">
                0
              </span>
            </button>

            <Link
              to="/login"
              aria-label="Profile"
              className="transition hover:text-white/60"
            >
              ◎
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative overflow-hidden">
        <div className="relative min-h-[650px] md:min-h-[760px]">
          {/* HERO IMAGE */}

          <img
            src={heroImage}
            alt="UrbanThread fashion collection"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* DARK OVERLAY */}

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />

          {/* HERO CONTENT */}

          <div className="relative z-10 mx-auto flex min-h-[650px] max-w-[1440px] items-center px-6 md:min-h-[760px] md:px-12">
            <div className="max-w-[600px]">
              <p className="mb-5 text-xs font-medium tracking-[0.35em] text-white/70">
                NEW COLLECTION
              </p>

              <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl">
                Elevate Your
                <br />
                Everyday Style
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-white/75 md:text-lg">
                Discover premium shirts designed for confidence,
                comfort, and effortless style.
              </p>

              <Link
                to="/shop"
                className="mt-8 inline-flex items-center gap-3 bg-white px-7 py-4 text-sm font-medium text-black transition hover:bg-white/80"
              >
                Shop Now
                <span>→</span>
              </Link>

              {/* SLIDER LINES */}

              <div className="mt-16 flex gap-3">
                <span className="h-[2px] w-8 bg-white" />

                <span className="h-[2px] w-8 bg-white/30" />

                <span className="h-[2px] w-8 bg-white/30" />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE NUMBERS */}

          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-5 text-sm text-white/60 md:flex">
            <span className="border-b border-white pb-2 text-white">
              01
            </span>

            <span>02</span>

            <span>03</span>
          </div>

          {/* RIGHT TEXT */}

          <div className="absolute bottom-12 right-12 hidden text-right md:block">
            <div className="mb-3 ml-auto h-px w-10 bg-white/40" />

            <p className="text-sm leading-6 text-white/70">
              Style
              <br />
              Lives Here
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          OFFER SECTION
      ===================================================== */}

      <section className="relative z-20 mx-auto -mt-10 max-w-[1320px] px-6 md:px-12">
        <div className="grid border border-white/10 bg-[#111216] md:grid-cols-[2fr_1.1fr]">
          {/* LEFT */}

          <div className="p-8 md:p-10">
            <h2 className="font-serif text-2xl text-white md:text-3xl">
              ₹300 OFF Your Next Purchase
            </h2>

            <p className="mt-3 text-sm text-white/60">
              A welcome back gift just for you. Valid on all premium styles.
            </p>

            <button
              type="button"
              className="mt-6 bg-white/10 px-6 py-3 text-xs tracking-[0.15em] text-white transition hover:bg-white hover:text-black"
            >
              WELCOME300
            </button>
          </div>

          {/* RIGHT */}

          <div className="border-t border-white/10 p-8 md:border-l md:border-t-0 md:p-10">
            <p className="font-serif text-2xl leading-8 text-white/70">
              Premium
              <br />
              Style. Better
              <br />
              Everyday.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CURATED CATEGORIES
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-6 py-20 md:px-12">
        {/* TITLE */}

        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-3xl text-white md:text-5xl">
            Curated Categories
          </h2>

          <Link
            to="/categories"
            className="text-xs tracking-[0.2em] text-white/70 transition hover:text-white"
          >
            VIEW ALL →
          </Link>
        </div>

        {/* CATEGORY GRID */}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* SHIRTS LARGE */}

          <CategoryCard
            category={categories[0]}
            large
          />

          {/* MIDDLE */}

          <div className="grid gap-4">
            <CategoryCard category={categories[1]} />

            <CategoryCard category={categories[3]} />
          </div>

          {/* RIGHT */}

          <div className="grid gap-4">
            <CategoryCard category={categories[2]} />

            <CategoryCard category={categories[4]} />
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="border-y border-white/10 bg-[#101114]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-12 md:grid-cols-2 md:px-12 lg:grid-cols-4">
          <Feature
            icon="▣"
            title="Free Shipping"
            description="On orders over ₹999"
          />

          <Feature
            icon="↻"
            title="Easy Returns"
            description="Hassle-free within 7 days"
          />

          <Feature
            icon="♢"
            title="Secure Payment"
            description="100% safe & encrypted"
          />

          <Feature
            icon="◉"
            title="24/7 Support"
            description="We're here to help"
          />
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#0b0c0f]">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-16 md:grid-cols-2 md:px-12 lg:grid-cols-4">
          {/* BRAND */}

          <div>
            <h2 className="font-serif text-3xl text-white">
              UrbanThread
            </h2>

            <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">
              Elevating everyday essentials through meticulous design and
              premium craftsmanship.
            </p>

            {/* SOCIAL ICONS */}

            <div className="mt-6 flex gap-5 text-sm text-white/70">
              <a
                href="#instagram"
                className="transition hover:text-white"
              >
                ◎
              </a>

              <a
                href="#facebook"
                className="transition hover:text-white"
              >
                f
              </a>

              <a
                href="#youtube"
                className="transition hover:text-white"
              >
                ▶
              </a>

              <a
                href="#pinterest"
                className="transition hover:text-white"
              >
                P
              </a>
            </div>
          </div>

          {/* EXPLORE */}

          <div>
            <h3 className="text-xs tracking-[0.2em] text-white/80">
              EXPLORE
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/about"
                className="text-sm text-white/50 transition hover:text-white"
              >
                About Us
              </Link>

              <Link
                to="/sustainability"
                className="text-sm text-white/50 transition hover:text-white"
              >
                Sustainability
              </Link>
            </div>
          </div>

          {/* SUPPORT */}

          <div>
            <h3 className="text-xs tracking-[0.2em] text-white/80">
              SUPPORT
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/shipping"
                className="text-sm text-white/50 transition hover:text-white"
              >
                Shipping
              </Link>

              <Link
                to="/returns"
                className="text-sm text-white/50 transition hover:text-white"
              >
                Returns
              </Link>
            </div>
          </div>

          {/* LEGAL */}

          <div>
            <h3 className="text-xs tracking-[0.2em] text-white/80">
              LEGAL
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/privacy-policy"
                className="text-sm text-white/50 transition hover:text-white"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="text-sm text-white/50 transition hover:text-white"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}

        <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
          © 2026 UrbanThread. All rights reserved.
        </div>
      </footer>
    </div>
  );
};


// =====================================================
// CATEGORY CARD COMPONENT
// =====================================================

const CategoryCard = ({ category, large = false }) => {
  return (
    <Link
      to={`/shop?category=${category.name.toLowerCase()}`}
      className={`group relative block overflow-hidden border border-white/10 ${
        large ? "min-h-[520px]" : "min-h-[250px]"
      }`}
    >
      {/* IMAGE */}

      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />

      {/* OVERLAY */}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

      {/* CONTENT */}

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
        <div>
          <h3
            className={`font-serif text-white ${
              large ? "text-3xl" : "text-xl"
            }`}
          >
            {category.name}
          </h3>

          {category.subtitle && (
            <p className="mt-1 text-sm text-white/70">
              {category.subtitle}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg text-white backdrop-blur transition group-hover:bg-white group-hover:text-black">
          →
        </div>
      </div>
    </Link>
  );
};


// =====================================================
// FEATURE COMPONENT
// =====================================================

const Feature = ({ icon, title, description }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center text-2xl text-white/80">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-medium text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs text-white/50">
          {description}
        </p>
      </div>
    </div>
  );
};


export default Home;