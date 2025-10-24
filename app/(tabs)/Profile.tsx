import { useAuth, useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'

export default function Profile() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [smartNotifications, setSmartNotifications] = useState(true)
  const [googleCalendarSync, setGoogleCalendarSync] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user?.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }} 
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{user?.fullName || 'User Name'}</Text>
        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress || 'email@example.com'}</Text>
      </View>

      {/* Settings & Personalization */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Cài đặt & Cá nhân hóa Trải nghiệm</Text>

        {/* Dark Mode */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={24} color="#228B22" />
            <Text style={styles.settingLabel}>Chế độ tối (Dark Mode)</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#e0e0e0', true: '#81c784' }}
            thumbColor={darkMode ? '#228B22' : '#f4f3f4'}
          />
        </View>

        {/* Smart Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="sparkles-outline" size={24} color="#228B22" />
            <Text style={styles.settingLabel}>Gợi ý thời gian thông minh</Text>
          </View>
          <Switch
            value={smartNotifications}
            onValueChange={setSmartNotifications}
            trackColor={{ false: '#e0e0e0', true: '#81c784' }}
            thumbColor={smartNotifications ? '#228B22' : '#f4f3f4'}
          />
        </View>

        {/* Google Calendar Sync */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="swap-horizontal-outline" size={24} color="#228B22" />
            <Text style={styles.settingLabel}>Đồng bộ Google Calendar</Text>
          </View>
          <Switch
            value={googleCalendarSync}
            onValueChange={setGoogleCalendarSync}
            trackColor={{ false: '#e0e0e0', true: '#81c784' }}
            thumbColor={googleCalendarSync ? '#228B22' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.optionButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 50,
    paddingVertical: 20,
    backgroundColor: '#228B22',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#228B22',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 10,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#228B22',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionButtonText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#FF3B30',
    fontWeight: '500',
  },
})