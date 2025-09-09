import type { SVGProps } from 'react';

export function MaskedKillerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 C17.52,22 22,17.52 22,12 C22,6.48 17.52,2 12,2 Z M12,20 C7.59,20 4,16.41 4,12 C4,7.59 7.59,4 12,4 C16.41,4 20,7.59 20,12 C20,16.41 16.41,20 12,20 Z" fill="currentColor" />
      <path d="M9,10 C8.17,10 7.5,10.67 7.5,11.5 C7.5,12.33 8.17,13 9,13 C9.83,13 10.5,12.33 10.5,11.5 C10.5,10.67 9.83,10 9,10 Z" />
      <path d="M15,10 C14.17,10 13.5,10.67 13.5,11.5 C13.5,12.33 14.17,13 15,13 C15.83,13 16.5,12.33 16.5,11.5 C16.5,10.67 15.83,10 15,10 Z" />
      <path d="M4.22,4.22 L5.64,5.64" />
      <path d="M18.36,18.36 L19.78,19.78" />
      <path d="M5.64,18.36 L4.22,19.78" />
      <path d="M19.78,4.22 L18.36,5.64" />
    </svg>
  );
}
