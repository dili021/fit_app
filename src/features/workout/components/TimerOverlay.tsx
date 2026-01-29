import { Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface TimerOverlayProps {
  isVisible: boolean
  onStart: () => void
  onStop: () => void
  elapsedSeconds: number
  isRunning: boolean
}

export function TimerOverlay({
  isVisible,
  onStart,
  onStop,
  elapsedSeconds,
  isRunning,
}: TimerOverlayProps) {
  if (!isVisible) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <h3 className="text-lg text-center pb-6 font-semibold">
            Workout Timer
          </h3>

          <div className="text-center space-y-6">
            <div className="text-6xl font-mono font-bold">
              {formatTime(elapsedSeconds)}
            </div>

            {isRunning ? (
              <Button
                onClick={onStop}
                size="lg"
                variant="destructive"
                className="w-full"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop Timer
              </Button>
            ) : (
              <Button onClick={onStart} size="lg" className="w-full">
                <Play className="h-5 w-5 mr-2" />
                Start Timer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
