import React from 'react';

interface PointerFingerProps {
  className?: string;
  style?: React.CSSProperties;
}

const PointerFinger = React.forwardRef<HTMLImageElement, PointerFingerProps>(
  ({ className, style }, ref) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src="/icons/hand.svg"
      alt=""
      aria-hidden="true"
      className={className}
      style={style}
    />
  )
);

PointerFinger.displayName = 'PointerFinger';
export default PointerFinger;
