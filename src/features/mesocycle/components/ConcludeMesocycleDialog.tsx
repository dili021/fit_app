import type { Doc } from '@db/_generated/dataModel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConcludeMesocycleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesocycle: Doc<'mesocycles'> | null
  onConfirm: () => void
}

export function ConcludeMesocycleDialog({
  open,
  onOpenChange,
  mesocycle,
  onConfirm,
}: ConcludeMesocycleDialogProps) {
  const isMesocycleFinished = mesocycle
    ? (mesocycle.currentWeek ?? 0) >= mesocycle.durationWeeks
    : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="mt-6">
          <DialogTitle>
            {isMesocycleFinished
              ? 'Conclude Mesocycle?'
              : 'Conclude Mesocycle Early?'}
          </DialogTitle>
          <DialogDescription>
            {isMesocycleFinished ? (
              'This mesocycle has completed its duration. Conclude it to mark it as completed?'
            ) : (
              <>
                This mesocycle is not yet finished (Week{' '}
                {mesocycle?.currentWeek ?? 0} of {mesocycle?.durationWeeks ?? 0}
                ).
                <br />
                <strong>Are you sure you want to conclude it early?</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
          <Button variant="destructive" className="mb-2" onClick={onConfirm}>
            Conclude Mesocycle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
