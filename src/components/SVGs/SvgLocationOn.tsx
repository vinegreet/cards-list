import * as React from "react";

const SvgLocationOn = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={21}
    fill="none"
    {...props}
  >
    <mask
      id="location_on_svg__a"
      width={20}
      height={21}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
    >
      <path fill="#D9D9D9" d="M0 .5h20v20H0z" />
    </mask>
    <g mask="url(#location_on_svg__a)">
      <path
        fill="#BBB"
        d="M10 16.657q2.383-2.085 3.712-4.064 1.328-1.98 1.328-3.49 0-2.196-1.427-3.654Q12.187 3.992 10 3.992q-2.185 0-3.613 1.457T4.96 9.102q0 1.512 1.329 3.49 1.328 1.98 3.711 4.065m0 1.043q-.222 0-.414-.073a1.5 1.5 0 0 1-.389-.23q-.6-.512-1.505-1.4a20 20 0 0 1-1.762-1.991 12.8 12.8 0 0 1-1.455-2.368q-.598-1.263-.598-2.536 0-2.55 1.71-4.368T10 2.917q2.684 0 4.403 1.817 1.72 1.817 1.72 4.368 0 1.273-.608 2.542-.608 1.27-1.45 2.378a17 17 0 0 1-1.748 1.982 35 35 0 0 1-1.506 1.385q-.195.156-.39.233t-.42.078m.002-7.312q.56 0 .949-.391.39-.39.39-.95t-.392-.95-.95-.389-.949.391q-.39.39-.39.95t.391.95q.392.389.95.389"
      />
    </g>
  </svg>
);

export default SvgLocationOn;

