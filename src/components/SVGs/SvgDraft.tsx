import * as React from "react";

const SvgDraft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <mask
      id="draft_svg__a"
      width={24}
      height={24}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
    >
      <path fill="#D9D9D9" d="M0 0h24v24H0z" />
    </mask>
    <g mask="url(#draft_svg__a)">
      <path
        fill="#fff"
        d="M6.308 21.5q-.758 0-1.283-.525a1.75 1.75 0 0 1-.525-1.283V4.308q0-.758.525-1.283T6.308 2.5h7.194q.361 0 .695.14t.58.387l4.196 4.196q.246.246.387.58.14.333.14.695v11.194q0 .758-.525 1.283t-1.283.525zM13.5 7.596V4H6.308a.3.3 0 0 0-.212.096.3.3 0 0 0-.096.212v15.384q0 .116.096.212a.3.3 0 0 0 .212.096h11.384a.3.3 0 0 0 .212-.096.3.3 0 0 0 .096-.212V8.5h-3.596a.88.88 0 0 1-.645-.259.88.88 0 0 1-.259-.645"
      />
    </g>
  </svg>
);

export default SvgDraft;

