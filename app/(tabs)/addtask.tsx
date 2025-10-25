import { firestoreDb } from '@/config/FirebaseConfig'
import { useUser } from '@clerk/clerk-expo'
import * as ExpoRouter from 'expo-router'
import { addDoc, collection } from 'firebase/firestore'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const categories = ['Công việc', 'Học tập', 'Cá nhân']

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

export default function AddTask() {
  const { user } = useUser()
  // Call useSearchParams safely — some runtime setups may not expose it as a function.
  const _useSearchParams: any = (ExpoRouter as any).useSearchParams ?? (() => ({}))
  const router: any = (ExpoRouter as any).router ?? (ExpoRouter as any).default?.router
  const searchParams = _useSearchParams()
  // date in YYYY-MM-DD format passed from Calendar (optional)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState<Date>(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysArray: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // Add days from previous month to start on Sunday
    const firstDay = firstDayOfMonth.getDay();
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      daysArray.push({ date, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      daysArray.push({ date, isCurrentMonth: true });
    }
    
    // Add days from next month to complete the calendar grid
    const remainingDays = 42 - daysArray.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      daysArray.push({ date, isCurrentMonth: false });
    }
    
    return daysArray;
  };
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Công việc')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề task')
      return
    }

    setLoading(true)
    setError('')

    try {
      // createdAt is the timestamp when the task is created
      const createdAtMillis = Date.now()
      // scheduledAt is the date the user wants the task to be scheduled for (optional)
      const scheduledAtMillis = selectedDate ? new Date(selectedDate).getTime() : null

      const taskData: any = {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        status: 'todo',
        assignedTo: user?.id,
        createdAt: createdAtMillis,
      }

      if (scheduledAtMillis) {
        taskData.scheduledAt = scheduledAtMillis
      }

      await addDoc(collection(firestoreDb, 'tasks'), taskData)
      router.back()
    } catch (err) {
      console.error('Failed to create task:', err)
      setError('Không thể tạo task. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // initialize selected date from params if provided
  React.useEffect(() => {
    const d = searchParams?.date
    if (!d) return
    const parsed = Date.parse(String(d))
    if (!Number.isNaN(parsed)) {
      setSelectedDate(new Date(parsed))
    }
  }, [searchParams])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thêm Task Mới</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tiêu đề</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Nhập tiêu đề task"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Nhập mô tả chi tiết (không bắt buộc)"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phân loại</Text>
          <View style={styles.categories}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryBtn,
                  category === selectedCategory && styles.categoryBtnSelected,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === selectedCategory && styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngày lên lịch</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              {selectedDate ? formatDate(selectedDate) : 'Chọn ngày (tùy chọn)'}
            </Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Tạo Task</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showDatePicker} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity 
                style={styles.monthButton}
                onPress={() => setPickerMonth(d => {
                  const newDate = new Date(d)
                  newDate.setMonth(d.getMonth() - 1)
                  return newDate
                })}
              >
                <Text style={styles.monthButtonText}>←</Text>
              </TouchableOpacity>
              
              <Text style={styles.monthText}>
                {pickerMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity 
                style={styles.monthButton}
                onPress={() => setPickerMonth(d => {
                  const newDate = new Date(d)
                  newDate.setMonth(d.getMonth() + 1)
                  return newDate
                })}
              >
                <Text style={styles.monthButtonText}>→</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekHeader}>
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                <Text key={day} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.calendar}>
              {getDaysInMonth(pickerMonth.getFullYear(), pickerMonth.getMonth()).map((day, i) => {
                const isSelected = selectedDate && 
                  day.date.getDate() === selectedDate.getDate() &&
                  day.date.getMonth() === selectedDate.getMonth() &&
                  day.date.getFullYear() === selectedDate.getFullYear()
                  
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.calendarDay,
                      !day.isCurrentMonth && styles.calendarDayOutside,
                      isSelected && styles.calendarDaySelected,
                    ]}
                    onPress={() => {
                      setSelectedDate(day.date)
                      setShowDatePicker(false)
                    }}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      !day.isCurrentMonth && styles.calendarDayTextOutside,
                      isSelected && styles.calendarDayTextSelected,
                    ]}>
                      {day.date.getDate()}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setSelectedDate(null)
                  setShowDatePicker(false)
                }}
              >
                <Text style={styles.modalButtonTextDanger}>Xoá ngày</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  datePickerButtonText: {
    color: '#333',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    padding: 16,
  },
  calendar: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalButtonTextDanger: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  categoryBtnSelected: {
    backgroundColor: '#228B22',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#228B22',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  monthButton: {
    padding: 10,
  },
  monthButtonText: {
    fontSize: 20,
    color: '#000',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#000',
  },
  calendarDayOutside: {
    opacity: 0.4,
  },
  calendarDayTextOutside: {
    color: '#666',
  },
  calendarDaySelected: {
    backgroundColor: '#228B22',
    borderRadius: 20,
  },
  calendarDayTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
})

