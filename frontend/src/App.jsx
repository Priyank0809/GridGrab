import { useState, useEffect, useCallback } from 'react'

// const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/blocks'
// const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/grid/'
//const STATS_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/blocks').replace(/\/$/, '') + '/leaderboard/'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/blocks';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/grid/';
const STATS_URL = `${API_BASE.replace(/\/$/, '')}/leaderboard/`;  // Simplified using API_BASE


function App() {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [justCapturedId, setJustCapturedId] = useState(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('gridgrab_nickname') || 'Player'
  })
  const [color, setColor] = useState(() => {
    return localStorage.getItem('gridgrab_color') || '#3b82f6'
  })
  const [capturingId, setCapturingId] = useState(null)

  useEffect(() => {
    localStorage.setItem('gridgrab_nickname', nickname)
  }, [nickname])
  useEffect(() => {
    localStorage.setItem('gridgrab_color', color)
  }, [color])

  const updateBlock = useCallback((block) => {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === block.id)
      if (i === -1) return prev
      const next = [...prev]
      next[i] = block
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchBlocks() {
      try {
        setError(null)
        const res = await fetch(API_BASE)
        if (!res.ok) throw new Error('Failed to load grid')
        const data = await res.json()
        if (!cancelled) setBlocks(data)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchBlocks()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchLeaderboard() {
      try {
        const res = await fetch(STATS_URL)
        if (!cancelled && res.ok) {
          const data = await res.json()
          setLeaderboard(Array.isArray(data) ? data : [])
        }
      } catch (_) {}
    }
    fetchLeaderboard()
    const t = setInterval(fetchLeaderboard, 15000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'block_captured' && msg.block) {
          updateBlock(msg.block)
          setJustCapturedId(msg.block.id)
          setTimeout(() => setJustCapturedId(null), 500)
        }
      } catch (_) {}
    }
    ws.onclose = () => {}
    return () => ws.close()
  }, [updateBlock])

  async function captureBlock(id) {
    setCapturingId(id)
    setToast(null)
    try {
      const res = await fetch(`${API_BASE}/${id}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_name: nickname.trim() || 'Anonymous',
          color: color,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        updateBlock(data)
        setJustCapturedId(id)
        setTimeout(() => setJustCapturedId(null), 500)
      } else {
        setToast(data.error || 'Capture failed')
        setTimeout(() => setToast(null), 3000)
      }
    } catch (e) {
      console.error(e)
      setToast('Network error')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setCapturingId(null)
    }
  }

  if (loading) {
    return (
      <div className="app">
        <p className="loading">Loading grid…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <p className="error">
          {error}. Is the backend running? Start it with: daphne -b 127.0.0.1 -p 8000 gridgrab_backend.asgi:application
        </p>
      </div>
    )
  }

  return (
    <div className="app">
      <h1>GridGrab</h1>
      {toast && <div className="toast">{toast}</div>}
      <p className="playing-as">
        Playing as <span className="player-name" style={{ color: color }}>{nickname.trim() || 'Anonymous'}</span>
        <span className="player-swatch" style={{ background: color }} />
      </p>
      <div className="controls">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Your name"
          maxLength={50}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          title="Your color"
        />
      </div>
      <div className="leaderboard-panel">
        <h3>Leaderboard</h3>
        <ol className="leaderboard-list">
          {leaderboard.map((entry, i) => (
            <li key={(entry.owner_name || '') + i}>
              <span className="lb-swatch" style={{ background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] || '#6b7280' }} />
              <span className="lb-name">{entry.owner_name}</span>
              <span className="lb-count">{entry.count}</span>
            </li>
          ))}
        </ol>
      </div>
      <div
        className="grid-zoom-pan"
        onWheel={(e) => {
          e.preventDefault()
          setScale((s) => Math.min(3, Math.max(0.4, s - e.deltaY * 0.002)))
        }}
        onMouseDown={(e) => {
          if (e.button === 0) {
            setIsPanning(true)
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
          }
        }}
        onMouseMove={(e) => {
          if (isPanning) setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
        }}
        onMouseUp={() => setIsPanning(false)}
        onMouseLeave={() => setIsPanning(false)}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <div
          className="grid"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {blocks.map((b) => (
          <div
            key={b.id}
            className={`cell ${b.owner_name ? 'owned' : ''} ${capturingId === b.id ? 'capturing' : ''} ${justCapturedId === b.id ? 'just-captured' : ''}`}
            style={{ background: b.owner_name ? (b.color || '#6b7280') : '#374151' }}
            title={b.owner_name ? `${b.row},${b.col} – ${b.owner_name}` : `${b.row},${b.col} – unclaimed`}
            onClick={() => captureBlock(b.id)}
          />
        ))}
        </div>
      </div>
    </div>
  )
}

export default App