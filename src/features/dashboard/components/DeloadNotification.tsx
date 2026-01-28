import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function DeloadNotification() {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Deload Week
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This is your final week. Volume has been automatically reduced by
              50% for recovery.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
