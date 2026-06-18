import FountainCanvas from '@/components/FountainCanvas'
import ControlPanel from '@/components/ControlPanel'

export default function Home() {
  return (
    <div className="relative w-full h-full bg-fountain-bg">
      <FountainCanvas />
      <ControlPanel />
    </div>
  )
}
