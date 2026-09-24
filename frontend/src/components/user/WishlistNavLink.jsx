// frontend/src/components/user/WishlistNavLink.jsx

import { Link } from "react-router-dom";

const WishlistNavLink = () => {
  return (
    <Link to="/wishlist" className="transition hover:text-white">
      Wishlist
    </Link>
  );
};

export default WishlistNavLink;
