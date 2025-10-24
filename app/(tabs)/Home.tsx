import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'

// Circular Progress Component
const CircularProgress = ({ percentage, size = 80, strokeWidth = 3, color = '#FFFFFF' }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={[styles.projectPercentage, { position: 'absolute' }]}>{percentage}%</Text>
    </View>
  )
}

export default function Home() {
  const { user } = useUser()
  const [userName, setUserName] = useState('User')
  const [userImage, setUserImage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const firstName = user.firstName || 'User'
      setUserName(firstName)
      if (user.imageUrl) {
        setUserImage(user.imageUrl)
      }
    }
  }, [user])



  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerSection}>

        <View style={styles.avatarContainer}>
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

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>Hello {userName}</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >

        {/* My Tasks Section */}
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Task</Text>
            {/* <View style={styles.calendarIcon}>
              <Ionicons name="calendar" size={24} color="#FFFFFF" />
            </View> */}
          </View>

          <View style={styles.taskStatsContainer}>
            {/* To Do */}
            <View style={styles.taskStatCard}>
              <View style={[styles.statCircle, { backgroundColor: '#E85D75' }]}>
                <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statTitle}>To Do</Text>
                <Text style={styles.statCount}>5 tasks now. 1 started</Text>
              </View>
            </View>

            {/* In Progress */}
            <View style={styles.taskStatCard}>
              <View style={[styles.statCircle, { backgroundColor: '#F5A962' }]}>
                <Ionicons name="radio-button-off" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statTitle}>In Progress</Text>
                <Text style={styles.statCount}>1 tasks now. 1 started</Text>
              </View>
            </View>

            {/* Done */}
            <View style={styles.taskStatCard}>
              <View style={[styles.statCircle, { backgroundColor: '#4A90E2' }]}>
                <Ionicons name="checkmark-done-circle" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statTitle}>Done</Text>
                <Text style={styles.statCount}>18 tasks now. 13 started</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Projects Section */}
        <View style={styles.projectsSection}>
          <Text style={styles.sectionTitle}>Active Projects</Text>

          <View style={styles.projectsGrid}>
            {/* Project 1 */}
            <View style={[styles.projectCard, { backgroundColor: '#228B22' }]}>
              <CircularProgress percentage={25} size={80} strokeWidth={3} color="#FFFFFF" />
              <Text style={styles.projectName}>Bài tập lớn</Text>
              <Text style={styles.projectHours}>9 hours progress</Text>
            </View>

            {/* Project 2 */}
            <View style={[styles.projectCard, { backgroundColor: '#E85D75' }]}>
              <CircularProgress percentage={60} size={80} strokeWidth={3} color="#FFFFFF" />
              <Text style={styles.projectName}>Making History Notes</Text>
              <Text style={styles.projectHours}>20 hours progress</Text>
            </View>
          </View>

          <View style={styles.projectsGrid}>
            {/* Project 3 */}
            <View style={[styles.projectCard, { backgroundColor: '#4A90E2' }]}>
              <CircularProgress percentage={45} size={80} strokeWidth={3} color="#FFFFFF" />
              <Text style={styles.projectName}>Mobile App</Text>
              <Text style={styles.projectHours}>15 hours progress</Text>
            </View>

            {/* Project 4 */}
            <View style={[styles.projectCard, { backgroundColor: '#F5A962' }]}>
              <CircularProgress percentage={80} size={80} strokeWidth={3} color="#FFFFFF" />
              <Text style={styles.projectName}>Web Design</Text>
              <Text style={styles.projectHours}>32 hours progress</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: '#69bc66ff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    zIndex: 100,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRing: {
    height: 130,
    width: 130,
    borderRadius:70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#a1c4a3ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  userImage: {
    height: 120,
    width: 120,
    borderRadius:70,
    backgroundColor: '#E8E8E8',
  },
  userImagePlaceholder: {
    height: 120,
    width: 120,
    borderRadius:70,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#228B22',
  },
  profileInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#666666',
  },
  contentSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  calendarIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#228B22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskStatsContainer: {
    gap: 12,
  },
  taskStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statCount: {
    fontSize: 13,
    color: '#999999',
  },
  projectsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  projectsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  projectCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  projectHours: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
})