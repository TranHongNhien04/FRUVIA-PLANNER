import { firestoreDb } from '@/config/FirebaseConfig'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { addDoc, collection, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'

type Task = {
  id?: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: number;
}

type Project = {
  id?: string;
  title: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: number;
}

export default function Project() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    members: []
  })
  const { user } = useUser()

  // Fetch projects
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(firestoreDb, 'projects'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const projectList: Project[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          projectList.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            createdBy: data.createdBy || '',
            members: data.members || [],
            createdAt: data.createdAt || Date.now(),
          });
        });
        setProjects(projectList);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up project listener:', error);
      setError('Failed to load projects');
      setLoading(false);
    }
  }, [user]);

  // Fetch tasks for all projects
  useEffect(() => {
    if (!user || projects.length === 0) return;

    try {
      const tasksCollection = collection(firestoreDb, 'tasks');
      const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
        const newTasksByProject: Record<string, Task[]> = {};
        
        snapshot.forEach((doc) => {
          const taskData = doc.data() as Task;
          const projectId = taskData.projectId;
          
          if (!newTasksByProject[projectId]) {
            newTasksByProject[projectId] = [];
          }
          
          newTasksByProject[projectId].push({
            id: doc.id,
            ...taskData
          });
        });
        
        setProjectTasks(newTasksByProject);
      }, (error) => {
        console.error('Error fetching tasks:', error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up tasks listener:', error);
    }
  }, [user, projects]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      // Delete all tasks associated with the project
      const projectTasks = projectTasks[projectId] || [];
      await Promise.all(
        projectTasks.map(task => 
          deleteDoc(doc(firestoreDb, 'tasks', task.id!))
        )
      );

      // Delete the project
      await deleteDoc(doc(firestoreDb, 'projects', projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      Alert.alert('Error', 'Failed to delete project');
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    projectId: string
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Project',
            'Are you sure you want to delete this project? All tasks will be deleted too.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Delete', 
                style: 'destructive',
                onPress: () => handleDeleteProject(projectId)
              }
            ]
          );
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const handleCreateProject = async () => {
    if (!user || !newProject.title || !newProject.description) return

    try {
      const projectData: Omit<Project, 'id'> = {
        title: newProject.title,
        description: newProject.description,
        createdBy: user.id,
        members: [user.id],
        createdAt: Date.now()
      }

      const projectRef = await addDoc(collection(firestoreDb, 'projects'), projectData)
      
      setIsModalVisible(false)
      setNewProject({ title: '', description: '', members: [] })
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Project List */}
      {loading ? (
        <ActivityIndicator size="large" color="#228B22" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No projects yet</Text>
          <Text style={styles.emptySubText}>Tap + to create your first project</Text>
        </View>
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ScrollView style={styles.projectList}>
            {projects.map((project) => (
              <Swipeable
                key={project.id}
                renderRightActions={(progress, dragX) => 
                  renderRightActions(progress, dragX, project.id!)
                }
              >
                <View style={styles.projectCard}>
                  <TouchableOpacity 
                    onPress={() => {/* TODO: Navigate to project detail */}}
                  >
                    <View style={styles.projectHeader}>
                      <Text style={styles.projectTitle}>{project.title}</Text>
                      <Text style={styles.taskCount}>
                        {projectTasks[project.id!]?.length || 0} tasks
                      </Text>
                    </View>
                    <Text style={styles.projectDescription}>{project.description}</Text>
                    <View style={styles.projectFooter}>
                      <Text style={styles.memberCount}>{project.members.length} members</Text>
                      <Text style={styles.projectDate}>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </Swipeable>
            ))}
          </ScrollView>
        </GestureHandlerRootView>
      )}

      {/* Add Project Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Project</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Project Title"
              value={newProject.title}
              onChangeText={(text) => setNewProject(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Project Description"
              value={newProject.description}
              onChangeText={(text) => setNewProject(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.createButton]}
                onPress={handleCreateProject}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#228B22',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectList: {
    flex: 1,
    padding: 15,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
  },
  projectDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
  },
  projectDate: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  createButton: {
    backgroundColor: '#228B22',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: '#fff',
  },
})