// BookLogo.js
// SVG logo: open book, simple and modern
import React from "react";

const BookLogo = ({ size = 40, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <rect width="64" height="64" rx="12" fill="#fff"/>
    <path d="M12 16C12 14.8954 12.8954 14 14 14H50C51.1046 14 52 14.8954 52 16V48C52 49.1046 51.1046 50 50 50H14C12.8954 50 12 49.1046 12 48V16Z" fill="#F5F5F5"/>
    <path d="M32 20C32 18.8954 32.8954 18 34 18H48C49.1046 18 50 18.8954 50 20V44C50 45.1046 49.1046 46 48 46H34C32.8954 46 32 45.1046 32 44V20Z" fill="#E0E7FF"/>
    <path d="M32 20C32 18.8954 31.1046 18 30 18H16C14.8954 18 14 18.8954 14 20V44C14 45.1046 14.8954 46 16 46H30C31.1046 46 32 45.1046 32 44V20Z" fill="#C7D2FE"/>
    <path d="M32 20V44" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 20C32 18.8954 32.8954 18 34 18H48C49.1046 18 50 18.8954 50 20V44C50 45.1046 49.1046 46 48 46H34C32.8954 46 32 45.1046 32 44V20Z" stroke="#6366F1" strokeWidth="2"/>
    <path d="M32 20C32 18.8954 31.1046 18 30 18H16C14.8954 18 14 18.8954 14 20V44C14 45.1046 14.8954 46 16 46H30C31.1046 46 32 45.1046 32 44V20Z" stroke="#6366F1" strokeWidth="2"/>
  </svg>
);

export default BookLogo;
