import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/admin/plans`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
};

// In the backend, Vouchers are called SubscriptionPlans.
// The UI uses the term "Voucher", so we'll stick with that for function names.

export const getAllVouchers = async () => {
  try {
    const res = await api.get("/", { headers: getAuthHeaders() });
    // Assuming the API returns all plans and we filter for vouchers on the client.
    // Or, if the backend has a specific endpoint, this should be changed.
    // For now, we assume all "plans" are "vouchers" in this context.
    return res.data?.data || [];
  } catch (err) {
    console.error("❌ getAllVouchers error:", err.response?.data || err.message);
    throw err;
  }
};

export const createVoucher = async (voucherData) => {
  try {
    // Mapping UI fields to the expected API model `SubscriptionPlan`
    const payload = {
      name: voucherData.code, // 'code' in UI is 'name' in API
      description: voucherData.description,
      price: 0, // Vouchers are typically for discounts, not direct purchase
      duration: 0, // Duration might not be applicable for vouchers
      type: voucherData.discountType, // 'percentage' or 'fixed_amount'
      discount: voucherData.discountValue,
      maxUses: voucherData.maxUses,
      expiredAt: voucherData.expiresAt,
    };
    const res = await api.post("/", payload, { headers: getAuthHeaders() });
    return res.data;
  } catch (err) {
    console.error("❌ createVoucher error:", err.response?.data || err.message);
    throw err;
  }
};

export const deleteVoucher = async (voucherId) => {
  try {
    const res = await api.delete(`/${voucherId}`, { headers: getAuthHeaders() });
    return res.data;
  } catch (err) {
    console.error("❌ deleteVoucher error:", err.response?.data || err.message);
    throw err;
  }
};
