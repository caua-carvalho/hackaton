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

const API_URL = 'http://hospedagem-hackathon7.infinityfreeapp.com/api/adm/professores';

const ProfessoresScreen = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [name, setName] = useState('');
  const [apelido, setApelido] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/professores.php`);
      console.log('[fetchTeachers] status', res.status);
      const text = await res.text();
      console.log('[fetchTeachers] raw:', text);
      const json = JSON.parse(text);
      setTeachers(json.professores || []);
    } catch (e) {
      console.error('[fetchTeachers] error:', e);
      Alert.alert('Erro', 'Não foi possível carregar professores');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setName(teacher.nome);
      setApelido(teacher.apelido);
      setEmail(teacher.email);
    } else {
      setEditingTeacher(null);
      setName('');
      setApelido('');
      setEmail('');
    }
    setModalVisible(true);
  };

  const saveTeacher = async () => {
    if (!name.trim() || !apelido.trim() || !email.trim()) {
      Alert.alert('Validação', 'Todos os campos são obrigatórios');
      return;
    }

    const payload = { nome: name, apelido, email };
    const url = editingTeacher
      ? `${API_URL}/professores_update.php`
      : `${API_URL}/professores_create.php`;
    if (editingTeacher) payload.id = editingTeacher.id;

    try {
      console.log('[saveTeacher] POST', url, payload);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('[saveTeacher] status', res.status);
      const text = await res.text();
      console.log('[saveTeacher] raw:', text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('[saveTeacher] parse error:', err);
        Alert.alert('Erro', 'Resposta inválida do servidor');
        return;
      }

      if (res.ok && data.success) {
        fetchTeachers();
        setModalVisible(false);
      } else {
        console.warn('[saveTeacher] fail:', data);
        Alert.alert('Erro', data.message || 'Falha ao salvar');
      }
    } catch (e) {
      console.error('[saveTeacher] network error:', e);
      Alert.alert('Erro', 'Falha na comunicação');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{item.nome}</Text>
        <Text style={styles.itemSubtitle}>Apelido: {item.apelido}</Text>
        <Text style={styles.itemSubtitle}>Email: {item.email}</Text>
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
        data={teachers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text>Nenhum professor cadastrado.</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <Text style={styles.addButtonText}>+ Novo Professor</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTeacher ? 'Editar Professor' : 'Novo Professor'}
            </Text>
            <TextInput
              placeholder="Nome"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Apelido"
              placeholderTextColor="#999"
              value={apelido}
              onChangeText={setApelido}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={saveTeacher} style={styles.saveButton}>
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
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { marginRight: 12 },
  saveText: { color: '#b20000', fontWeight: '500' },
  cancelButton: {},
  cancelText: { color: '#666' }
});

export default ProfessoresScreen;
