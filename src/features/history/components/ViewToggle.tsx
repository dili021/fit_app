import { Button } from '@/components/ui/button'

type ViewType = 'list' | 'calendar' | 'charts'

interface ViewToggleProps {
  selectedView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewToggle({ selectedView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex mb-6">
      <Button
        onClick={() => onViewChange('list')}
        variant={selectedView === 'list' ? 'default' : 'secondary'}
        className="flex-1"
      >
        History
      </Button>
      <Button
        onClick={() => onViewChange('calendar')}
        variant={selectedView === 'calendar' ? 'default' : 'secondary'}
        className="flex-1"
      >
        Calendar
      </Button>
      <Button
        onClick={() => onViewChange('charts')}
        variant={selectedView === 'charts' ? 'default' : 'secondary'}
        className="flex-1"
      >
        Progress
      </Button>
    </div>
  )
}
