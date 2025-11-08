import axios from "axios";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/upload/asset`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
};


export const uploadAsset = async (file, type) => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("Type", type);

  try {
    const res = await axios.post(API_BASE, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data; // ⚠️ Backend trả về { url: "https://..." }
  } catch (error) {
    console.error("❌ Lỗi upload asset:", error);
    throw error;
  }
};
