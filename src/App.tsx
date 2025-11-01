import { useState } from 'react'
import './App.css'
import VtuberLoader from './components/VtuberLoader'

function App() {
  const [count, setCount] = useState(0)

  return (
    <VtuberLoader/>
  )
}

export default App
