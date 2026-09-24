// import { useState } from "react";

// import {
//   useLocation,
//   useNavigate,
// } from "react-router-dom";

// import {
//   resetPassword,
// } from "../../services/authService";

// const ResetPassword = () => {
//   const navigate = useNavigate();

//   const location = useLocation();

//   const email =
//     location.state?.email;

//   const otp =
//     location.state?.otp;

//   const [
//     newPassword,
//     setNewPassword,
//   ] = useState("");

//   const [
//     confirmPassword,
//     setConfirmPassword,
//   ] = useState("");

//   const [error, setError] =
//     useState("");

//   const [loading, setLoading] =
//     useState(false);

//   // ==========================
//   // PROTECT PAGE
//   // ==========================

//   if (!email || !otp) {
//     navigate("/forgot-password");

//     return null;
//   }

//   // ==========================
//   // HANDLE SUBMIT
//   // ==========================

//   const handleSubmit = async (
//     event
//   ) => {
//     event.preventDefault();

//     setError("");

//     if (
//       newPassword.length < 6
//     ) {
//       setError(
//         "Password must be at least 6 characters"
//       );

//       return;
//     }

//     if (
//       newPassword !==
//       confirmPassword
//     ) {
//       setError(
//         "Passwords do not match"
//       );

//       return;
//     }

//     try {
//       setLoading(true);

//       await resetPassword(
//         email,
//         otp,
//         newPassword
//       );

//       alert(
//         "Password reset successfully. Please login."
//       );

//       navigate("/login");
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="
//       min-h-screen
//       bg-[#121212]
//       flex
//       items-center
//       justify-center
//       p-4
//       text-white
//     ">

//       <div className="
//         w-full
//         max-w-md
//         bg-[#202020]
//         border
//         border-[#303030]
//         rounded-lg
//         p-8
//         sm:p-10
//       ">

//         <h1 className="
//           text-3xl
//           font-serif
//           text-center
//           text-[#e7dfd3]
//           mb-4
//         ">
//           Create New Password
//         </h1>

//         <p className="
//           text-sm
//           text-gray-400
//           text-center
//           mb-8
//         ">
//           Create a strong password for your
//           UrbanThread account.
//         </p>

//         <form
//           onSubmit={handleSubmit}
//         >

//           {/* NEW PASSWORD */}

//           <div className="mb-5">

//             <label className="
//               block
//               text-xs
//               uppercase
//               text-gray-300
//               mb-3
//             ">
//               New Password
//             </label>

//             <input
//               type="password"
//               value={newPassword}
//               onChange={(event) =>
//                 setNewPassword(
//                   event.target.value
//                 )
//               }
//               placeholder="Enter new password"
//               className="
//                 w-full
//                 bg-[#171717]
//                 border
//                 border-[#3a3a3a]
//                 rounded
//                 px-4
//                 py-3
//                 text-white
//                 outline-none
//                 focus:border-[#cfc3b4]
//               "
//             />

//           </div>

//           {/* CONFIRM PASSWORD */}

//           <div className="mb-5">

//             <label className="
//               block
//               text-xs
//               uppercase
//               text-gray-300
//               mb-3
//             ">
//               Confirm Password
//             </label>

//             <input
//               type="password"
//               value={confirmPassword}
//               onChange={(event) =>
//                 setConfirmPassword(
//                   event.target.value
//                 )
//               }
//               placeholder="Confirm new password"
//               className="
//                 w-full
//                 bg-[#171717]
//                 border
//                 border-[#3a3a3a]
//                 rounded
//                 px-4
//                 py-3
//                 text-white
//                 outline-none
//                 focus:border-[#cfc3b4]
//               "
//             />

//           </div>

//           {error && (
//             <p className="
//               text-red-400
//               text-sm
//               mb-4
//             ">
//               {error}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="
//               w-full
//               bg-[#e7dfd3]
//               text-[#222]
//               py-3
//               text-xs
//               font-semibold
//               tracking-[0.2em]
//               hover:bg-white
//               transition
//               disabled:opacity-50
//             "
//           >
//             {loading
//               ? "RESETTING..."
//               : "RESET PASSWORD"}
//           </button>

//         </form>

//       </div>

//     </div>
//   );
// };

// export default ResetPassword;
