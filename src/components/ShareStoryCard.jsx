import React, { forwardRef } from 'react';

const ShareStoryCard = forwardRef(({ type, title, content, category, verse }, ref) => {
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, opacity: 0.01, pointerEvents: 'none', zIndex: -100 }}>
      <div
        ref={ref}
        className="w-[1080px] h-[1920px] bg-[#09090b] flex flex-col justify-center items-center p-20 font-sans text-white overflow-hidden relative"
      >
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-[800px] rounded-full bg-[var(--color-gold-600)] opacity-10 blur-[200px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1/3 h-[600px] rounded-full bg-zinc-500 opacity-10 blur-[150px]"></div>
        {/* Border Glow */}
        <div className="absolute inset-8 border-2 border-[var(--color-gold-500)]/20 rounded-[3rem] z-10 pointer-events-none"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-center max-w-3xl">
        <div className="mb-12">
          <h2 className="text-4xl font-semibold tracking-widest text-[var(--color-gold-500)] uppercase">
            {type === 'testimony' ? 'Look What God Has Done' : 'Answered Prayer'}
          </h2>
        </div>

        {title && (
          <h3 className="text-6xl font-bold mb-8 text-white">{title}</h3>
        )}

        <div className="bg-zinc-900/60 backdrop-blur-md border border-[var(--color-gold-500)]/30 rounded-3xl p-16 w-full shadow-[0_0_50px_rgba(232,208,141,0.1)]">
          <p className="text-5xl font-light leading-relaxed text-zinc-200 mb-8 whitespace-pre-wrap">
            "{content}"
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <span className="text-2xl font-semibold text-[var(--color-gold-500)]/80 uppercase tracking-widest">
              {category || (type === 'testimony' ? 'Praise' : 'Prayer')}
            </span>
          </div>
        </div>

        {verse && (
          <div className="mt-16 bg-[var(--color-gold-500)]/10 border border-[var(--color-gold-500)]/20 rounded-2xl p-8 max-w-2xl">
            <p className="text-3xl font-medium text-[var(--color-gold-400)] leading-relaxed text-center">
              {verse}
            </p>
          </div>
        )}

        <div className="absolute bottom-20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-gold-500)]/20 border border-[var(--color-gold-500)]/30 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-gold-400)]">
              <path d="M12 2V34M4 10H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-3xl font-medium text-white tracking-widest">WHISPERTOGOD.APP</p>
        </div>
        </div>
      </div>
    </div>
  );
});

ShareStoryCard.displayName = 'ShareStoryCard';

export default ShareStoryCard;
