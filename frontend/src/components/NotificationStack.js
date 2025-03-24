import React, { useState, useEffect } from 'react';
import websocketService from '../services/websocketService';

function NotificationStack() {
  const [notifications, setNotifications] = useState([]);

  // Connect to WebSocket and listen for notifications
  useEffect(() => {
    // Connect to the WebSocket server
    websocketService.connect();

    // Add listener for notifications
    const removeListener = websocketService.addNotificationListener((notification) => {
      // Add a unique ID and timestamp to the notification
      const notificationWithId = {
        ...notification,
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
      };
      
      // Add the new notification to the stack
      setNotifications(prev => [...prev, notificationWithId]);
      
      // Set a timeout to remove the notification after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationWithId.id));
      }, 10000);
    });

    // Clean up function
    return () => {
      removeListener();
      websocketService.disconnect();
    };
  }, []);

  // Get the background color based on notification type
  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // If the notification includes a download URL, open it
    if (notification.data && notification.data.downloadUrl) {
      window.open(notification.data.downloadUrl, '_blank');
    }
  };

  // Render nothing if there are no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBackgroundColor(notification.type)} text-white p-4 rounded shadow-lg cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-105`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-semibold">{notification.message}</p>
              {notification.data && notification.data.count && (
                <p className="text-sm">
                  Processed {notification.data.count} records
                </p>
              )}
            </div>
            <button
              className="ml-4 text-white hover:text-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationStack;
