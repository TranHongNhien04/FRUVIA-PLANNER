import { firestoreDb } from '@/config/FirebaseConfig'
import Colors from '@/shared/Colors'
import { useUser } from '@clerk/clerk-expo'
import { collection, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Task = {
  id?: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: number;
}

export default function Home() {
  const { user } = useUser()
  const [userName, setUserName] = useState('User')
  const [userImage, setUserImage] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const firstName = user.firstName || 'User'
      setUserName(firstName)
      if (user.imageUrl) {
        setUserImage(user.imageUrl)
      }
    }
  }, [user])

  // Fetch tasks from Firebase
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const tasksCollection = collection(firestoreDb, 'tasks')
      const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
        const taskList: Task[] = []
        snapshot.forEach((doc) => {
          const taskData = doc.data() as Task
          taskList.push({
            id: doc.id,
            ...taskData
          })
        })
        // Filter tasks with 'todo' status
        const todoTasks = taskList.filter(task => task.status === 'todo')
        setTasks(todoTasks)
        setLoading(false)
      }, (error) => {
        console.error('Error fetching tasks:', error)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Error setting up tasks listener:', error)
      setLoading(false)
    }
  }, [user])

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.imageContainer}>
              {/* Avatar ring */}
              <View style={styles.avatarRing}>
                {userImage ? (
                  <Image
                    source={{ uri: userImage }}
                    style={styles.userImage}
                  />
                ) : (
                  <View style={styles.userImagePlaceholder}>
                    <Text style={styles.placeholderText}>
                      {userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hello {userName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {tasks.length > 0 ? 'Công việc hôm nay' : 'Không có công việc cho hôm nay'}
          </Text>

          {tasks.length > 0 && (
            <View style={styles.tasksContainer}>
              {tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={[
                      styles.statusBadge,
                      task.status === 'todo' && styles.statusTodo,
                      task.status === 'in-progress' && styles.statusInProgress,
                      task.status === 'completed' && styles.statusCompleted
                    ]}>
                      <Text style={styles.statusText}>
                        {task.status === 'todo' ? 'Chưa làm' :
                         task.status === 'in-progress' ? 'Đang làm' : 'Hoàn thành'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    height: '33%',
    backgroundColor: Colors.XANHLA,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  imageContainer: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 0,
  },
  userImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.XANHLA,
  },
  greetingContainer: {
    flex: 0.65,
    justifyContent: 'center',
    
  },
  greetingText: {
    fontSize: 25,
    color: Colors.BACKGROUND,
    fontWeight: '500',
    marginBottom: 5,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: Colors.TAB_INACTIVE,
    fontStyle: 'italic',
  },
  contentSection: {
    padding: 20,
    minHeight: 400,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 15,
  },
  tasksContainer: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.XANHLA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusTodo: {
    backgroundColor: '#FFE5B4',
  },
  statusInProgress: {
    backgroundColor: '#B4D7FF',
  },
  statusCompleted: {
    backgroundColor: '#B4FFB4',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.CONTENT,
    lineHeight: 20,
  },
})