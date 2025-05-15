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

const API_URL = 'http://hospedagem-hackathon7.infinityfreeapp.com/api/adm/disciplina';

const DisciplinasScreen = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [courses, setCourses] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nome, setNome] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [professorId, setProfessorId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [discRes, cursoRes, profRes] = await Promise.all([
        fetch(`${API_URL}/disciplinas.php`),
        fetch(`${API_URL}/cursos.php`),
        fetch(`${API_URL}/professores.php`),
      ]);
      const discJson = await discRes.json();
      const cursoJson = await cursoRes.json();
      const profJson = await profRes.json();

      setDisciplinas(discJson.disciplinas || []);
      setCourses(cursoJson.cursos || []);
      setProfessores(profJson.professores || []);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setNome(item.nome);
      setCursoId(item.curso_id.toString());
      setProfessorId(item.professor_id.toString());
    } else {
      setEditing(null);
      setNome('');
      setCursoId(courses[0]?.id.toString() || '');
      setProfessorId(professores[0]?.id.toString() || '');
    }
    setModalVisible(true);
  };

  const save = async () => {
    if (!nome.trim()) {
      Alert.alert('Validação', 'Informe o nome da disciplina');
      return;
    }
    if (!cursoId) {
      Alert.alert('Validação', 'Selecione um curso');
      return;
    }
    if (!professorId) {
      Alert.alert('Validação', 'Selecione um professor');
      return;
    }

    const payload = { nome, curso_id: cursoId, professor_id: professorId };
    let url = `${API_URL}/disciplina_create.php`;

    if (editing) {
      payload.id = editing.id;
      url = `${API_URL}/disciplina_update.php`;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchData();
        setModalVisible(false);
      } else {
        Alert.alert('Erro', data.message || 'Falha ao salvar disciplina');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha na comunicação');
    }
  };

  const renderItem = ({ item }) => {
    const curso = courses.find(c => c.id === item.curso_id);
    const prof = professores.find(p => p.id === item.professor_id);
    return (
      <View style={styles.item}>
        <View>
          <Text style={styles.itemTitle}>{item.nome}</Text>
          <Text style={styles.itemSubtitle}>Curso: {curso?.nome}</Text>
          <Text style={styles.itemSubtitle}>Prof.: {prof?.nome}</Text>
        </View>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.editButton}>
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
        data={disciplinas}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text>Nenhuma disciplina cadastrada.</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <Text style={styles.addButtonText}>+ Nova Disciplina</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editing ? 'Editar Disciplina' : 'Nova Disciplina'}
            </Text>
            <TextInput
              placeholder="Nome da Disciplina"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
            <Picker
              selectedValue={cursoId}
              onValueChange={setCursoId}
              style={styles.picker}
            >
              {courses.map(c => (
                <Picker.Item key={c.id} label={c.nome} value={c.id.toString()} />
              ))}
            </Picker>
            <Picker
              selectedValue={professorId}
              onValueChange={setProfessorId}
              style={styles.picker}
            >
              {professores.map(p => (
                <Picker.Item key={p.id} label={p.nome} value={p.id.toString()} />
              ))}
            </Picker>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={save} style={styles.saveButton}>
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

export default DisciplinasScreen;
