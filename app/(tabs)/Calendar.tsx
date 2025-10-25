import { firestoreDb } from '@/config/FirebaseConfig'
import { useUser } from '@clerk/clerk-expo'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'

type Task = {
  id?: string
  projectId?: string
  title: string
  description?: string
  assignedTo?: string
  status: 'todo' | 'in-progress' | 'completed'
  category: 'Công việc' | 'Học tập' | 'Cá nhân'
  createdAt: any
}

const statusColors: Record<string, string> = {
  todo: '#FFD8A8', // light orange
  'in-progress': '#BDE0FE', // light blue
  completed: '#D1F7C4', // light green
}

function formatDateKey(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getMillisFromCreatedAt(createdAt: any) {
  if (!createdAt) return Date.now()
  // Firestore Timestamp
  if (typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
    return createdAt.toDate().getTime()
  }
  if (typeof createdAt === 'number') return createdAt
  // fallback
  const parsed = Date.parse(String(createdAt))
  return Number.isNaN(parsed) ? Date.now() : parsed
}

export default function Calendar() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({})
  const [selectedDateKey, setSelectedDateKey] = useState<string>(formatDateKey(new Date()))

  // subscribe to tasks assigned to the user
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const tasksCol = collection(firestoreDb, 'tasks')
      const q = query(tasksCol, where('assignedTo', '==', user.id))
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const grouped: Record<string, Task[]> = {}
          snapshot.forEach((doc) => {
            const data = doc.data() as Task
            const millis = getMillisFromCreatedAt(data.createdAt)
            const key = formatDateKey(new Date(millis))
            if (!grouped[key]) grouped[key] = []
            grouped[key].push({ id: doc.id, ...data })
          })
          setTasksByDate(grouped)
          setLoading(false)
        },
        (err) => {
          console.error('Tasks snapshot error', err)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('Failed to subscribe to tasks', err)
      setLoading(false)
    }
  }, [user])

  // build a week window centered on selected date (3 days before/after)
  const weekDates = useMemo(() => {
    const center = new Date(selectedDateKey)
    const list: Date[] = []
    for (let i = -3; i <= 3; i++) {
      const d = new Date(center)
      d.setDate(center.getDate() + i)
      list.push(d)
    }
    return list
  }, [selectedDateKey])

  const tasksForSelected = tasksByDate[selectedDateKey] || []

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ngày hôm nay</Text>
        <Text style={styles.subTitle}>Công việc của bạn</Text>
      </View>

      <View style={styles.monthBar}>
        <Text style={styles.monthText}>{new Date(selectedDateKey).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</Text>
      </View>

      <View style={styles.weekRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
          {weekDates.map((d) => {
            const key = formatDateKey(d)
            const isSelected = key === selectedDateKey
            return (
              <TouchableOpacity
                key={key}
                style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                onPress={() => setSelectedDateKey(key)}
              >
                <Text style={[styles.dayName]}>{d.toLocaleString(undefined, { weekday: 'short' })}</Text>
                <Text style={[styles.dayNumber, isSelected && { color: '#fff' }]}>{d.getDate()}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#228B22" />
        ) : tasksForSelected.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks for this day</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 15 }}>
            {tasksForSelected.map((task) => (
              <View key={task.id} style={[styles.taskCard, { backgroundColor: statusColors[task.status] || '#eee' }]}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.description ? <Text style={styles.taskDesc}>{task.description}</Text> : null}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  subTitle: { color: '#666', marginTop: 4 },
  monthBar: { paddingHorizontal: 20, paddingVertical: 8 },
  monthText: { fontSize: 16, fontWeight: '600', color: '#333' },
  weekRow: { height: 90, paddingVertical: 10 },
  dayButton: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: { backgroundColor: '#228B22' },
  dayName: { fontSize: 12, color: '#666' },
  dayNumber: { fontSize: 18, fontWeight: '700', color: '#111' },
  listContainer: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999' },
  taskCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  taskTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  taskDesc: { color: '#444' },
})

