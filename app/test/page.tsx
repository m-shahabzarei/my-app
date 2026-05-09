/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useEffect, useState } from 'react'

type Message = {
  id: string
  sender: string
  text: string
  createdAt: number
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])

  const fetchMessages = async () => {
    const res = await fetch('/api/messages')
    const data = await res.json()
    setMessages(
      data.messages.sort(
        (a: Message, b: Message) => b.createdAt - a.createdAt
      )
    )
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Messages</h2>

      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            marginBottom: 12,
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 8,
          }}
        >
          <strong>{msg.sender}</strong>
          <div>{msg.text}</div>
          <small>
            {new Date(msg.createdAt).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  )
}