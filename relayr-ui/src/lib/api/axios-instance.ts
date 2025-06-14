// External Libraries
import axios from "axios";

// Constants
import { HTTP_API_URL } from "../constants";

// Create Axios Instance with default configuration
const apiClient = axios.create({
  baseURL: HTTP_API_URL, // Set the base URL for all requests
  headers: {
    "Content-Type": "application/json", // Set default content type for all requests
  },
  timeout: 10000, // Set the timeout for requests (10 seconds)
});

// Response Interceptor: handles responses globally
apiClient.interceptors.response.use(
  (response) => response, // Return the response as it is
  (error) => {
    return Promise.reject(error); // Reject the error if any
  },
);

// Uncomment the following block to add request and response interceptors for auth and error handling
/*
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");  // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token in headers if present
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Reject the error if any
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle Unauthorized Error (e.g., redirect to login page)
    }
    return Promise.reject(error); // Reject the error if any
  }
);
*/

// Export the apiClient instance for use in other parts of the application
export default apiClient;
