import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id, Doc } from '../../../convex/_generated/dataModel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp, Activity, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/history/')({
  component: History,
})

function History() {
  const { userId, isPending } = useAuth()

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <HistoryContent userId={userId!} />
    </ProtectedRoute>
  )
}

function HistoryContent({ userId }: { userId: string }) {
  const [selectedView, setSelectedView] = useState<'list' | 'calendar' | 'charts'>('list')
  const [expandedWorkout, setExpandedWorkout] = useState<Id<"workouts"> | null>(null)
  const workouts = useQuery(api.workouts.getAllWorkouts, { userId })
  const mesocycles = useQuery(api.mesocycles.getAllMesocycles, { userId })
  const patterns = useQuery(api.patterns.getAll)
  const exercises = useQuery(api.exercises.getAll)
  
  // Get sets for expanded workout
  const expandedWorkoutSets = useQuery(
    api.sets.getSetsForWorkout,
    expandedWorkout ? { workoutId: expandedWorkout } : "skip"
  )

  // Format workout date
  const formatWorkoutDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }
  }

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  }

  // Calculate workout duration
  const getWorkoutDuration = (workout: NonNullable<typeof workouts>[0]) => {
    if (!workout.startedAt || !workout.completedAt) return null
    const durationMs = workout.completedAt - workout.startedAt
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get workouts grouped by date for calendar
  const workoutsByDate = workouts?.reduce((acc, workout) => {
    const dateKey = new Date(workout.date).toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(workout)
    return acc
  }, {} as Record<string, typeof workouts>) || {}


  // Calendar view: Get dates for current month
  const getCalendarDates = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const dates: Array<{ date: Date; hasWorkout: boolean; workoutCount: number }> = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      dates.push({ date: new Date(year, month, -startingDayOfWeek + i + 1), hasWorkout: false, workoutCount: 0 })
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateKey = date.toDateString()
      const workoutCount = workoutsByDate[dateKey]?.length || 0
      dates.push({ 
        date, 
        hasWorkout: workoutCount > 0, 
        workoutCount 
      })
    }

    return dates
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Workout History</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No workout history yet. Start your first workout to see your progress here!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workout History</h1>
        <p className="text-muted-foreground">View your training progress and statistics</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedView('list')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[48px] ${
            selectedView === 'list'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground active:bg-muted/80'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setSelectedView('calendar')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[48px] ${
            selectedView === 'calendar'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground active:bg-muted/80'
          }`}
        >
          Calendar View
        </button>
        <button
          onClick={() => setSelectedView('charts')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[48px] ${
            selectedView === 'charts'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground active:bg-muted/80'
          }`}
        >
          Charts
        </button>
      </div>

      {/* List View */}
      {selectedView === 'list' && (
        <div className="space-y-4">
          {workouts.map((workout) => {
            const mesocycle = mesocycles?.find(m => m._id === workout.mesocycleId)
            const duration = getWorkoutDuration(workout)
            const isExpanded = expandedWorkout === workout._id
            const workoutSets = isExpanded ? expandedWorkoutSets : null
            
            // Calculate stats if sets are loaded
            const stats = workoutSets ? {
              totalSets: workoutSets.length,
              totalVolume: workoutSets.reduce((sum, s) => sum + (s.weight * s.reps), 0),
              exercises: new Set(workoutSets.map(s => s.exerciseId)).size,
            } : null
            
            return (
              <Card key={workout._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {formatWorkoutDate(workout.date)}
                      </CardTitle>
                      <CardDescription>
                        {formatTime(workout.date)}
                        {mesocycle && ` • Week ${workout.weekNumber} of ${mesocycle.durationWeeks}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {duration && (
                        <Badge variant="secondary">
                          <Activity className="w-3 h-3 mr-1" />
                          {duration}
                        </Badge>
                      )}
                      <button
                        onClick={() => setExpandedWorkout(isExpanded ? null : workout._id)}
                        className="p-2 active:bg-muted rounded-md transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {mesocycle && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {patterns?.find(p => mesocycle.primaryPatterns.includes(p._id))?.displayName || 'Mesocycle'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {mesocycle.targetSetsPerWeek} sets/week • {mesocycle.sessionsPerWeek} sessions/week
                      </span>
                    </div>
                  )}
                  {stats && (
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <div className="text-2xl font-bold">{stats.totalSets}</div>
                        <div className="text-xs text-muted-foreground">Total Sets</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{Math.round(stats.totalVolume)}</div>
                        <div className="text-xs text-muted-foreground">Total Volume (kg)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.exercises}</div>
                        <div className="text-xs text-muted-foreground">Exercises</div>
                      </div>
                    </div>
                  )}
                  {isExpanded && workoutSets && workoutSets.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Sets</h4>
                      
                      {/* Group sets by pattern, then by exercise (same as workout overview) */}
                      {(() => {
                        // Group sets by pattern, then by exercise
                        const groupedByPattern = workoutSets.reduce((acc, set) => {
                          const exercise = exercises?.find(e => e._id === set.exerciseId)
                          const pattern = patterns?.find(p => p._id === set.patternId)
                          
                          if (!exercise || !pattern) return acc

                          if (!acc[set.patternId]) {
                            acc[set.patternId] = {
                              patternId: set.patternId,
                              patternName: pattern.displayName,
                              exercises: {},
                            }
                          }

                          if (!acc[set.patternId].exercises[set.exerciseId]) {
                            acc[set.patternId].exercises[set.exerciseId] = {
                              exerciseId: set.exerciseId,
                              exerciseName: exercise.name,
                              sets: [],
                            }
                          }

                          acc[set.patternId].exercises[set.exerciseId].sets.push(set)
                          return acc
                        }, {} as Record<Id<"patterns">, {
                          patternId: Id<"patterns">
                          patternName: string
                          exercises: Record<Id<"exercises">, {
                            exerciseId: Id<"exercises">
                            exerciseName: string
                            sets: typeof workoutSets
                          }>
                        }>)

                        return (
                          <div className="space-y-4">
                            {Object.values(groupedByPattern).map((patternGroup) => {
                              const patternSets = Object.values(patternGroup.exercises).flatMap(e => e.sets)
                              const patternTotalSets = patternSets.length
                              
                              return (
                                <div key={patternGroup.patternId} className="space-y-2">
                                  {/* Pattern Header */}
                                  <div className="flex items-center justify-between pb-1 border-b">
                                    <h5 className="text-sm font-semibold">{patternGroup.patternName}</h5>
                                    <div className="text-xs text-muted-foreground">
                                      {patternTotalSets} {patternTotalSets === 1 ? 'set' : 'sets'}
                                    </div>
                                  </div>

                                  {/* Exercises in this pattern */}
                                  <div className="space-y-2 ml-2">
                                    {Object.values(patternGroup.exercises).map((exerciseGroup) => (
                                      <div key={exerciseGroup.exerciseId} className="space-y-1">
                                        <div className="text-xs font-medium text-muted-foreground">
                                          {exerciseGroup.exerciseName}
                                        </div>
                                        <div className="space-y-1">
                                          {exerciseGroup.sets
                                            .sort((a, b) => a.orderInWorkout - b.orderInWorkout)
                                            .map((set) => (
                                              <div
                                                key={set._id}
                                                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                                              >
                                                <div className="flex items-center gap-3">
                                                  <span className="font-medium w-8">#{set.orderInWorkout}</span>
                                                  <div className="font-medium">
                                                    {set.weight}kg × {set.reps} reps
                                                  </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                  {Math.round(set.weight * set.reps)}kg
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Calendar View */}
      {selectedView === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Workout Calendar
            </CardTitle>
            <CardDescription>
              Days with workouts are highlighted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {getCalendarDates().map((item, index) => (
                <div
                  key={index}
                  className={`aspect-square p-1 ${
                    item.hasWorkout
                      ? 'bg-primary/20 rounded-md flex items-center justify-center'
                      : ''
                  }`}
                >
                  <div className={`text-sm ${item.hasWorkout ? 'font-semibold' : 'text-muted-foreground'}`}>
                    {item.date.getDate()}
                  </div>
                  {item.hasWorkout && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-0.5" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary/20 rounded" />
                  <span className="text-muted-foreground">Workout day</span>
                </div>
                <div className="text-muted-foreground">
                  Total workouts: <span className="font-semibold">{workouts.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts View */}
      {selectedView === 'charts' && workouts !== undefined && (
        <ChartsView 
          userId={userId}
          workouts={workouts}
          mesocycles={mesocycles}
          patterns={patterns}
          exercises={exercises}
        />
      )}
    </div>
  )
}

function ChartsView({ 
  userId, 
  workouts, 
  mesocycles, 
  patterns, 
  exercises 
}: { 
  userId: string
  workouts: Doc<"workouts">[] | undefined
  mesocycles: Doc<"mesocycles">[] | undefined
  patterns: Doc<"patterns">[] | undefined
  exercises: Doc<"exercises">[] | undefined
}) {
  // Get all sets for user to calculate mesocycle comparison and filter exercises
  const allSets = useQuery(api.sets.getAllSetsForUser, { userId })

  // Filter exercises to only show ones the user has performed
  const performedExercises = useMemo(() => {
    if (!exercises || !allSets) return []
    const exerciseIdsWithSets = new Set(allSets.map((s: NonNullable<typeof allSets>[0]) => s.exerciseId))
    return exercises.filter((e: Doc<"exercises">) => exerciseIdsWithSets.has(e._id))
  }, [exercises, allSets])

  // Initialize state with first available value to keep Select controlled
  const initialExerciseId = performedExercises.length > 0 ? performedExercises[0]._id : undefined
  const initialPatternId = patterns && patterns.length > 0 ? patterns[0]._id : undefined
  
  const [selectedExerciseId, setSelectedExerciseId] = useState<Id<"exercises"> | undefined>(initialExerciseId)
  const [selectedPatternId, setSelectedPatternId] = useState<Id<"patterns"> | undefined>(initialPatternId)

  // Get exercise progress data
  const exerciseProgress = useQuery(
    api.sets.getExerciseProgress,
    selectedExerciseId ? { exerciseId: selectedExerciseId, userId } : "skip"
  )

  // Get pattern volume data
  const patternVolume = useQuery(
    api.sets.getPatternVolume,
    selectedPatternId ? { patternId: selectedPatternId, userId } : "skip"
  )

  // Prepare exercise progress chart data
  const exerciseChartData = useMemo(() => {
    if (!exerciseProgress || exerciseProgress.length === 0) return []
    
    // Sort by date to ensure chronological order
    const sorted = [...exerciseProgress].sort((a, b) => a.date - b.date)
    
    const chartData = sorted.map((item) => {
      const dateObj = new Date(item.date)
      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateValue: item.date, // Numeric timestamp for X-axis
        weight: item.avgWeight,
        reps: item.avgReps,
        volume: item.totalVolume,
        sets: item.setCount,
      }
    })
    
    return chartData
  }, [exerciseProgress])

  // Prepare pattern volume chart data
  const patternChartData = useMemo(() => {
    if (!patternVolume || patternVolume.length === 0) return []
    
    return patternVolume.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: item.totalVolume,
      sets: item.sets,
    }))
  }, [patternVolume])

  // Prepare mesocycle comparison data
  const mesocycleComparisonData = useMemo(() => {
    if (!mesocycles || !allSets || !patterns || mesocycles.length < 2) return []
    
    return mesocycles
      .filter((m: Doc<"mesocycles">) => m.status === 'completed' || m.status === 'active')
      .map((mesocycle: Doc<"mesocycles">) => {
        const mesocycleSets = allSets.filter((set: NonNullable<typeof allSets>[0]) => {
          const workout = workouts?.find((w: Doc<"workouts">) => w._id === set.workoutId)
          return workout?.mesocycleId === mesocycle._id
        })
        
        const totalVolume = mesocycleSets.reduce((sum: number, s: NonNullable<typeof allSets>[0]) => sum + (s.weight * s.reps), 0)
        const totalSets = mesocycleSets.length
        const avgVolumePerWorkout = workouts 
          ? (() => {
              const mesocycleWorkouts = workouts.filter((w: Doc<"workouts">) => w.mesocycleId === mesocycle._id && w.completed)
              return mesocycleWorkouts.length > 0 ? totalVolume / mesocycleWorkouts.length : 0
            })()
          : 0

        // Create name from primary patterns
        const primaryPatternNames = mesocycle.primaryPatterns
          .map((patternId: Id<"patterns">) => patterns?.find((p: Doc<"patterns">) => p._id === patternId)?.displayName)
          .filter(Boolean)
          .join(' + ')
        
        const name = mesocycle.name || primaryPatternNames || `Mesocycle ${mesocycle._id.slice(-6)}`

        return {
          name,
          totalVolume,
          totalSets,
          avgVolumePerWorkout,
          duration: mesocycle.durationWeeks,
        }
      })
  }, [mesocycles, allSets, workouts, patterns])

  // Update selection when data loads (only if not already set)
  useEffect(() => {
    if (!selectedExerciseId && performedExercises.length > 0) {
      setSelectedExerciseId(performedExercises[0]._id)
    }
  }, [performedExercises, selectedExerciseId])

  useEffect(() => {
    if (!selectedPatternId && patterns && patterns.length > 0) {
      setSelectedPatternId(patterns[0]._id)
    }
  }, [patterns, selectedPatternId])


  const exerciseChartConfig = {
    volume: {
      label: "Total Volume (kg)",
      color: "#000000",
    },
  } satisfies ChartConfig

  const patternChartConfig = {
    volume: {
      label: "Total Volume (kg)",
      color: "hsl(var(--chart-1))",
    },
    sets: {
      label: "Sets",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Pattern Volume Chart - First */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Pattern Volume Tracking
              </CardTitle>
              <CardDescription>
                Track total volume and sets per workout for a movement pattern
              </CardDescription>
            </div>
            {patterns && patterns.length > 0 && (
              <Select
                value={selectedPatternId || ""}
                onValueChange={(value) => setSelectedPatternId(value as Id<"patterns">)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {patterns?.map((pattern: Doc<"patterns">) => (
                    <SelectItem key={pattern._id} value={pattern._id}>
                      {pattern.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {patternChartData.length > 0 ? (
            <ChartContainer config={patternChartConfig}>
              <BarChart data={patternChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  yAxisId="left"
                  dataKey="volume" 
                  fill="var(--color-volume)" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="sets" 
                  fill="var(--color-sets)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              {selectedPatternId 
                ? "No data available for this pattern yet"
                : "Select a pattern to view volume tracking"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Progress Chart - Second */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Exercise Progress
              </CardTitle>
              <CardDescription>
                Track total volume (sets × reps × weight) over time for a specific exercise
              </CardDescription>
            </div>
            {performedExercises.length > 0 && (
              <Select
                value={selectedExerciseId || ""}
                onValueChange={(value) => setSelectedExerciseId(value as Id<"exercises">)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {performedExercises.map((exercise: Doc<"exercises">) => (
                    <SelectItem key={exercise._id} value={exercise._id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {exerciseChartData.length > 0 ? (
            <>
              <ChartContainer config={exerciseChartConfig} className="min-h-[300px] w-full">
                <LineChart
                  accessibilityLayer
                  data={exerciseChartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                    type="category"
                  />
                  <YAxis />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    dataKey="volume"
                    name="volume"
                    type="linear"
                    stroke="var(--color-volume)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-volume)" }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ChartContainer>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              {selectedExerciseId 
                ? "No data available for this exercise yet"
                : "Select an exercise to view progress"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mesocycle Comparison - Third */}
      {mesocycleComparisonData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Mesocycle Comparison
            </CardTitle>
            <CardDescription>
              Compare total volume and sets across completed mesocycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              totalVolume: { label: "Total Volume (kg)", color: "hsl(var(--chart-1))" },
              totalSets: { label: "Total Sets", color: "hsl(var(--chart-2))" },
            }}>
              <BarChart data={mesocycleComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  yAxisId="left"
                  dataKey="totalVolume" 
                  fill="var(--color-totalVolume)" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="totalSets" 
                  fill="var(--color-totalSets)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
