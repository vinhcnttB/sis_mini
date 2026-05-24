import axios from "axios";
const getToken = () => JSON.parse(localStorage.getItem("token"));

export const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3334";

export const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${getToken()}`,
    post: {
      "Content-Type": "application/json",
    },
    put: {
      "Content-Type": "application/json",
    },
  },
});

// axios.interceptors.request.use(
//   (request) => {
//     console.log(request);
//     // Edit request config
//     return request;
//   },
//   (error) => {
//     console.log(error);
//     return Promise.reject(error);
//   }
// );

// axios.interceptors.response.use(
//   (response) => {
//     console.log(response);
//     // Edit response config
//     return response;
//   },
//   (error) => {
//     console.log(error);
//     return Promise.reject(error);
//   }
// );

const InterceptorsRequest = async (config) => {
  // lấy token từ cookie và gắn vào header trước khi gửi request
  const token = getToken();
  if (token === undefined || token === null) {
    return config;
  }

  const interceptorHeaders = {
    token: `Bearer ${token}`,
    authorization: `Bearer ${token}`,
  };

  const headers = {
    ...config.headers,
    ...interceptorHeaders,
  };

  config.headers = headers;
  return config;
};

const InterceptorsError = (error) => {
  return Promise.reject(error);
};

const InterceptorResponse = (response) => {
  if (response && response.data) {
    return response;
  }
  return response;
};

axiosInstance.interceptors.request.use(InterceptorsRequest, InterceptorsError);
axiosInstance.interceptors.response.use(InterceptorResponse, InterceptorsError);
