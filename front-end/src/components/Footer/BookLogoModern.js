// BookLogoModern.js
// SVG logo: open book, modern, blue accent (footer reuse)
import React from "react";

const BookLogoModern = ({ size = 32, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <rect width="64" height="64" rx="14" fill="#fff"/>
    <path d="M16 48V20C16 17.7909 17.7909 16 20 16H32" stroke="#2196F3" strokeWidth="3" strokeLinecap="round"/>
    <path d="M48 48V20C48 17.7909 46.2091 16 44 16H32" stroke="#2196F3" strokeWidth="3" strokeLinecap="round"/>
    <path d="M32 16V48" stroke="#2196F3" strokeWidth="3" strokeLinecap="round"/>
    <path d="M32 48C32 48 28 44 20 44C17.7909 44 16 45.7909 16 48" fill="#90CAF9"/>
    <path d="M32 48C32 48 36 44 44 44C46.2091 44 48 45.7909 48 48" fill="#2196F3"/>
    <ellipse cx="32" cy="24" rx="4" ry="2" fill="#2196F3" fillOpacity="0.15"/>
  </svg>
);

export default BookLogoModern;
