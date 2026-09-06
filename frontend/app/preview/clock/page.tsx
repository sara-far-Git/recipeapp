"use client";

/**
 * Local preview of the stacked horologe — not part of the site.
 */
export default function ClockPreviewPage() {
  return (
    <div className="min-h-[100svh] grid place-items-center bg-[#0B2A20] px-6 py-16">
      <div className="text-center">
        <p className="eyebrow text-[#D5E4D7] mb-8">אורלוגין</p>
        <div className="horologe" aria-label="שעון מטוטלת">
          <img src="/marks/clock-face.png" alt="" className="horologe-layer" />
          <img src="/marks/clock-hour.png" alt="" className="horologe-layer horologe-hour" />
          <img src="/marks/clock-minute.png" alt="" className="horologe-layer horologe-minute" />
          <img src="/marks/clock-second.png" alt="" className="horologe-layer horologe-second" />
          <img src="/marks/clock-pendulum.png" alt="" className="horologe-layer horologe-pendulum" />
        </div>
      </div>
      <style jsx>{`
        .horologe {
          position: relative;
          width: min(34rem, 86vw);
          aspect-ratio: 1;
        }
        .horologe-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .horologe-hour,
        .horologe-minute,
        .horologe-second {
          transform-origin: 50% 33.33%;
        }
        .horologe-pendulum {
          transform-origin: 50% 58.5%;
          animation: horologe-swing 2.8s ease-in-out infinite;
        }
        .horologe-hour { animation: horologe-hour 43200s linear infinite; }
        .horologe-minute { animation: horologe-minute 3600s linear infinite; }
        .horologe-second { animation: horologe-second 60s linear infinite; }
        @keyframes horologe-swing {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes horologe-hour { to { transform: rotate(360deg); } }
        @keyframes horologe-minute { to { transform: rotate(360deg); } }
        @keyframes horologe-second { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
