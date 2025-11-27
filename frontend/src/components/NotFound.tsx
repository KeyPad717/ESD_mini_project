import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="access-denied-card">
                <h1 style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '0' }}>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for does not exist or has been moved.</p>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    Go Back Home
                </button>
            </div>
        </div>
    )
}

export default NotFound
