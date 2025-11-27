import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface DevServerContextValue {
    isConnected: boolean
    showError: () => void
}

const DevServerContext = createContext<DevServerContextValue | undefined>(undefined)

export const useDevServer = (): DevServerContextValue => {
    const context = useContext(DevServerContext)
    if (!context) {
        throw new Error('useDevServer must be used within a DevServerProvider')
    }
    return context
}

interface DevServerProviderProps {
    children: ReactNode
}

export const DevServerProvider: React.FC<DevServerProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(true)
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Only run in development mode
        if (import.meta.env.DEV && import.meta.hot) {
            let reconnectAttempts = 0
            const maxReconnectAttempts = 3

            // Listen for HMR connection events
            const handleDisconnect = () => {
                console.warn('Dev server disconnected')
                reconnectAttempts++

                // After a few failed reconnect attempts, mark as disconnected
                if (reconnectAttempts >= maxReconnectAttempts) {
                    setIsConnected(false)
                    setShowBanner(true)
                }
            }

            const handleConnect = () => {
                console.log('Dev server connected')
                reconnectAttempts = 0
                setIsConnected(true)
                setShowBanner(false)
            }

            // Vite HMR WebSocket connection monitoring
            if (import.meta.hot) {
                // Check connection status periodically
                const checkInterval = setInterval(() => {
                    // Try to access a known dev server resource
                    fetch('/__vite_ping')
                        .then(() => {
                            if (!isConnected) {
                                handleConnect()
                            }
                        })
                        .catch(() => {
                            handleDisconnect()
                        })
                }, 3000) // Check every 3 seconds

                return () => {
                    clearInterval(checkInterval)
                }
            }
        }
    }, [isConnected])

    const showError = () => {
        if (!isConnected) {
            alert('⚠️ Development server is not running!\n\nThe frontend has been stopped. Please restart the frontend server (npm run dev) to make changes.')
            throw new Error('Development server not available')
        }
    }

    return (
        <DevServerContext.Provider value={{ isConnected, showError }}>
            {showBanner && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#ff4444',
                        color: 'white',
                        padding: '12px 20px',
                        textAlign: 'center',
                        zIndex: 10000,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        fontWeight: 600
                    }}
                >
                    ⚠️ Frontend Development Server Disconnected - Application is READ ONLY
                </div>
            )}
            <div style={showBanner ? { marginTop: '48px' } : {}}>
                {children}
            </div>
        </DevServerContext.Provider>
    )
}
