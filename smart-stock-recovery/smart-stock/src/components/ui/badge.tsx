import { cn } from '@/lib/utils';
 
interface BadgeProps {
  variant?: 'outline';
  className?: string;
  children: React.ReactNode;
}
 
const Badge = ({ variant, className, children }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        className
      )}
    >
      {children}
    </span>
  );
};
 
export { Badge };
