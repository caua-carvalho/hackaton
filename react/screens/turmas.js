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

const API_URL = 'http://hospedagem-hackathon7.infinityfreeapp.com/api/adm/';

const TurmasScreen = () => {
  const [turmas, setTurmas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nome, setNome] = useState('');
  const [divisao, setDivisao] = useState('');
  const [cursoCd, setCursoCd] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [turmaRes, cursoRes] = await Promise.all([
        fetch(`${API_URL}/turmas/turmas.php`),
        fetch(`${API_URL}/cursos/cursos.php`),
      ]);
      const turmaJson = await turmaRes.json();
      const cursoJson = await cursoRes.json();

      setTurmas(turmaJson.turmas || []);
      setCursos(cursoJson.cursos || []);
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
      setDivisao(item.divisao);
      setCursoCd(item.curso_cd.toString());
    } else {
      setEditing(null);
      setNome('');
      setDivisao('');
      setCursoCd(cursos[0]?.id.toString() || '');
    }
    setModalVisible(true);
  };

  const save = async () => {
    if (!nome.trim() || !divisao.trim() || !cursoCd) {
      Alert.alert('Validação', 'Preencha todos os campos');
      return;
    }

    const payload = { nome, divisao, curso_cd: cursoCd };
    let url = `${API_URL}/turmas/turmas_create.php`;
    if (editing) {
      payload.id = editing.id;
      url = `${API_URL}/turmas/turmas_update.php`;
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
        Alert.alert('Erro', data.message || 'Falha ao salvar turma');
      }
    } catch (e) {
      console.error('[save] error:', e);
      Alert.alert('Erro', 'Falha na comunicação');
    }
  };

  const renderItem = ({ item }) => {
    const curso = cursos.find(c => c.id === item.curso_cd);
    return (
      <View style={styles.item}>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{item.nome}</Text>
          <Text style={styles.itemSubtitle}>Divisão: {item.divisao}</Text>
          <Text style={styles.itemSubtitle}>Curso: {curso?.nome}</Text>
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
        data={turmas}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text>Nenhuma turma cadastrada.</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <Text style={styles.addButtonText}>+ Nova Turma</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editing ? 'Editar Turma' : 'Nova Turma'}
            </Text>
            <TextInput
              placeholder="Nome"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
            <TextInput
              placeholder="Divisão"
              placeholderTextColor="#999"
              value={divisao}
              onChangeText={setDivisao}
              style={styles.input}
              maxLength={1}
            />
            <Picker
              selectedValue={cursoCd}
              onValueChange={setCursoCd}
              style={styles.picker}
            >
              {cursos.map(c => (
                <Picker.Item key={c.id} label={c.nome} value={c.id.toString()} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    elevation: 1
  },
  textContainer: { flex: 1, marginRight: 10 },
  itemTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  itemSubtitle: { fontSize: 14, color: '#666', marginBottom: 2 },
  editButton: { padding: 8 },
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
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 10, marginBottom: 12 },
  picker: { marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { marginRight: 12 },
  saveText: { color: '#b20000', fontWeight: '500' },
  cancelButton: {},
  cancelText: { color: '#666' }
});

export default TurmasScreen;
