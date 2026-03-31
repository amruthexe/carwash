"use client";

import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { getUnreadNotifications, markAsRead } from "@/app/actions/notifications";
import { Bell, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export default function NotificationToast() {
  const toastedIds = useRef<Set<string>>(new Set());

  const checkNotifications = useCallback(async () => {
    try {
      const unread = await getUnreadNotifications();
      
      for (const notif of unread) {
        if (toastedIds.current.has(notif._id)) continue;
        
        toastedIds.current.add(notif._id);
        
        // Mark as read immediately to avoid re-fetching
        await markAsRead(notif._id);

        // Display Toast
        toast(notif.title, {
          description: notif.message,
          duration: 15000, // 15 seconds - even longer for better reading
          icon: notif.type === 'service' ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : 
                notif.type === 'payment' ? <Info className="w-8 h-8 text-blue-500" /> : 
                <Bell className="w-8 h-8 text-orange-500" />,
          dismissible: true,
          style: {
            padding: '32px',
            borderRadius: '24px',
            border: '4px solid #0056b3',
            background: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            fontSize: '1.5rem',
            width: '450px',
            maxWidth: '90vw'
          }
        });
      }
    } catch (error) {
      console.error("Error polling notifications:", error);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkNotifications();

    // Poll every 15 seconds
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  return null; // This component doesn't render anything itself
}
