// videoWatchHelper.js
// Helper để lưu lịch sử xem video vào localStorage (PHÂN BIỆT THEO USER)

/**
 * Lấy key localStorage theo user (FIX: Mỗi user có lịch sử riêng)
 */
const getUserHistoryKey = () => {
  const userId = localStorage.getItem("userID");
  return userId ? `videoWatchHistory_${userId}` : "videoWatchHistory";
};

/**
 * Cập nhật lịch sử xem video
 * @param {Object} videoData - Thông tin video
 * @param {number} currentTime - Thời điểm hiện tại (giây)
 * @param {number} duration - Tổng thời lượng video (giây)
 */
export const updateVideoHistory = (videoData, currentTime = 0, duration = 0) => {
  try {
    // Validate inputs
    if (!videoData || !videoData.lessonID || !videoData.courseID) {
      console.error("❌ Invalid videoData:", videoData);
      return null;
    }

    // CRITICAL: Log inputs để debug
    console.log("📥 updateVideoHistory called with:", {
      videoData,
      currentTime,
      duration,
      currentTimeType: typeof currentTime,
      durationType: typeof duration
    });

    if (duration <= 0) {
      console.error("⚠️ Invalid duration:", duration);
      return null;
    }

    // ✅ FIX: Dùng key theo user
    const historyKey = getUserHistoryKey();
    const historyStr = localStorage.getItem(historyKey);
    let history = historyStr ? JSON.parse(historyStr) : [];

    // Ensure array
    if (!Array.isArray(history)) {
      history = [];
    }

    // Convert seconds to minutes (rounded)
    const durationMinutes = Math.round(duration / 60);
    const currentTimeMinutes = Math.round(currentTime / 60);

    // Calculate progress percentage
    const progressPercent = Math.round((currentTime / duration) * 100);
    
    // Mark as complete if >= 95% watched
    const finalProgress = progressPercent >= 95 ? 100 : Math.min(progressPercent, 100);
    const finalWatchedMinutes = finalProgress >= 100 ? durationMinutes : currentTimeMinutes;

    console.log("📹 Calculated values:", {
      currentTime: `${currentTime.toFixed(2)}s`,
      duration: `${duration.toFixed(2)}s`,
      durationMinutes: `${durationMinutes}m`,
      currentTimeMinutes: `${currentTimeMinutes}m`,
      watchedMinutes: `${finalWatchedMinutes}m`,
      progress: `${finalProgress}%`
    });

    // Tìm video trong lịch sử
    const existingIndex = history.findIndex(
      item => item.courseID === videoData.courseID && 
              (item.lessonID === videoData.lessonID || item.id === videoData.lessonID)
    );

    const videoEntry = {
      id: `${videoData.courseID}-${videoData.lessonID}`,
      courseID: videoData.courseID,
      courseName: videoData.courseName || "Course",
      lessonID: videoData.lessonID,
      lessonTitle: videoData.lessonTitle || videoData.title || "Video",
      duration: durationMinutes, // Tổng thời lượng (phút)
      currentTime: currentTime, // Thời điểm hiện tại (giây) - để resume
      watchedMinutes: finalWatchedMinutes, // Thời gian đã xem (phút)
      progress: finalProgress, // 0-100%
      lastWatched: new Date().toISOString()
    };

    console.log("💾 Saving video entry:", videoEntry);

    if (existingIndex >= 0) {
      const existing = history[existingIndex];
      
      // Only update if:
      // 1. New progress is higher, OR
      // 2. Progress reaches completion (>= 95%)
      if (finalProgress > existing.progress || finalProgress >= 100) {
        history[existingIndex] = {
          ...existing,
          ...videoEntry,
          // Ensure watched minutes never exceeds duration
          watchedMinutes: Math.min(finalWatchedMinutes, durationMinutes)
        };
        console.log("✅ Updated existing entry - Progress:", `${existing.progress}% → ${finalProgress}%`);
      } else {
        // Just update lastWatched time
        history[existingIndex].lastWatched = new Date().toISOString();
        console.log("ℹ️ Updated lastWatched only (progress same or lower)");
      }
    } else {
      // Add new video to history
      history.unshift(videoEntry);
      console.log("✅ Added new video to history");
    }

    // Giới hạn 100 video gần nhất
    if (history.length > 100) {
      history.length = 100;
    }

    // ✅ FIX: Lưu với key theo user
    localStorage.setItem(historyKey, JSON.stringify(history));
    
    return videoEntry;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật lịch sử:', error);
    return null;
  }
};

/**
 * Lưu lịch sử video (alias cho updateVideoHistory)
 */
export const saveVideoHistory = (videoData, currentTime, duration) => {
  return updateVideoHistory(videoData, currentTime, duration);
};

