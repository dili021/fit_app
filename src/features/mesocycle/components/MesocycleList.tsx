import { useMutation } from 'convex/react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { api } from '@db/_generated/api'
import { MesocycleCard } from './MesocycleCard'
import type { Doc, Id } from '@db/_generated/dataModel'
import type { DragEndEvent } from '@dnd-kit/core'

interface MesocycleListProps {
  mesocycles: Array<Doc<'mesocycles'>>
  patterns?: Array<Doc<'patterns'>>
  onActivate?: (mesocycleId: Id<'mesocycles'>) => void
  onConclude?: (mesocycleId: Id<'mesocycles'>) => void
  userId: string
  hasActiveMesocycle?: boolean
  activeWorkout?: Doc<'workouts'> | null
}

function SortableMesocycleCard({
  mesocycle,
  patterns,
  onActivate,
  hasActiveMesocycle,
}: {
  mesocycle: Doc<'mesocycles'>
  patterns?: Array<Doc<'patterns'>>
  onActivate?: () => void
  hasActiveMesocycle?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mesocycle._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {mesocycle.status !== 'active' && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}
      <MesocycleCard
        mesocycle={mesocycle}
        patterns={patterns}
        onActivate={onActivate}
        hasActiveMesocycle={hasActiveMesocycle}
      />
    </div>
  )
}

export function MesocycleList({
  mesocycles,
  patterns,
  onActivate,
  onConclude,
  userId,
  hasActiveMesocycle,
  activeWorkout,
}: MesocycleListProps) {
  const reorderMesocycles = useMutation(api.mesocycles.reorderMesocycles)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Separate active and inactive mesocycles
  const activeMesocycle = mesocycles.find((m) => m.status === 'active')
  const inactiveMesocycles = mesocycles.filter((m) => m.status !== 'active')

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = inactiveMesocycles.findIndex((m) => m._id === active.id)
    const newIndex = inactiveMesocycles.findIndex((m) => m._id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const reordered = arrayMove(inactiveMesocycles, oldIndex, newIndex)

    // Update order field for each mesocycle
    const mesocycleOrders = reordered.map((mesocycle, index) => ({
      mesocycleId: mesocycle._id,
      order: index,
    }))

    try {
      await reorderMesocycles({
        userId,
        mesocycleOrders,
      })
    } catch {
      alert('Failed to reorder mesocycles. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Active mesocycle - fixed at top */}
      {activeMesocycle && (
        <MesocycleCard
          mesocycle={activeMesocycle}
          patterns={patterns}
          onConclude={
            onConclude ? () => onConclude(activeMesocycle._id) : undefined
          }
          userId={userId}
          activeWorkout={activeWorkout}
        />
      )}

      {/* Inactive mesocycles - sortable */}
      {inactiveMesocycles.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            void handleDragEnd(event)
          }}
        >
          <SortableContext
            items={inactiveMesocycles.map((m) => m._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 pl-8">
              {inactiveMesocycles.map((mesocycle) => (
                <SortableMesocycleCard
                  key={mesocycle._id}
                  mesocycle={mesocycle}
                  patterns={patterns}
                  onActivate={
                    onActivate ? () => onActivate(mesocycle._id) : undefined
                  }
                  hasActiveMesocycle={hasActiveMesocycle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
