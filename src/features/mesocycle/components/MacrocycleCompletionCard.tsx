import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface MacrocycleCompletionCardProps {
  completionDate: number
}

export function MacrocycleCompletionCard({
  completionDate,
}: MacrocycleCompletionCardProps) {
  const formatCompletionDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card className="mb-6 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <div className="font-semibold">Macrocycle Completion</div>
            <div className="text-sm text-muted-foreground">
              Estimated completion: {formatCompletionDate(completionDate)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
