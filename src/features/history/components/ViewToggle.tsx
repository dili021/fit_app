type ViewType = 'list' | 'calendar' | 'charts'

interface ViewToggleProps {
  selectedView: ViewType
  onViewChange: (view: ViewType) => void
}

const BASE_BUTTON_CLASSES =
  'px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[48px]'
const ACTIVE_BUTTON_CLASSES = 'bg-primary text-primary-foreground'
const INACTIVE_BUTTON_CLASSES =
  'bg-muted text-muted-foreground active:bg-muted/80'

export function ViewToggle({ selectedView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onViewChange('list')}
        className={`${BASE_BUTTON_CLASSES} ${
          selectedView === 'list'
            ? ACTIVE_BUTTON_CLASSES
            : INACTIVE_BUTTON_CLASSES
        }`}
      >
        Workout History
      </button>
      <button
        onClick={() => onViewChange('calendar')}
        className={`${BASE_BUTTON_CLASSES} ${
          selectedView === 'calendar'
            ? ACTIVE_BUTTON_CLASSES
            : INACTIVE_BUTTON_CLASSES
        }`}
      >
        Workout Calendar
      </button>
      <button
        onClick={() => onViewChange('charts')}
        className={`${BASE_BUTTON_CLASSES} text-center ${
          selectedView === 'charts'
            ? ACTIVE_BUTTON_CLASSES
            : INACTIVE_BUTTON_CLASSES
        }`}
      >
        Progress
      </button>
    </div>
  )
}
