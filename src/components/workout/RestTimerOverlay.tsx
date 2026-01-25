import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface RestTimerOverlayProps {
  isVisible: boolean
  onDismiss: () => void
  secondsRemaining: number
}

export function RestTimerOverlay({
  isVisible,
  onDismiss,
  secondsRemaining,
}: RestTimerOverlayProps) {
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
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Rest Timer</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center space-y-6">
            <div className="text-6xl font-mono font-bold text-blue-600">
              {formatTime(secondsRemaining)}
            </div>
            <p className="text-sm text-muted-foreground">
              Take a break before your next set
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
