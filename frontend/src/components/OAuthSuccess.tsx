import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * OAuth Success Handler Component
 * Handles the redirect after successful OAuth authentication
 */
const OAuthSuccess: React.FC = () => {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleOAuthSuccess = async () => {
            try {
                // Small delay to ensure session is established
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Navigate to faculty page - let the ProtectedRoute handle auth checking
                navigate('/faculty', { replace: true })
            } catch (err) {
                console.error('OAuth redirect error:', err)
                setError('Failed to complete sign in')
                // Fallback to login page after error
                setTimeout(() => navigate('/login'), 2000)
            }
        }

        void handleOAuthSuccess()
    }, [navigate])

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            {error ? (
                <div>
                    <p style={{ color: 'red' }}>{error}</p>
                    <p>Redirecting to login...</p>
                </div>
            ) : (
                <div>
                    <p>Completing sign in...</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Please wait...</p>
                </div>
            )}
        </div>
    )
}

export default OAuthSuccess
