import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AdminHomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userName = 'Administrador' } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Header com menu hamburger e logo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>les.logo}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Saudação personalizada */}
        <Text style={styles.greeting}>Olá, {userName}!</Text>

        {/* Card: Horários de Hoje */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horários de Hoje</Text>
          {/* TODO: mapear dados de horários */}
        </View>

        {/* Card: Alertas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alertas</Text>
          {/* TODO: mapear alertas críticos */}
        </View>

        {/* Ações Rápidas */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Cursos')}
          >
            <Text style={styles.actionText}>Cursos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Professores')}
          >
            <Text style={styles.actionText}>Professores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Disciplinas')}
          >
            <Text style={styles.actionText}>Disciplinas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Horarios')}
          >
            <Text style={styles.actionText}>Horários</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#b20000',
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  content: {
    padding: 15
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10
  },
  actionsContainer: {
    marginTop: 10
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500'
  }
});

export default AdminHomeScreen;
