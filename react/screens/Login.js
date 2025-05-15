import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = '#b20000';
const BACKGROUND_COLOR = '#ffffff';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('admin@etec.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      showSnackbar('Preencha todos os campos!');
      return;
    }

    setLoading(true);
    const url =
      'http://hospedagem-hackathon7.infinityfreeapp.com/api/validacao_usuario.php';

    let wasServerTimeout = false;
    const timeout = setTimeout(() => {
      wasServerTimeout = true;
      setLoading(false);
      showSnackbar('Tempo de resposta do servidor excedido');
    }, 10000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      clearTimeout(timeout);
      if (wasServerTimeout) return;

      const text = await response.text();
      let data: any;
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first !== -1 && last !== -1) {
        const jsonStr = text.substring(first, last + 1);
        try {
          data = JSON.parse(jsonStr);
        } catch {
          showSnackbar('Resposta inválida do servidor');
          setLoading(false);
          return;
        }
      } else {
        showSnackbar('Resposta inválida do servidor');
        setLoading(false);
        return;
      }

      if (response.ok && data.token) {
        showSnackbar('Login bem-sucedido!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminHome', params: { userName: username } }],
        });
      } else {
        showSnackbar(data.message || 'Credenciais inválidas');
      }
    } catch (error) {
      clearTimeout(timeout);
      if (!wasServerTimeout) {
        const msg = error instanceof Error ? error.message : 'Erro desconhecido';
        showSnackbar('Erro de conexão: ' + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Login</Text>
        {loading && <ActivityIndicator size="large" color={PRIMARY_COLOR} />}
        <TextInput
          style={styles.input}
          placeholder="Usuário"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{ label: 'Fechar', onPress: () => setSnackbarVisible(false) }}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

// **ATENÇÃO**: o objeto styles precisa ficar **fora** do componente,
// para estar disponível no JSX acima.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'center',
    padding: 16,
  },
  innerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  snackbar: {
    backgroundColor: PRIMARY_COLOR,
  },
});
