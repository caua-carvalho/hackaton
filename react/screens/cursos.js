import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'http://hospedagem-hackathon7.infinityfreeapp.com/api/adm/cursos';
const PERIODS = [
  { label: 'Integral (Manhã)', value: 'Integral-Manha' },
  { label: 'Integral (Noite)', value: 'Integral-Noite' },
  { label: 'Modular (Noite)', value: 'Modular-Noite' }
];

const CoursesScreen = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [name, setName] = useState('');
  const [period, setPeriod] = useState(PERIODS[0].value);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cursos.php`);
      const json = await res.json();
      setCourses(json.cursos || []);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setName(course.nome);
      setPeriod(course.periodo);
    } else {
      setEditingCourse(null);
      setName('');
      setPeriod(PERIODS[0].value);
    }
    setModalVisible(true);
  };

  const saveCourse = async () => {
    if (!name.trim()) {
      Alert.alert('Validação', 'Informe o nome do curso');
      return;
    }
    try {
      const payload = { nome: name, periodo: period };
      const url = editingCourse
        ? `${API_URL}/curso_update.php`
        : `${API_URL}/curso_create.php`;
      if (editingCourse) payload.id = editingCourse.id;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchCourses();
        setModalVisible(false);
      } else {
        Alert.alert('Erro', data.message || 'Falha ao salvar');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha na comunicação');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.itemTitle}>{item.nome}</Text>
        <Text style={styles.itemSubtitle}>{item.periodo}</Text>
      </View>
      <TouchableOpacity onPress={() => openModal(item)} style={styles.editButton}>
        <Text style={styles.editText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b20000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text>Nenhum curso cadastrado.</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>  
        <Text style={styles.addButtonText}>+ Novo Curso</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCourse ? 'Editar Curso' : 'Novo Curso'}
            </Text>
            <TextInput
              placeholder="Nome do Curso"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <Picker
              selectedValue={period}
              onValueChange={setPeriod}
              style={styles.picker}
            >
              {PERIODS.map((p) => (
                <Picker.Item key={p.value} label={p.label} value={p.value} />
              ))}
            </Picker>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={saveCourse} style={styles.saveButton}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  list: { paddingBottom: 80 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    elevation: 1
  },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemSubtitle: { fontSize: 12, color: '#666' },
  editButton: { justifyContent: 'center' },
  editText: { color: '#b20000', fontWeight: '500' },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#b20000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 10, marginBottom: 12 },
  picker: { marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { marginRight: 12 },
  saveText: { color: '#b20000', fontWeight: '500' },
  cancelButton: {},
  cancelText: { color: '#666' }
});

export default CoursesScreen;
