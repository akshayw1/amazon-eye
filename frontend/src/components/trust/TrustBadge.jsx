import React from 'react';
import { Shield, AlertTriangle, AlertCircle } from 'lucide-react';

const TrustBadge = ({ badge, score }) => {
  const badges = {
    trusted: { color: 'bg-green-500', icon: Shield, text: 'Trusted' },
    caution: { color: 'bg-yellow-500', icon: AlertTriangle, text: 'Caution' },
    risk: { color: 'bg-red-500', icon: AlertCircle, text: 'Risk' }
  };
  
  const BadgeIcon = badges[badge].icon;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-medium ${badges[badge].color}`}>
      <BadgeIcon size={16} />
      <span>{badges[badge].text}</span>
      <span className="font-bold">{score}/100</span>
    </div>
  );
};

export default TrustBadge; 