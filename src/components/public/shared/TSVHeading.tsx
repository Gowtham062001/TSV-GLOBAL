import React from "react";

interface TSVHeadingProps {
  /** Text before the highlight / line break */
  prefix?: string;
  /** The <span class="hl"> highlighted word(s) */
  highlight?: string;
  /** Text after the highlight (optional) */
  suffix?: string;
  /** Insert <br /> right before the highlight */
  hasBreak?: boolean;
  className?: string;
  tag?: "h1" | "h2" | "h3";
  /** data-* animation attrs forwarded to the element */
  animAttrs?: Record<string, string>;
}

export function TSVHeading({
  prefix = "",
  highlight = "",
  suffix = "",
  hasBreak = false,
  className = "text-anim",
  tag: Tag = "h2",
  animAttrs = {
    "data-effect": "fade-in-right",
    "data-split": "char",
    "data-delay": "0.3",
    "data-duration": "1",
  },
  ...rest
}: TSVHeadingProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Tag className={className} {...animAttrs} {...rest}>
      {prefix}
      {hasBreak && <br />}
      {highlight && <span className="hl">{highlight}</span>}
      {suffix}
    </Tag>
  );
}

/**
 * Sub-heading strip (the small red "About Us" line with optional truck underline)
 */

interface TSVSubHeadingProps {
  text: string;
  hasBorder?: boolean;
  hasTruck?: boolean;
}

export function TSVSubHeading({ text, hasBorder = true, hasTruck = true }: TSVSubHeadingProps) {
  return (
    <h3 className={`sub-heading${hasBorder ? " is-border border-anim" : ""}`}>
      {text}
      {hasTruck && (
        <span className="sh-underline">
          <img className="sh-truck" src="/assets/img/truck.svg" alt="truck" />
        </span>
      )}
    </h3>
  );
}
