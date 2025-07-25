import { createContext, useContext, useEffect, useState } from 'react'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Placeholder for socket.io connection
    // const newSocket = io(process.env.REACT_APP_SERVER_URL)
    // setSocket(newSocket)
    // setConnected(true)
    
    // For now, just simulate connection
    setConnected(true)

    return () => {
      // socket?.disconnect()
    }
  }, [])

  const value = {
    socket,
    connected
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}