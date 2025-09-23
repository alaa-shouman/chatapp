import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// Assign Pusher to window for Laravel Echo
(window as any).Pusher = Pusher;

// Define the Echo instance type
interface EchoContextType {
    echo: Echo<any> | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
    joinChannel: (channelName: string) => any;
    leaveChannel: (channelName: string) => void;
}

const EchoContext = createContext<EchoContextType | null>(null);

const EchoContextProvider = ({ children }: { children: ReactNode }) => {
    const [echo, setEcho] = useState<Echo<any> | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Get auth token from Redux store
    const authToken = useSelector((state: any) => state.auth.token);

    const connect = useCallback(() => {
        if (echo) return; // Already connected

        const echoInstance = new Echo({
            broadcaster: 'reverb',
            key: process.env.EXPO_PUBLIC_REVERB_APP_KEY || 'your-reverb-app-key',
            wsHost: process.env.EXPO_PUBLIC_REVERB_HOST || 'localhost',
            wsPort: parseInt(process.env.EXPO_PUBLIC_REVERB_PORT || '8080'),
            wssPort: parseInt(process.env.EXPO_PUBLIC_REVERB_PORT || '8080'),
            disableStats: true,
            cluster: '',
            forceTLS: false, // Set to true for production with HTTPS
            encrypted: false, // Set to true for production with HTTPS
            authorizer: (channel: any, options: any) => {
                return {
                    authorize: (socketId: string, callback: (error: any, data?: any) => void) => {
                        // Only authorize if we have an auth token
                        if (!authToken) {
                            callback(new Error('No auth token available'));
                            return;
                        }

                        // Make authorization request to your Laravel backend
                        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/broadcasting/auth`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`,
                            },
                            body: JSON.stringify({
                                socket_id: socketId,
                                channel_name: channel.name,
                            }),
                        })
                            .then(response => response.json())
                            .then(data => {
                                callback(null, data);
                            })
                            .catch(error => {
                                console.error('Echo authorization error:', error);
                                callback(error);
                            });
                    },
                };
            },
        });

        // Set up connection event listeners with proper type checking
        if (echoInstance.connector && 'pusher' in echoInstance.connector) {
            const pusherConnector = echoInstance.connector as any;

            pusherConnector.pusher.connection.bind('connected', () => {
                console.log('Echo connected');
                setIsConnected(true);
            });

            pusherConnector.pusher.connection.bind('disconnected', () => {
                console.log('Echo disconnected');
                setIsConnected(false);
            });

            pusherConnector.pusher.connection.bind('error', (error: any) => {
                console.error('Echo connection error:', error);
                setIsConnected(false);
            });
        }

        setEcho(echoInstance);
    }, [authToken, echo]);

    const disconnect = useCallback(() => {
        if (echo) {
            echo.disconnect();
            setEcho(null);
            setIsConnected(false);
        }
    }, [echo]);

    const joinChannel = (channelName: string) => {
        if (!echo) {
            console.warn('Echo not connected');
            return null;
        }

        // For public channels
        if (!channelName.startsWith('private-') && !channelName.startsWith('presence-')) {
            return echo.channel(channelName);
        }

        // For private channels
        if (channelName.startsWith('private-')) {
            return echo.private(channelName);
        }

        // For presence channels
        if (channelName.startsWith('presence-')) {
            return echo.join(channelName);
        }

        return echo.channel(channelName);
    };

    const leaveChannel = (channelName: string) => {
        if (echo) {
            echo.leaveChannel(channelName);
        }
    };

    // Auto-connect when provider mounts and auth token is available
    useEffect(() => {
        if (authToken) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [authToken, connect, disconnect]);

    const value: EchoContextType = {
        echo,
        isConnected,
        connect,
        disconnect,
        joinChannel,
        leaveChannel,
    };

    return (
        <EchoContext.Provider value={value}>
            {children}
        </EchoContext.Provider>
    );
};

// Custom hook to use Echo context
export const useEcho = () => {
    const context = useContext(EchoContext);
    if (!context) {
        throw new Error('useEcho must be used within an EchoContextProvider');
    }
    return context;
};

export { EchoContext, EchoContextProvider };
