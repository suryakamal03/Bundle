'use client'

interface LoadingProps {
  size?: number
  className?: string
}

export default function Loading({ size = 18, className = '' }: LoadingProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div 
        className="spinner"
        style={{
          width: size,
          height: size,
        }}
      >
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <style jsx>{`
        .spinner {
          animation: spinner-y0fdc1 2s infinite ease;
          transform-style: preserve-3d;
        }

        .spinner > div {
          height: 100%;
          position: absolute;
          width: 100%;
          border: 2px solid #1a1a1a;
        }

        @media (prefers-color-scheme: dark) {
          .spinner > div {
            border-color: #ffffff;
          }
        }

        .spinner div:nth-of-type(1) {
          transform: translateZ(calc(-${size}px / 2)) rotateY(180deg);
        }

        .spinner div:nth-of-type(2) {
          transform: rotateY(-270deg) translateX(50%);
          transform-origin: top right;
        }

        .spinner div:nth-of-type(3) {
          transform: rotateY(270deg) translateX(-50%);
          transform-origin: center left;
        }

        .spinner div:nth-of-type(4) {
          transform: rotateX(90deg) translateY(-50%);
          transform-origin: top center;
        }

        .spinner div:nth-of-type(5) {
          transform: rotateX(-90deg) translateY(50%);
          transform-origin: bottom center;
        }

        .spinner div:nth-of-type(6) {
          transform: translateZ(calc(${size}px / 2));
        }

        @keyframes spinner-y0fdc1 {
          0% {
            transform: rotate(45deg) rotateX(-25deg) rotateY(25deg);
          }

          50% {
            transform: rotate(45deg) rotateX(-385deg) rotateY(25deg);
          }

          100% {
            transform: rotate(45deg) rotateX(-385deg) rotateY(385deg);
          }
        }
      `}</style>
    </div>
  )
}
