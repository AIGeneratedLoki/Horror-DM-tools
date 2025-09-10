import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText: FC<GlitchTextProps> = ({ text, className }) => {
  return (
    <div className={cn('glitch font-headline', className)} data-text={text}>
      {text}
    </div>
  );
};

export default GlitchText;
