import React from 'react';
import { Video, HelpCircle } from 'lucide-react';

interface QuickAccessLinksProps {
  onGoToVideos: () => void;
  onGoToHelp: () => void;
}

export const QuickAccessLinks: React.FC<QuickAccessLinksProps> = ({
  onGoToVideos,
  onGoToHelp,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={onGoToVideos}
        className="bg-white rounded-2xl p-6 shadow-sm border border-light-blue hover:shadow-md transition-all text-center"
      >
        <Video className="w-8 h-8 text-teal mx-auto mb-2" />
        <p className="text-sm font-medium text-navy">Comfort Tips</p>
      </button>
      <button
        onClick={onGoToHelp}
        className="bg-white rounded-2xl p-6 shadow-sm border border-light-blue hover:shadow-md transition-all text-center"
      >
        <HelpCircle className="w-8 h-8 text-amber mx-auto mb-2" />
        <p className="text-sm font-medium text-navy">Get Help</p>
      </button>
    </div>
  );
};
