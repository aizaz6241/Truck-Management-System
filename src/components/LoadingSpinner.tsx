export default function LoadingSpinner({ size = 20, color = "#fff" }: { size?: number, color?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: "spin 1s linear infinite", display: "inline-block", verticalAlign: "middle" }}
        >
            <style>
                {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
            <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeOpacity="0.25"
                stroke={color}
                strokeWidth="4"
            />
            <path
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                d="M 12 2 a 10 10 0 0 1 10 10"
            />
        </svg>
    );
}