/**
 * Lấy toàn bộ lịch sử xem video
 */
export const getVideoHistory = () => {
  try {
    const historyKey = getUserHistoryKey(); // ✅ FIX
    const historyStr = localStorage.getItem(historyKey);
    if (!historyStr) return [];
    
    const history = JSON.parse(historyStr);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('❌ Lỗi khi đọc lịch sử:', error);
    return [];
  }
};

/**
 * Lấy tiến độ của một video cụ thể
 */
export const getVideoProgress = (lessonID) => {
  try {
    const history = getVideoHistory();
    
    const entry = history.find(
      (item) => item.lessonID === lessonID || item.id === lessonID
    );

    if (entry) {
      console.log("📊 Found video progress:", {
        lessonID,
        progress: entry.progress,
        watchedMinutes: entry.watchedMinutes,
        duration: entry.duration
      });
    }

    return entry || null;
  } catch (error) {
    console.error("❌ Error getting video progress:", error);
    return null;
  }
};

/**
 * Đánh dấu video đã hoàn thành (100%)
 */
export const markVideoAsCompleted = (lessonID) => {
  try {
    const history = getVideoHistory();
    const existingIndex = history.findIndex(
      (item) => item.lessonID === lessonID || item.id === lessonID
    );

    if (existingIndex !== -1) {
      const entry = history[existingIndex];
      history[existingIndex] = {
        ...entry,
        progress: 100,
        watchedMinutes: entry.duration, // Set watched = total duration
        lastWatched: new Date().toISOString(),
      };

      const historyKey = getUserHistoryKey(); // ✅ FIX
      localStorage.setItem(historyKey, JSON.stringify(history));
      console.log("✅ Marked video as completed:", lessonID);
      return true;
    } else {
      console.warn("⚠️ Video not found in history:", lessonID);
      return false;
    }
  } catch (error) {
    console.error("❌ Error marking video as completed:", error);
    return false;
  }
};

/**
 * Xóa toàn bộ lịch sử xem video
 */
export const clearVideoHistory = () => {
  try {
    const historyKey = getUserHistoryKey(); // ✅ FIX
    localStorage.removeItem(historyKey);
    console.log('✅ Đã xóa toàn bộ lịch sử xem video');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi xóa lịch sử:', error);
    return false;
  }
};

/**
 * Xóa một video khỏi lịch sử
 */
export const removeVideoFromHistory = (courseID, lessonID) => {
  try {
    const history = getVideoHistory();
    const newHistory = history.filter(
      item => !(item.courseID === courseID && 
                (item.lessonID === lessonID || item.id === lessonID))
    );
    
    const historyKey = getUserHistoryKey(); // ✅ FIX
    localStorage.setItem(historyKey, JSON.stringify(newHistory));
    console.log('✅ Đã xóa video khỏi lịch sử');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi xóa video:', error);
    return false;
  }
};

/**
 * Clean và validate dữ liệu lịch sử (fix corrupt data)
 */
export const cleanVideoHistoryData = () => {
  try {
    const history = getVideoHistory();
    
    if (history.length === 0) return [];

    // Clean and validate each entry
    const cleanedHistory = history.map(entry => {
      // Ensure all values are valid numbers
      const duration = Math.max(0, Math.round(Number(entry.duration) || 0));
      const watchedMinutes = Math.max(0, Math.round(Number(entry.watchedMinutes) || 0));
      const progress = Math.max(0, Math.min(100, Math.round(Number(entry.progress) || 0)));

      // Fix: Can't watch more than duration
      const finalWatchedMinutes = Math.min(watchedMinutes, duration);
      
      // Fix: If progress >= 95%, mark as 100% complete
      const finalProgress = progress >= 95 ? 100 : progress;

      return {
        ...entry,
        duration: duration,
        watchedMinutes: finalProgress >= 100 ? duration : finalWatchedMinutes,
        progress: finalProgress,
      };
    });

    // Save cleaned data
    const historyKey = getUserHistoryKey(); // ✅ FIX
    localStorage.setItem(historyKey, JSON.stringify(cleanedHistory));
    console.log("✅ Cleaned video history data:", {
      total: cleanedHistory.length,
      completed: cleanedHistory.filter(v => v.progress >= 100).length
    });

    return cleanedHistory;
  } catch (error) {
    console.error("❌ Error cleaning video history:", error);
    return [];
  }
};

export default {
  updateVideoHistory,
  saveVideoHistory,
  getVideoHistory,
  getVideoProgress,
  markVideoAsCompleted,
  clearVideoHistory,
  removeVideoFromHistory,
  cleanVideoHistoryData
};