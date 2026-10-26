const DARK_GREEN = "#14532d";

export function DancingSilhouette() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-4 right-4 z-50 h-56 w-56">
      <style>{`
        @keyframes bc-dance-body { 0% { transform: rotate(0deg); } 16% { transform: rotate(180deg); } 33% { transform: rotate(360deg); } 40% { transform: rotate(360deg); } 50% { transform: rotate(352deg); } 66% { transform: rotate(368deg); } 75% { transform: rotate(360deg); } 85% { transform: rotate(370deg); } 100% { transform: rotate(360deg); } }
        @keyframes bc-dance-arm-l { 0% { transform: rotate(-40deg); } 8% { transform: rotate(40deg); } 16% { transform: rotate(-40deg); } 24% { transform: rotate(40deg); } 33% { transform: rotate(-40deg); } 40% { transform: rotate(-100deg); } 46% { transform: rotate(-60deg); } 52% { transform: rotate(-100deg); } 58% { transform: rotate(-60deg); } 66% { transform: rotate(-100deg); } 75% { transform: rotate(-150deg); } 85% { transform: rotate(-150deg); } 100% { transform: rotate(-40deg); } }
        @keyframes bc-dance-arm-r { 0% { transform: rotate(40deg); } 8% { transform: rotate(-40deg); } 16% { transform: rotate(40deg); } 24% { transform: rotate(-40deg); } 33% { transform: rotate(40deg); } 40% { transform: rotate(100deg); } 46% { transform: rotate(60deg); } 52% { transform: rotate(100deg); } 58% { transform: rotate(60deg); } 66% { transform: rotate(100deg); } 75% { transform: rotate(60deg); } 85% { transform: rotate(60deg); } 100% { transform: rotate(40deg); } }
        @keyframes bc-dance-leg-l { 0% { transform: rotate(-15deg); } 8% { transform: rotate(25deg); } 16% { transform: rotate(-15deg); } 24% { transform: rotate(25deg); } 33% { transform: rotate(-15deg); } 40% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } 66% { transform: rotate(-10deg); } 75% { transform: rotate(-5deg); } 100% { transform: rotate(-15deg); } }
        @keyframes bc-dance-leg-r { 0% { transform: rotate(15deg); } 8% { transform: rotate(-25deg); } 16% { transform: rotate(15deg); } 24% { transform: rotate(-25deg); } 33% { transform: rotate(15deg); } 40% { transform: rotate(10deg); } 50% { transform: rotate(-10deg); } 66% { transform: rotate(10deg); } 75% { transform: rotate(5deg); } 100% { transform: rotate(15deg); } }
        @keyframes bc-dance-head { 0% { transform: rotate(0deg); } 75% { transform: rotate(0deg); } 85% { transform: rotate(20deg); } 100% { transform: rotate(0deg); } }
        @keyframes bc-dance-elbow-l { 0% { transform: rotate(0deg); } 8% { transform: rotate(25deg); } 16% { transform: rotate(0deg); } 24% { transform: rotate(25deg); } 33% { transform: rotate(0deg); } 40% { transform: rotate(-40deg); } 46% { transform: rotate(0deg); } 52% { transform: rotate(-40deg); } 58% { transform: rotate(0deg); } 66% { transform: rotate(-40deg); } 75% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
        @keyframes bc-dance-elbow-r { 0% { transform: rotate(0deg); } 8% { transform: rotate(-25deg); } 16% { transform: rotate(0deg); } 24% { transform: rotate(-25deg); } 33% { transform: rotate(0deg); } 40% { transform: rotate(40deg); } 46% { transform: rotate(0deg); } 52% { transform: rotate(40deg); } 58% { transform: rotate(0deg); } 66% { transform: rotate(40deg); } 75% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
        @keyframes bc-dance-knee-l { 0% { transform: rotate(0deg); } 8% { transform: rotate(35deg); } 16% { transform: rotate(0deg); } 24% { transform: rotate(35deg); } 33% { transform: rotate(0deg); } 50% { transform: rotate(20deg); } 66% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
        @keyframes bc-dance-knee-r { 0% { transform: rotate(0deg); } 8% { transform: rotate(-35deg); } 16% { transform: rotate(0deg); } 24% { transform: rotate(-35deg); } 33% { transform: rotate(0deg); } 50% { transform: rotate(-20deg); } 66% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
      `}</style>
      <svg viewBox="-55 5 210 210" className="h-full w-full" fill={DARK_GREEN}>
        <g style={{ transformBox: "view-box", transformOrigin: "50px 110px", animation: "bc-dance-body 6s ease-in-out infinite" }}>
          <g style={{ transformBox: "view-box", transformOrigin: "50px 48px", animation: "bc-dance-head 6s ease-in-out infinite" }}>
            <circle cx="50" cy="33" r="14" />
          </g>
          <rect x="44" y="48" width="12" height="64" rx="6" />
          <g style={{ transformBox: "view-box", transformOrigin: "50px 52px", animation: "bc-dance-arm-l 6s ease-in-out infinite" }}>
            <rect x="46" y="52" width="8" height="24" rx="4" />
            <g style={{ transformBox: "view-box", transformOrigin: "50px 76px", animation: "bc-dance-elbow-l 6s ease-in-out infinite" }}>
              <rect x="46" y="76" width="8" height="22" rx="4" />
            </g>
          </g>
          <g style={{ transformBox: "view-box", transformOrigin: "50px 52px", animation: "bc-dance-arm-r 6s ease-in-out infinite" }}>
            <rect x="46" y="52" width="8" height="24" rx="4" />
            <g style={{ transformBox: "view-box", transformOrigin: "50px 76px", animation: "bc-dance-elbow-r 6s ease-in-out infinite" }}>
              <rect x="46" y="76" width="8" height="22" rx="4" />
            </g>
          </g>
          <g style={{ transformBox: "view-box", transformOrigin: "50px 110px", animation: "bc-dance-leg-l 6s ease-in-out infinite" }}>
            <rect x="45" y="110" width="10" height="30" rx="5" />
            <g style={{ transformBox: "view-box", transformOrigin: "50px 140px", animation: "bc-dance-knee-l 6s ease-in-out infinite" }}>
              <rect x="45" y="140" width="10" height="30" rx="5" />
            </g>
          </g>
          <g style={{ transformBox: "view-box", transformOrigin: "50px 110px", animation: "bc-dance-leg-r 6s ease-in-out infinite" }}>
            <rect x="45" y="110" width="10" height="30" rx="5" />
            <g style={{ transformBox: "view-box", transformOrigin: "50px 140px", animation: "bc-dance-knee-r 6s ease-in-out infinite" }}>
              <rect x="45" y="140" width="10" height="30" rx="5" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
