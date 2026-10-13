
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/*
|--------------------------------------------------------------------------
| USER HEADERS
|--------------------------------------------------------------------------
*/

const userHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

/*
|--------------------------------------------------------------------------
| ADMIN HEADERS
|--------------------------------------------------------------------------
*/

const adminHeaders = (adminToken) => ({
  Authorization: `Bearer ${adminToken}`,
});

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

export const createOrder = async (
  addressId,
  token,
  couponCode = "",
) => {
  const response = await API.post(
    "/orders",
    {
      addressId,
      couponCode,
    },
    {
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET USER ORDERS
|--------------------------------------------------------------------------
*/

export const getOrders = async (
  token,
  search = "",
) => {
  const response = await API.get(
    "/orders",
    {
      params: {
        search,
      },
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE USER ORDER
|--------------------------------------------------------------------------
*/

export const getOrder = async (
  orderId,
  token,
) => {
  const response = await API.get(
    `/orders/${orderId}`,
    {
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DOWNLOAD ORDER INVOICE
|--------------------------------------------------------------------------
|
| GET /api/orders/:orderId/invoice
|
| Backend returns a PDF file.
|--------------------------------------------------------------------------
*/

export const downloadOrderInvoice = async (
  orderId,
  token,
) => {
  const response = await API.get(
    `/orders/${orderId}/invoice`,
    {
      headers: userHeaders(token),
      responseType: "blob",
    },
  );

  const blob = new Blob(
    [response.data],
    {
      type: "application/pdf",
    },
  );

  const downloadUrl =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = downloadUrl;

  link.download = `UrbanThread-Invoice-${orderId}.pdf`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(
    downloadUrl,
  );

  return true;
};

/*
|--------------------------------------------------------------------------
| CANCEL USER ORDER
|--------------------------------------------------------------------------
*/

export const cancelOrder = async (
  orderId,
  reason = "",
  token,
) => {
  const response = await API.patch(
    `/orders/${orderId}/cancel`,
    {
      reason,
    },
    {
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CANCEL ORDER ITEM
|--------------------------------------------------------------------------
*/

export const cancelOrderItem = async (
  orderId,
  itemId,
  reason = "",
  token,
) => {
  const response = await API.patch(
    `/orders/${orderId}/items/${itemId}/cancel`,
    {
      reason,
    },
    {
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| RETURN ORDER ITEM
|--------------------------------------------------------------------------
|
| Customer submits a return request for a delivered item.
|
| POST
| /api/orders/:orderId/items/:itemId/return
|
| Body:
|
| {
|   reason: "Wrong size received"
| }
|
| Backend changes:
|
| returnStatus
|     Not Requested
|          ↓
|      Requested
|--------------------------------------------------------------------------
*/

export const returnOrderItem = async (
  orderId,
  itemId,
  reason = "",
  token,
) => {
  const response = await API.post(
    `/orders/${orderId}/items/${itemId}/return`,
    {
      reason,
    },
    {
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET ADMIN ORDERS
|--------------------------------------------------------------------------
*/

export const getAdminOrders = async (
  adminToken,
  filters = {},
) => {
  const response = await API.get(
    "/admin/orders",
    {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        search: filters.search || "",
        status: filters.status || "",
        sortOrder:
          filters.sortOrder || "desc",
      },
      headers: adminHeaders(adminToken),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE ADMIN ORDER
|--------------------------------------------------------------------------
*/

export const getAdminOrder = async (
  orderId,
  adminToken,
) => {
  const response = await API.get(
    `/admin/orders/${orderId}`,
    {
      headers: adminHeaders(adminToken),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE ADMIN ORDER STATUS
|--------------------------------------------------------------------------
*/

export const updateAdminOrderStatus = async (
  orderId,
  status,
  adminToken,
  cancellationReason = "",
) => {
  const response = await API.patch(
    `/admin/orders/${orderId}/status`,
    {
      status,
      reason: cancellationReason,
    },
    {
      headers: adminHeaders(adminToken),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE ADMIN ORDER ITEM RETURN STATUS
|--------------------------------------------------------------------------
|
| Admin can:
|
| Requested
|     ↓
| Approved
|
| Requested
|     ↓
| Rejected
|
| PATCH
| /api/admin/orders/:orderId/items/:itemId/return
|
| Body:
|
| {
|   status: "Approved"
| }
|
| or
|
| {
|   status: "Rejected"
| }
|--------------------------------------------------------------------------
*/

export const updateAdminOrderItemReturn = async (
  orderId,
  itemId,
  status,
  adminToken,
) => {
  const response = await API.patch(
    `/admin/orders/${orderId}/items/${itemId}/return`,
    {
      status,
    },
    {
      headers: adminHeaders(adminToken),
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default {
  createOrder,
  getOrders,
  getOrder,
  downloadOrderInvoice,
  cancelOrder,
  cancelOrderItem,
  returnOrderItem,
  getAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
  updateAdminOrderItemReturn,
};