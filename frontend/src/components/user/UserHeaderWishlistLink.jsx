// frontend/src/components/user/UserHeaderWishlistLink.jsx

import { Link } from "react-router-dom";

const UserHeaderWishlistLink = () => {
  return (
    <Link
      to="/wishlist"
      aria-label="Wishlist"
      title="Wishlist"
      className="relative transition hover:text-white/60"
    >
      ♡
    </Link>
  );
};

export default UserHeaderWishlistLink;
