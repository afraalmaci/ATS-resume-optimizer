import React, { InputHTMLAttributes } from "react";

const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />;
};

export default Input;