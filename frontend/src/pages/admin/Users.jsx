import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getUsers,
  blockUser,
  unblockUser,
} from "../../services/admin/adminUserService";

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

const Users = () => {
  /*
  |--------------------------------------------------------------------------
  | USERS
  |--------------------------------------------------------------------------
  */

  const [users, setUsers] =
    useState([]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      totalPages: 1,
      totalUsers: 0,
      limit: 10,
    });

  /*
  |--------------------------------------------------------------------------
  | UI STATES
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH USERS
  |--------------------------------------------------------------------------
  */

  const fetchUsers =
    useCallback(
      async (
        searchValue = search,
        pageValue = page
      ) => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getUsers({
              search:
                searchValue.trim(),
              page: pageValue,
              limit: 10,
            });

          setUsers(
            Array.isArray(
              response?.users
            )
              ? response.users
              : []
          );

          setPagination(
            response?.pagination || {
              currentPage:
                pageValue,
              totalPages: 1,
              totalUsers: 0,
              limit: 10,
            }
          );
        } catch (err) {
          console.error(
            "FETCH USERS ERROR:",
            err
          );

          setUsers([]);

          setError(
            err?.response?.data
              ?.message ||
              "Failed to load users"
          );
        } finally {
          setLoading(false);
        }
      },
      [search, page]
    );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD / SEARCH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        void fetchUsers(
          search,
          page
        );
      }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [
    search,
    page,
    fetchUsers,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH CHANGE
  |--------------------------------------------------------------------------
  */

  const handleSearchChange =
    (event) => {
      setSearch(
        event.target.value
      );

      setPage(1);
    };

  /*
  |--------------------------------------------------------------------------
  | CLEAR SEARCH
  |--------------------------------------------------------------------------
  */

  const handleClearSearch =
    () => {
      setSearch("");
      setPage(1);
      setSuccess("");
      setError("");
    };

  /*
  |--------------------------------------------------------------------------
  | BLOCK USER
  |--------------------------------------------------------------------------
  */

  const handleBlockUser =
    async (user) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to block "${user.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          user._id
        );

        setError("");
        setSuccess("");

        await blockUser(
          user._id
        );

        setSuccess(
          `${user.name} has been blocked successfully.`
        );

        await fetchUsers(
          search,
          page
        );
      } catch (err) {
        console.error(
          "BLOCK USER ERROR:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to block user"
        );
      } finally {
        setActionLoading("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | UNBLOCK USER
  |--------------------------------------------------------------------------
  */

  const handleUnblockUser =
    async (user) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to unblock "${user.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          user._id
        );

        setError("");
        setSuccess("");

        await unblockUser(
          user._id
        );

        setSuccess(
          `${user.name} has been unblocked successfully.`
        );

        await fetchUsers(
          search,
          page
        );
      } catch (err) {
        console.error(
          "UNBLOCK USER ERROR:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to unblock user"
        );
      } finally {
        setActionLoading("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | PREVIOUS PAGE
  |--------------------------------------------------------------------------
  */

  const handlePreviousPage =
    () => {
      if (
        pagination.currentPage >
        1
      ) {
        setPage(
          (previousPage) =>
            previousPage - 1
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | NEXT PAGE
  |--------------------------------------------------------------------------
  */

  const handleNextPage =
    () => {
      if (
        pagination.currentPage <
        pagination.totalPages
      ) {
        setPage(
          (previousPage) =>
            previousPage + 1
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate =
    (date) => {
      if (!date) {
        return "—";
      }

      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    };

  /*
  |--------------------------------------------------------------------------
  | INITIALS
  |--------------------------------------------------------------------------
  */

  const getInitials =
    (name) => {
      if (!name) {
        return "U";
      }

      return name
        .split(" ")
        .filter(Boolean)
        .map(
          (word) =>
            word.charAt(0)
        )
        .join("")
        .slice(0, 2)
        .toUpperCase();
    };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#111111] text-white p-6 md:p-8">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-gray-500">
            Account Management
          </p>

          <h1 className="text-3xl font-semibold">
            Users
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage registered UrbanThread users.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#181818] px-4 py-3">

          <p className="text-xs text-gray-500">
            Total Users
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            {
              pagination.totalUsers
            }
          </p>

        </div>

      </div>

      {/* SUCCESS */}

      {success && (
        <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* SEARCH */}

      <div className="mb-6 rounded-xl border border-white/10 bg-[#181818] p-4">

        <div className="flex flex-col gap-3 md:flex-row">

          <div className="relative flex-1">

            <input
              type="text"
              value={search}
              onChange={
                handleSearchChange
              }
              placeholder="Search users by name or email..."
              className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-white/30"
            />

          </div>

          {search && (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              className="rounded-lg border border-white/10 px-5 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              Clear
            </button>
          )}

        </div>

        {search && (
          <p className="mt-3 text-xs text-gray-600">
            Searching the backend for:{" "}
            <span className="text-gray-400">
              "{search}"
            </span>
          </p>
        )}

      </div>

      {/* USER TABLE */}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#181818]">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-left">

            <thead className="border-b border-white/10">

              <tr className="text-xs uppercase tracking-wider text-gray-500">

                <th className="px-5 py-4">
                  #
                </th>

                <th className="px-5 py-4">
                  User
                </th>

                <th className="px-5 py-4">
                  Email
                </th>

                <th className="px-5 py-4">
                  Verification
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4">
                  Joined
                </th>

                <th className="px-5 py-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-white/5">

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-14 text-center text-sm text-gray-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-14 text-center"
                  >

                    <p className="text-sm text-gray-500">
                      {search
                        ? `No users found for "${search}".`
                        : "No users found."}
                    </p>

                    {search && (
                      <button
                        type="button"
                        onClick={
                          handleClearSearch
                        }
                        className="mt-3 text-sm text-gray-400 underline underline-offset-4 hover:text-white"
                      >
                        Clear search
                      </button>
                    )}

                  </td>
                </tr>
              ) : (
                users.map(
                  (
                    user,
                    index
                  ) => (
                    <tr
                      key={
                        user._id
                      }
                      className="transition hover:bg-white/[0.02]"
                    >

                      {/* NUMBER */}

                      <td className="px-5 py-5 text-sm text-gray-600">

                        {(
                          pagination.currentPage -
                          1
                        ) *
                          pagination.limit +
                          index +
                          1}

                      </td>

                      {/* USER */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#252525] text-xs font-medium text-gray-300">

                            {getInitials(
                              user.name
                            )}

                          </div>

                          <div>

                            <p className="text-sm font-medium text-white">
                              {
                                user.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              User
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-5 text-sm text-gray-400">
                        {
                          user.email
                        }
                      </td>

                      {/* VERIFICATION */}

                      <td className="px-5 py-5">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.isVerified
                              ? "bg-green-500/10 text-green-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {user.isVerified
                            ? "Verified"
                            : "Unverified"}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.isBlocked
                              ? "bg-red-500/10 text-red-400"
                              : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {user.isBlocked
                            ? "Blocked"
                            : "Active"}
                        </span>

                      </td>

                      {/* DATE */}

                      <td className="px-5 py-5 text-sm text-gray-500">
                        {formatDate(
                          user.createdAt
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-5">

                        <div className="flex justify-end">

                          {user.isBlocked ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleUnblockUser(
                                  user
                                )
                              }
                              disabled={
                                actionLoading ===
                                user._id
                              }
                              className="rounded-md border border-green-500/20 px-3 py-2 text-xs text-green-400 transition hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading ===
                              user._id
                                ? "..."
                                : "Unblock"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleBlockUser(
                                  user
                                )
                              }
                              disabled={
                                actionLoading ===
                                user._id
                              }
                              className="rounded-md border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading ===
                              user._id
                                ? "..."
                                : "Block"}
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* PAGINATION */}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-gray-500">

          Page{" "}
          <span className="text-gray-300">
            {
              pagination.currentPage
            }
          </span>{" "}
          of{" "}
          <span className="text-gray-300">
            {
              pagination.totalPages
            }
          </span>

        </p>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={
              handlePreviousPage
            }
            disabled={
              pagination.currentPage <=
                1 ||
              loading
            }
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={
              handleNextPage
            }
            disabled={
              pagination.currentPage >=
                pagination.totalPages ||
              loading
            }
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
};

export default Users;