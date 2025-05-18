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
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://hospedagem-hackathon7.infinityfreeapp.com/api/adm';

export default function DisciplinasScreen() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [courses, setCourses] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nome, setNome] = useState('');
  const [cursoCd, setCursoCd] = useState('');
  const [professorCd, setProfessorCd] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [discRes, cursoRes, profRes] = await Promise.all([
        fetch(`${API_URL}/disciplinas/disciplinas.php`),
        fetch(`${API_URL}/cursos/cursos.php`),
        fetch(`${API_URL}/professores/professores.php`),
      ]);
      const discJson = await discRes.json();
      const cursoJson = await cursoRes.json();
      const profJson = await profRes.json();

      setDisciplinas(discJson.disciplinas || []);
      setCourses(cursoJson.cursos || []);
      setProfessores(profJson.professores || []);
    } catch (e) {
      console.error('[fetchData] error:', e);
      Alert.alert('Erro', 'Não foi possível carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setNome(item.nome);
      setCursoCd(item.curso_cd.toString());
      setProfessorCd(item.professor_cd.toString());
    } else {
      setEditing(null);
      setNome('');
      setCursoCd(courses[0]?.id.toString() || '');
      setProfessorCd(professores[0]?.id.toString() || '');
    }
    setModalVisible(true);
  };

  const saveDisciplina = async () => {
    if (!nome.trim()) {
      Alert.alert('Validação', 'Informe o nome da disciplina');
      return;
    }
    if (!cursoCd) {
      Alert.alert('Validação', 'Selecione um curso');
      return;
    }
    if (!professorCd) {
      Alert.alert('Validação', 'Selecione um professor');
      return;
    }

    const payload = { nome, curso_cd: cursoCd, professor_cd: professorCd };
    let url = `${API_URL}/disciplinas/disciplinas_create.php`;
    if (editing) {
      payload.id = editing.id;
      url = `${API_URL}/disciplinas/disciplinas_update.php`;
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
      console.error('[saveDisciplina] error:', e);
      Alert.alert('Erro', 'Falha na comunicação');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.nome}</Text>
        <Text style={styles.subtitle}>Turma: {item.turma_nome}</Text>
        <Text style={styles.subtitle}>Professor: {item.professor_nome}</Text>
      </View>
      <TouchableOpacity onPress={() => openModal(item)} style={styles.iconButton}>
        <MaterialIcons name="edit" size={24} color="#b20000" />
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
        data={disciplinas}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma disciplina cadastrada.</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editing ? 'Editar Disciplina' : 'Nova Disciplina'}
            </Text>
            <TextInput
              placeholder="Nome da Disciplina"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={cursoCd}
                onValueChange={setCursoCd}
                style={styles.picker}
              >
                {courses.map(c => (
                  <Picker.Item key={c.id} label={c.nome} value={c.id.toString()} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={professorCd}
                onValueChange={setProfessorCd}
                style={styles.picker}
              >
                {professores.map(p => (
                  <Picker.Item key={p.id} label={p.nome} value={p.id.toString()} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={saveDisciplina} style={styles.saveButton}>
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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16, paddingBottom: 100 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  textContainer: { flex: 1, marginRight: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#283337', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 2 },
  iconButton: { padding: 8 },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#b20000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 32, color: '#666' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 8, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#283337', marginBottom: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 12, marginBottom: 16, fontSize: 16, color: '#283337' },
  pickerWrapper: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 16, overflow: 'hidden' },
  picker: { width: '100%' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { backgroundColor: '#b20000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 4, marginRight: 12 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cancelButton: {},
  cancelText: { color: '#b20000', fontSize: 14 }
});
