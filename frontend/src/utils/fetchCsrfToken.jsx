const API_URL = import.meta.env.VITE_API_URL;

const fetchCsrfToken = async () => {
  try {
    const response = await fetch(`${API_URL}/api/csrf/get/`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch CSRF token");
    }

    console.log("CSRF token fetched and set in cookie");
    return true;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return false;
  }
};

export default fetchCsrfToken;