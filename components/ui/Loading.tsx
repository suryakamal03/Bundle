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
      />

      <style jsx>{`
        .spinner {
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @media (prefers-color-scheme: dark) {
          .spinner {
            border-color: rgba(255, 255, 255, 0.1);
            border-top-color: #ffffff;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
