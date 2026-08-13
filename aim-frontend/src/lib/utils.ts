import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
 if (!iso) return '';
 const date = new Date(iso);
 if (isNaN(date.getTime())) return iso;
 return date.toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric'
 });
}

export function formatDateTime(iso: string): string {
 if (!iso) return '';
 const date = new Date(iso);
 if (isNaN(date.getTime())) return iso;
 const dateStr = date.toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric'
 });
 const timeStr = date.toLocaleTimeString('en-US', {
 hour: 'numeric',
 minute: '2-digit',
 hour12: true
 });
 return `${dateStr} · ${timeStr}`;
}

export function daysAgo(iso: string, simNow: string): number {
 if (!iso || !simNow) return 0;
 const start = new Date(iso).getTime();
 const now = new Date(simNow).getTime();
 const diffMs = now - start;
 return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function daysUntil(iso: string, simNow: string): number {
 if (!iso || !simNow) return 0;
 const target = new Date(iso).getTime();
 const now = new Date(simNow).getTime();
 const diffMs = target - now;
 return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function pluralize(count: number, singular: string, plural: string): string {
 return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}
