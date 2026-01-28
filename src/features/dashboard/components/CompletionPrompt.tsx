import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CompletionPromptProps {
  onDismiss: () => void
}

export function CompletionPrompt({ onDismiss }: CompletionPromptProps) {
  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <CardContent className="py-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              Mesocycle Completed!
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200 mb-4">
              Congratulations on completing your mesocycle! Set up a new
              mesocycle to continue your training.
            </p>
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700"
              onClick={onDismiss}
            >
              <Link to="/mesocycles">Mesocycles</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
