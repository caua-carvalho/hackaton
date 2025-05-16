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
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';

// Cores do tema ETEC
const PRIMARY_COLOR = '#b20000';       // Vermelho principal
const ACCENT_DARK = '#2e7d32';          // Verde escuro de acento
const ACCENT_LIGHT = '#81c784';         // Verde claro de acento
const BACKGROUND_COLOR = '#FAFAFA';     // Fundo geral
const SURFACE_COLOR = '#FFFFFF';        // Cards e modais
const TEXT_PRIMARY = '#283337';         // Texto principal
const TEXT_SECONDARY = '#666';          // Texto secundário

const API_URL = 'http://hospedagem-hackathon7.infinityfreeapp.com/api/adm/cursos';
const PERIODS = [
  { label: 'Integral (Manhã)', value: 'Integral-Manha' },
  { label: 'Integral (Noite)', value: 'Integral-Noite' },
  { label: 'Modular (Noite)', value: 'Modular-Noite' }
];

const CoursesScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [name, setName] = useState('');
  const [period, setPeriod] = useState(PERIODS[0].value);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Cursos',
      headerStyle: { backgroundColor: PRIMARY_COLOR, height: 56 },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
      headerLeft: () => (
        <Image
          source={require('../assets/etec_logo.png')}
          style={styles.logo}
        />
      ),
      headerLeftContainerStyle: { paddingLeft: 16 }
    });
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
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.nome}</Text>
        <Text style={styles.itemSubtitle}>{item.periodo}</Text>
      </View>
      <TouchableOpacity onPress={() => openModal(item)} style={styles.iconButton}>
        <MaterialIcons name="edit" size={24} color={ACCENT_DARK} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
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
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum curso cadastrado.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCourse ? 'Editar Curso' : 'Novo Curso'}
            </Text>
            <TextInput
              placeholder="Nome do Curso"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              style={styles.input}  // Contorno em verde padronizado
            />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={period}
                onValueChange={setPeriod}
                style={styles.picker}
              >
                {PERIODS.map((p) => (
                  <Picker.Item key={p.value} label={p.label} value={p.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={saveCourse} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCourse} style={styles.saveButton}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: 16,
    paddingBottom: 100
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_COLOR,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT_LIGHT
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 4
  },
  itemSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY
  },
  iconButton: {
    padding: 8
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: PRIMARY_COLOR,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4
  },
  emptyText: {
    textAlign: 'center',
    color: TEXT_SECONDARY,
    marginTop: 32
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    backgroundColor: SURFACE_COLOR,
    borderRadius: 8,
    padding: 24
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: ACCENT_DARK,  // contorno verde escuro padronizado
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: TEXT_PRIMARY,
    marginBottom: 16,
    backgroundColor: SURFACE_COLOR
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: ACCENT_DARK,  // contorno verde escuro padronizado
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24
  },
  picker: {
    height: 50,
    width: '100%'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginLeft: 12
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  cancelButton: {},
  cancelText: {
    color: ACCENT_DARK,
    fontSize: 14
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain'
  }
});

export default CoursesScreen;
