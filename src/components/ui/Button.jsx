function Button({
  as = "button",
  children,
  className = "",
  variant = "primary",
  icon,
  ...props
}) {
  const Component = as;

  return (
    <Component className={`button button--${variant} ${className}`.trim()} {...props}>
      {icon ? <span className="button__icon">{icon}</span> : null}
      <span>{children}</span>
    </Component>
  );
}

export default Button;
