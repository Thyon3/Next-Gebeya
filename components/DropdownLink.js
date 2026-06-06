import Link from "next/link";
import React from "react";

export default function DropdownLink(props) {
  let { href, children, logout, ...rest } = props;
  
  return (
    <Link href={href} {...rest}>
      <span
        onClick={logout}
        className="dropdown-link"
      >
        {children}
      </span>
    </Link>
  );
}
