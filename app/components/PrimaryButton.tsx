import Link from 'next/link';
import type { ReactNode } from 'react';

type PrimaryButtonProps = {
  children: ReactNode;
  href?: string;
};

export function PrimaryButton({ children, href }: PrimaryButtonProps) {
  const className = 'rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]';

  if (href) {
    return <Link href={href} className={className}>{children}</Link>;
  }

  return <button className={className}>{children}</button>;
}
