import React from 'react';
import { 
  Users, BookOpen, CalendarCheck, Activity, 
  ArrowUp, ArrowDown 
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: 'users' | 'book' | 'calendar-check' | 'activity';
  trend: 'up' | 'down';
  trendValue: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, value, icon, trend, trendValue 
}) => {
  const icons = {
    users: Users,
    book: BookOpen,
    'calendar-check': CalendarCheck,
    activity: Activity
  };

  const IconComponent = icons[icon];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900">
          <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-200" />
        </div>
        <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          <span className="ml-1 text-sm">{trendValue}</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;