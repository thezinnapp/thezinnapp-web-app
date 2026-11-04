import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Check } from 'lucide-react';

function useIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

export default function MobileSelect({ value, onValueChange, options, placeholder, className }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const selected = options.find(o => o.value === value);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex min-h-[44px] items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors active:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      >
        <span className={`text-left min-w-0 break-words ${selected ? '' : 'text-muted-foreground'}`} style={{ overflowWrap: 'anywhere' }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="h-4 w-4 opacity-60 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder || 'Select an option'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-2" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onValueChange(o.value); setOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                  value === o.value
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted active:bg-accent/20'
                }`}
              >
                {o.label}
                {value === o.value && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}