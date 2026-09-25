import React from 'react';
import { Service } from '../../types/index.js';
import { Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback.js';

interface ServiceCardProps {
  service: Service;
  onEnquire?: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEnquire }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-5 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              {service.category}
            </span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              {service.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              ${service.price.toFixed(2)}
            </span>
            <p className="text-[11px] text-neutral-400">est. price</p>
          </div>
        </div>

        {service.description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
            {service.description}
          </p>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{service.duration}</span>
        </div>

        {onEnquire && (
          <button
            onClick={() => onEnquire(service)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Book / Enquire
          </button>
        )}
      </div>
    </div>
  );
};
