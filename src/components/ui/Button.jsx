function Button({
  as = "button",
  children,
  className = "",
  variant = "primary",
  icon,
  disabled = false,
  ...props
}) {
  const Component = as;
  const resolvedProps =
    Component === "button"
      ? { type: "button", disabled, ...props }
      : {
          "aria-disabled": disabled,
          tabIndex: disabled ? -1 : props.tabIndex,
          ...props,
          href: disabled ? undefined : props.href,
          onClick: disabled
            ? (event) => {
                event.preventDefault();
              }
            : props.onClick,
        };

  return (
    <Component
      className={`button button--${variant} ${disabled ? "is-disabled" : ""} ${className}`.trim()}
      {...resolvedProps}
    >
      {icon ? <span className="button__icon">{icon}</span> : null}
      <span>{children}</span>
    </Component>
  );
}

export default Button;
