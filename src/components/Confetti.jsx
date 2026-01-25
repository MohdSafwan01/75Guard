/**
 * Confetti - Celebration animation when all subjects safe
 */

import { useEffect, useState } from 'react'

function Confetti() {
    const [particles, setParticles] = useState([])
    const [show, setShow] = useState(true)

    useEffect(() => {
        // Generate confetti particles
        const colors = ['#7ED957', '#FFB5C5', '#87CEEB', '#FFB347', '#C5A3FF', '#98D8AA']
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5,
            delay: Math.random() * 2,
            duration: Math.random() * 2 + 2,
            rotation: Math.random() * 360,
        }))
        setParticles(newParticles)

        // Hide after animation
        const timer = setTimeout(() => setShow(false), 5000)
        return () => clearTimeout(timer)
    }, [])

    if (!show) return null

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden',
        }}>
            {particles.map(particle => (
                <div
                    key={particle.id}
                    style={{
                        position: 'absolute',
                        left: `${particle.x}%`,
                        top: '-20px',
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        border: '2px solid #1C1C1C',
                        borderRadius: particle.id % 3 === 0 ? '50%' : particle.id % 3 === 1 ? '0' : '4px',
                        transform: `rotate(${particle.rotation}deg)`,
                        animation: `confettiFall ${particle.duration}s ease-out forwards`,
                        animationDelay: `${particle.delay}s`,
                    }}
                />
            ))}
            <style>{`
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-20px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    )
}

export default Confetti
