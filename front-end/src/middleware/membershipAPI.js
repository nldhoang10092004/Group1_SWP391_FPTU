// src/middleware/membershipAPI.js

const API_URL = process.env.REACT_APP_API_URL || 'https://beerier-superlogically-maxwell.ngrok-free.dev/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'

  };
};


export const checkMembership = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found");
      return { 
        hasMembership: false,
        error: "No authentication token" 
      };
    }

    const response = await fetch(`${API_URL}/user/membership/check`, {
      method: 'GET', 
      headers: getAuthHeaders()
    
    });

    if (!response.ok) {
      console.error("Failed to check membership:", response.status);
      return { 
        hasMembership: false,
        error: `HTTP ${response.status}` 
      };
    }

    const data = await response.json();
    
    return {
      hasMembership: data.hasMembership || false,
      planName: data.planName || null,
      status: data.status || null,
      startsAt: data.startsAt || null,
      endsAt: data.endsAt || null
    };
  } catch (error) {
    console.error("Error checking membership:", error);
    return { 
      hasMembership: false,
      error: error.message 
    };
  }
};

export const getMembershipPlans = async () => {
  try {
    const response = await fetch(`${API_URL}/public/plan`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTPS ${response.status}`);
    }

    const data = await response.json();
    return data.plans || [];
  } catch (error) {
    console.error("Error fetching membership plans:", error);
    return [];
  }
};


export const subscribeToPlan = async (planId) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(`${API_URL}/api/membership/subscribe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ planId })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error subscribing to plan:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cancel user's membership
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelMembership = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(`${API_URL}/api/membership/cancel`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error canceling membership:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

