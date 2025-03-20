import React from "react";
import { Calendar, Clock, CheckSquare, HardDrive } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string;
  icon: string;
  color: string;
};

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "calendar-check":
        return <Calendar className={`text-xl text-${color}-600`} />;
      case "time":
        return <Clock className={`text-xl text-${color}-600`} />;
      case "task":
        return <CheckSquare className={`text-xl text-${color}-600`} />;
      case "hard-drive":
        return <HardDrive className={`text-xl text-${color}-600`} />;
      default:
        return <Calendar className={`text-xl text-${color}-600`} />;
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-lg p-3 bg-${color}-100`}>
          {getIcon()}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-xl font-semibold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );
}
