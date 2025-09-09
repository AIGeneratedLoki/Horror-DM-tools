import type { SVGProps } from 'react';

export function PixelGearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="crispEdges"
        {...props}
    >
        <path d="M12 9.5 A2.5 2.5 0 1 0 12 14.5 A2.5 2.5 0 1 0 12 9.5 Z" strokeWidth="1" />
        <path d="M4 10 L2 10 L2 14 L4 14 L5 12 Z" />
        <path d="M20 10 L22 10 L22 14 L20 14 L19 12 Z" />
        <path d="M10 4 L10 2 L14 2 L14 4 L12 5 Z" />
        <path d="M10 20 L10 22 L14 22 L14 20 L12 19 Z" />
        <path d="M6.3 6.3 L4.9 4.9 L7.8 2 L9.2 3.4 L7.1 5.5 Z" />
        <path d="M17.7 17.7 L19.1 19.1 L16.2 22 L14.8 20.6 L16.9 18.5 Z" />
        <path d="M6.3 17.7 L4.9 19.1 L2 16.2 L3.4 14.8 L5.5 16.9 Z" />
        <path d="M17.7 6.3 L19.1 4.9 L22 7.8 L20.6 9.2 L18.5 7.1 Z" />
    </svg>
  );
}
