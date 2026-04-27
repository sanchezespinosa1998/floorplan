import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className" | "children"> {
  className?: string | (({ isActive, isPending }: { isActive: boolean; isPending: boolean }) => string);
  activeClassName?: string;
  pendingClassName?: string;
  children?: ReactNode | (({ isActive, isPending }: { isActive: boolean; isPending: boolean }) => ReactNode);
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, children, ...props }, ref) => {
    const getClassName = typeof className === "function" 
      ? className 
      : () => cn(className, activeClassName, pendingClassName);
    
    const getChildren = typeof children === "function"
      ? children
      : () => children;

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) => getClassName({ isActive, isPending })}
        children={({ isActive, isPending }) => getChildren({ isActive, isPending })}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
