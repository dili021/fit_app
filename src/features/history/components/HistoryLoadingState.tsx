import { Card, CardContent } from '@/components/ui/card'

export function HistoryLoadingState() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Workout History</h1>
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            Loading workout history...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
