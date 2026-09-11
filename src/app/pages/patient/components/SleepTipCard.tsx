import React from 'react';

export const SleepTipCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-amber to-amber/80 rounded-3xl p-8 text-white shadow-lg">
      <h3 className="text-xl font-bold mb-3">💡 Sleep Better Tip</h3>
      <p className="text-white/95 text-lg leading-relaxed">
        "Try wearing your mask for 30 minutes before bed while reading or watching TV.
        This helps your body get comfortable with the therapy before sleep."
      </p>
    </div>
  );
};
