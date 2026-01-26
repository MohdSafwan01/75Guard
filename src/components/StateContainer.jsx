/**
 * StateContainer - Wrapper component that provides global state context
 * 
 * Provides visual theming based on global attendance state (SAFE/TENSION/CRITICAL)
 */

import { createContext, useContext } from 'react'

// Context for global state
const StateContext = createContext({
    globalState: 'SAFE',
})

// Hook to access global state
export function useGlobalState() {
    return useContext(StateContext)
}

/**
 * StateContainer component
 * Wraps children with state context and applies subtle visual theming
 */
function StateContainer({ globalState = 'SAFE', children }) {
    // Get accent color based on state
    const getStateColor = () => {
        switch (globalState) {
            case 'CRITICAL':
                return '#FF6B6B'
            case 'TENSION':
                return '#FFB347'
            default:
                return '#7ED957'
        }
    }

    const stateColor = getStateColor()

    return (
        <StateContext.Provider value={{ globalState, stateColor }}>
            <div
                data-state={globalState}
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#1C1C1C',
                    // Subtle gradient based on state
                    background: `linear-gradient(135deg, #1C1C1C 0%, ${globalState === 'CRITICAL' ? '#2D1F1F' : globalState === 'TENSION' ? '#2D2A1F' : '#1F2D1F'} 100%)`,
                }}
            >
                {children}
            </div>
        </StateContext.Provider>
    )
}

export default StateContainer
