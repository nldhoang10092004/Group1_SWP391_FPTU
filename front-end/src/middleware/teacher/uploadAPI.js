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

/**
 * ✅ Upload file lên server (Cloudflare R2)
 * @param {File} file - File cần upload (image, video, document)
 * @param {string} type - Loại file: "video", "image", "document", "avatar"
 * @returns {Promise<{url: string, fileName: string, fileSize: number}>}
 */
export const uploadAsset = async (file, type) => {
  // ✅ Validate input
  if (!file) {
    throw new Error("File không được để trống");
  }

  if (!type) {
    throw new Error("Type không được để trống");
  }

  // ✅ Validate file size (max 500MB for video, 10MB for others)
  const maxSize = type === "video" ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(
      `File quá lớn! Kích thước tối đa: ${type === "video" ? "500MB" : "10MB"}`
    );
  }

  const formData = new FormData();
  formData.append("File", file);
  formData.append("Type", type);

  console.log("📤 Starting upload:", {
    fileName: file.name,
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    fileType: file.type,
    uploadType: type,
  });

  try {
    const res = await axios.post(API_BASE, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
      // ✅ Thêm timeout và progress tracking
      timeout: 5 * 60 * 1000, // 5 minutes for large videos
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`📊 Upload progress: ${percentCompleted}%`);
      },
    });

    console.log("✅ Upload response:", res.data);

    // ✅ Validate response
    if (!res.data) {
      throw new Error("Backend không trả về dữ liệu");
    }

    // ✅ Backend có thể trả về nhiều format khác nhau
    const result = {
      url: res.data.url || res.data.Url || res.data.URL || res.data.fileUrl,
      fileName: res.data.fileName || res.data.FileName || file.name,
      fileSize: res.data.fileSize || res.data.FileSize || file.size,
    };

    if (!result.url) {
      console.error("❌ Backend response thiếu URL:", res.data);
      throw new Error("Backend không trả về URL của file");
    }

    console.log("✅ Upload thành công:", result);
    return result;

  } catch (error) {
    console.error("❌ Upload failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // ✅ Parse error message từ backend
    if (error.response?.data) {
      const backendError =
        error.response.data.message ||
        error.response.data.Message ||
        error.response.data.error ||
        error.response.data.Error ||
        "Lỗi không xác định từ server";
      throw new Error(backendError);
    }

    // ✅ Network errors
    if (error.code === "ECONNABORTED") {
      throw new Error("Upload timeout - File quá lớn hoặc mạng chậm");
    }

    if (error.code === "ERR_NETWORK") {
      throw new Error("Không thể kết nối tới server");
    }

    throw error;
  }
};

/**
 * ✅ Delete file từ server (optional)
 * @param {string} fileUrl - URL của file cần xóa
 */
export const deleteAsset = async (fileUrl) => {
  try {
    const res = await axios.delete(`${API_BASE}`, {
      headers: getAuthHeaders(),
      data: { url: fileUrl },
    });
    console.log("✅ File deleted:", fileUrl);
    return res.data;
  } catch (error) {
    console.error("❌ Delete failed:", error);
    throw error;
  }
};