import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import heroImage from "../../assets/images/hero.jpg";

import shirtImage from "../../assets/images/Shirt.jpg";
import tshirtImage from "../../assets/images/tshirts.jpg";
import jacketImage from "../../assets/images/jackets.jpg";
import jeansImage from "../../assets/images/jeans.jpg";
import hoodieImage from "../../assets/images/hoodies.jpg";

const Home = ({ isLandingPage = false }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  /*
   * Do not treat a stored token alone as a valid session.
   * AuthContext validates the token through the profile API.
   */
  const isLoggedIn = !loading && !!user;

  /*
   * All shopping-related pages are protected.
   * Logged-out users are sent to Login.
   */
  const handleProtectedNavigation = (path) => {
    if (loading) {
      return;
    }

    // Every shopping action from the public landing page
    // must first send the visitor to the login page.
    if (isLandingPage) {
      navigate("/login");
      return;
    }

    // Shopping actions from authenticated home require a valid session.
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* =========================
    NAVBAR
========================= */}

      <header className="absolute left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 md:px-10 lg:px-16">
          {/* LOGO */}

          <Link
            to={isLandingPage ? "/" : "/home"}
            className="font-serif text-xl tracking-[0.18em] text-[#e8e3dc] transition hover:text-white"
          >
            URBAN THREAD
          </Link>

          {/* NAVIGATION LINKS */}

          <nav className="hidden items-center gap-10 md:flex">
            {/* HOME */}

            <Link
              to={isLandingPage ? "/" : "/home"}
              className="text-[11px] uppercase tracking-[0.2em] text-white/80 transition hover:text-white"
            >
              Home
            </Link>

            {/* SHOP */}

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/shop")}
              className="text-[11px] uppercase tracking-[0.2em] text-white/80 transition hover:text-white"
            >
              Shop
            </button>

            {/* CATEGORIES */}

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/categories")}
              className="text-[11px] uppercase tracking-[0.2em] text-white/80 transition hover:text-white"
            >
              Categories
            </button>
          </nav>

          {/* RIGHT NAVBAR ACTIONS */}

          {isLandingPage ? (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="border border-white/50 px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-5 text-lg text-white/90">
              {/* SEARCH */}

              <button
                type="button"
                aria-label="Search"
                title="Search"
                onClick={() => handleProtectedNavigation("/shop")}
                className="transition hover:text-white/60"
              >
                ⌕
              </button>

              {/* WISHLIST */}

              <Link
                to="/wishlist"
                aria-label="Wishlist"
                title="Wishlist"
                className="transition hover:text-white/60"
              >
                ♡
              </Link>

              {/* CART */}

              <Link
                to="/cart"
                aria-label="Cart"
                title="Cart"
                className="relative transition hover:text-white/60"
              >
                🛒
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] text-black">
                  0
                </span>
              </Link>

              {/* PROFILE */}

              <Link
                to="/profile"
                aria-label="Profile"
                title="Profile"
                className="transition hover:text-white/60"
              >
                ◎
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="relative flex min-h-screen items-center overflow-hidden">
        <img
          src={heroImage}
          alt="Urban Thread fashion collection"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20" />

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pt-20 md:px-10 lg:px-16">
          <div className="max-w-2xl">
            <p className="mb-6 text-[11px] uppercase tracking-[0.35em] text-white/70">
              Modern essentials
            </p>

            <h1 className="font-serif text-5xl leading-[1.05] text-[#f0ece6] sm:text-6xl md:text-7xl lg:text-8xl">
              Define your
              <br />
              everyday style.
            </h1>

            <p className="mt-7 max-w-md text-sm leading-7 text-white/65 md:text-base">
              Discover carefully selected clothing designed for confidence,
              comfort, and effortless everyday expression.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/shop")}
                className="border border-white bg-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white"
              >
                Shop Now
              </button>

              <button
                type="button"
                onClick={() => handleProtectedNavigation("/categories")}
                className="border border-white/40 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                Explore Categories
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-6 z-10 flex items-center gap-4 md:left-10 lg:left-16">
          <span className="h-px w-12 bg-white/50" />

          <span className="text-[10px] uppercase tracking-[0.25em] text-white/60">
            Scroll to explore
          </span>
        </div>
      </section>

      {/* =========================
          INTRODUCTION SECTION
      ========================= */}

      <section className="border-b border-white/10 bg-[#151515] px-6 py-24 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1500px] gap-12 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/45">
              The Urban Thread philosophy
            </p>

            <h2 className="max-w-xl font-serif text-4xl leading-tight text-[#e8e3dc] md:text-5xl">
              Clothing that feels
              <br />
              distinctly yours.
            </h2>
          </div>

          <div>
            <p className="max-w-lg text-sm leading-8 text-white/55">
              Urban Thread brings together timeless silhouettes, modern details,
              and versatile pieces made for the rhythm of everyday life. Our
              collections are designed to help you build a wardrobe that feels
              personal, refined, and effortless.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          OFFER SECTION
      ========================= */}

      <section className="border-b border-white/10 bg-[#111111] px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1500px] flex-col items-start justify-between gap-8 border border-white/10 bg-[#1a1a1a] p-8 md:flex-row md:items-center md:p-12">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-white/45">
              Welcome offer
            </p>

            <h2 className="font-serif text-3xl text-[#e8e3dc] md:text-4xl">
              Find your next everyday essential.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
              Explore our latest collection and discover pieces that work across
              every season.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleProtectedNavigation("/shop")}
            className="shrink-0 border border-white/40 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white hover:text-black"
          >
            View Collection
          </button>
        </div>
      </section>

      {/* =========================
          CATEGORY SECTION
      ========================= */}

      <section className="bg-[#151515] px-6 py-24 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-white/45">
                Shop by category
              </p>

              <h2 className="font-serif text-4xl text-[#e8e3dc] md:text-5xl">
                Explore the collection
              </h2>
            </div>

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/categories")}
              className="w-fit border-b border-white/40 pb-2 text-[11px] uppercase tracking-[0.2em] text-white/65 transition hover:border-white hover:text-white"
            >
              View all categories
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {/* SHIRTS */}

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/categories/shirts")}
              className="group text-left"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#222222]">
                <img
                  src={shirtImage}
                  alt="Shirts"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/5" />
              </div>

              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/70 transition group-hover:text-white">
                Shirts
              </p>
            </button>

            {/* T-SHIRTS */}

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/categories/t-shirts")}
              className="group text-left"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#222222]">
                <img
                  src={tshirtImage}
                  alt="T-Shirts"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/5" />
              </div>

              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/70 transition group-hover:text-white">
                T-Shirts
              </p>
            </button>

            {/* JACKETS */}

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/categories/jackets")}
              className="group text-left"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#222222]">
                <img
                  src={jacketImage}
                  alt="Jackets"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/5" />
              </div>

              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/70 transition group-hover:text-white">
                Jackets
              </p>
            </button>

            {/* JEANS */}

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/categories/jeans")}
              className="group text-left"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#222222]">
                <img
                  src={jeansImage}
                  alt="Jeans"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/5" />
              </div>

              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/70 transition group-hover:text-white">
                Jeans
              </p>
            </button>

            {/* HOODIES */}

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/categories/hoodies")}
              className="group col-span-2 text-left md:col-span-1"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#222222]">
                <img
                  src={hoodieImage}
                  alt="Hoodies"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/5" />
              </div>

              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/70 transition group-hover:text-white">
                Hoodies
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          FEATURES SECTION
      ========================= */}

      <section className="border-t border-white/10 bg-[#111111] px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-3">
          <div className="border-t border-white/15 pt-6">
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/70">
              Curated quality
            </p>

            <p className="text-sm leading-7 text-white/45">
              Thoughtfully selected pieces that balance quality, comfort, and
              modern design.
            </p>
          </div>

          <div className="border-t border-white/15 pt-6">
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/70">
              Everyday versatility
            </p>

            <p className="text-sm leading-7 text-white/45">
              Build outfits that move naturally from casual days to special
              occasions.
            </p>
          </div>

          <div className="border-t border-white/15 pt-6">
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/70">
              Secure experience
            </p>

            <p className="text-sm leading-7 text-white/45">
              Enjoy a simple shopping experience with protected accounts and
              reliable order management.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="border-t border-white/10 bg-[#0d0d0d] px-6 py-10 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 md:flex-row md:items-center">
          <Link
            to="/"
            className="font-serif text-lg tracking-[0.15em] text-[#e8e3dc]"
          >
            URBAN THREAD
          </Link>

          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            © {new Date().getFullYear()} Urban Thread. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
